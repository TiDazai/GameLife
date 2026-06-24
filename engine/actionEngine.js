(() => {
  const Conditions = () => window.GameEventConditions;
  const Effects = () => window.GameEventEffects;
  const Load = () => window.GameActionLoad;

  function allActions() {
    return Array.isArray(window.GameActionData) ? window.GameActionData : [];
  }

  function getActionById(id) {
    return allActions().find((action) => action.id === id) || null;
  }

  function isAdultAllowed(state) {
    return (state.age || 0) >= 18;
  }

  // Age availability is delegated to the soft life-stage model when present:
  // adult-only content stays hard-gated at 18, ordinary actions become soft
  // (start a little early as a "child version", fade out past their natural window).
  function meetsBasics(state, action) {
    const Adapt = Load()?.adaptActionForAge;
    if (Adapt) return Adapt(state, action).available;
    // Fallback to the legacy hard gate if the life-stage helper is unavailable.
    if (action.minAge !== undefined && state.age < action.minAge) return false;
    if (action.maxAge !== undefined && state.age > action.maxAge) return false;
    if (action.adultOnly && !isAdultAllowed(state)) return false;
    return true;
  }

  function isAvailable(state, action) {
    if (!meetsBasics(state, action)) return false;
    if (action.conditions && Conditions()?.checkConditions) {
      if (!Conditions().checkConditions(state, action.conditions)) return false;
    }
    return true;
  }

  function getAvailableActions(state, options = {}) {
    const list = allActions().filter((action) => isAvailable(state, action));
    if (options.category) return list.filter((action) => action.category === options.category);
    return list;
  }

  function categories(state) {
    const set = new Map();
    getAvailableActions(state).forEach((action) => {
      const key = action.category || "other";
      set.set(key, (set.get(key) || 0) + 1);
    });
    return Array.from(set.entries()).map(([id, count]) => ({ id, count }));
  }

  // Flatten { skills: { logic: 2 } } into top-level logic:2 so eventEffects applies them.
  function flattenEffects(effects) {
    if (!effects) return {};
    const out = {};
    for (const [key, value] of Object.entries(effects)) {
      if (key === "skills" && value && typeof value === "object") {
        for (const [skillId, amount] of Object.entries(value)) out[skillId] = amount;
      } else {
        out[key] = value;
      }
    }
    return out;
  }

  // Scale numeric stat effects by efficiency. Money/flags/criminalRecord are not scaled.
  const SCALE_EXEMPT = new Set(["money", "personalMoney", "familyMoney", "debt", "taxDebt", "flags", "removeFlags", "criminalRecord", "danger", "careerPromotion", "careerFired", "careerDemotion", "healthCondition", "addHealthCondition", "removeHealthCondition", "relationshipStart"]);

  function scaleEffects(effects, efficiency) {
    if (efficiency >= 0.999) return effects;
    const out = {};
    for (const [key, value] of Object.entries(effects)) {
      if (SCALE_EXEMPT.has(key) || typeof value !== "number") {
        out[key] = value;
      } else {
        const scaled = value * efficiency;
        out[key] = value > 0 ? Math.max(1, Math.round(scaled)) : Math.min(-0, Math.round(scaled));
      }
    }
    return out;
  }

  function canPerform(state, action) {
    if (!action) return false;
    if (state.event || state.deceased) return false;
    if (!isAvailable(state, action)) return false;
    const moneyCost = action.cost?.money || 0;
    if (moneyCost > 0 && (state.personalMoney || 0) < moneyCost) return false;
    return true;
  }

  function performAction(state, actionId, rng = Math.random) {
    const action = getActionById(actionId);
    if (!action) return { ok: false, reason: "not_found" };
    if (!canPerform(state, action)) return { ok: false, reason: "unavailable" };

    const moneyCost = action.cost?.money || 0;
    if (moneyCost > 0) {
      if (window.GameState?.pay) window.GameState.pay(moneyCost);
      else state.personalMoney = Math.max(0, (state.personalMoney || 0) - moneyCost);
    }

    const dimKey = action.diminishingReturnsKey || action.cooldownKey || action.id;
    let efficiency = Load()?.getActionEfficiency ? Load().getActionEfficiency(state, dimKey) : 1;
    // A too-early "child version" of an action contributes less than the real thing.
    const ageFactor = Load()?.adaptActionForAge ? Load().adaptActionForAge(state, action).ageFactor : 1;
    if (ageFactor < 1) efficiency *= ageFactor;

    let resultText = action.resultTexts?.success || action.description || "";
    let kind = "success";
    let failed = false;

    const baseEffects = flattenEffects(action.effects);
    // Standard: cost.money is the price of the action. Drop a duplicate money effect
    // that merely mirrors the cost (effects.money === -cost.money) to avoid double charge.
    // A differing effects.money (e.g. a relocation bonus) is kept as extra income/penalty.
    if (moneyCost > 0 && Number(baseEffects.money) === -moneyCost) {
      delete baseEffects.money;
    }
    // Top-level flags/removeFlags are applied alongside effects (eventEffects handles them).
    if (Array.isArray(action.flags) && action.flags.length) baseEffects.flags = action.flags;
    if (Array.isArray(action.removeFlags) && action.removeFlags.length) baseEffects.removeFlags = action.removeFlags;
    Effects()?.applyEffects?.(state, scaleEffects(baseEffects, efficiency), rng);

    if (action.risk && typeof action.risk.chance === "number" && rng() < action.risk.chance) {
      failed = true;
      kind = "danger";
      Effects()?.applyEffects?.(state, flattenEffects(action.risk.effects || {}), rng);
      resultText = action.risk.resultText || action.resultTexts?.risk || "Что-то пошло не так.";
    }

    // record load + log
    if (Load()?.recordActionUse) Load().recordActionUse(state, dimKey, action.cost?.load || 1);
    else if (window.GameState?.spendAction) window.GameState.spendAction(1);

    state.lastActionResults = state.lastActionResults || [];
    state.lastActionResults.unshift({ id: action.id, title: action.title, kind, text: resultText });
    state.lastActionResults = state.lastActionResults.slice(0, 12);

    if (window.GameState?.addLog) {
      window.GameState.addLog(`${action.title}: ${resultText}`);
    }

    // story arc + goal hooks
    window.GameStoryArcs?.onAction?.(state, action, { failed });
    window.GameLifeGoals?.onAction?.(state, action, { failed });

    if (window.GameState?.requestRender) window.GameState.requestRender();
    return { ok: true, failed, kind, resultText, efficiency };
  }

  window.GameActionEngine = {
    allActions,
    getActionById,
    getAvailableActions,
    categories,
    isAvailable,
    canPerform,
    performAction,
  };
})();
