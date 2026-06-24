(() => {
  const { clamp } = window.GameRandom;

  // Soft activity model: there is no hard cap on actions per year. Instead each
  // action adds to the yearly activity load, which builds fatigue. Fatigue lowers
  // efficiency of further actions and, at year end, can damage health/mental state.

  const SOFT_COMFORT_LOAD = 6; // actions before fatigue starts to bite noticeably

  function recordActionUse(state, key = null, cost = 1) {
    state.yearlyActionCount = (state.yearlyActionCount || 0) + 1;
    state.yearlyActivityLoad = (state.yearlyActivityLoad || 0) + cost;
    if (key) {
      state.repeatedActions = state.repeatedActions || {};
      state.repeatedActions[key] = (state.repeatedActions[key] || 0) + 1;
    }
    state.actionFatigue = computeFatigue(state);
  }

  function computeFatigue(state) {
    const load = state.yearlyActivityLoad || 0;
    const over = Math.max(0, load - SOFT_COMFORT_LOAD);
    // mild quadratic ramp once past the comfort zone
    const raw = over * 6 + over * over * 1.4;
    const resilience = 1 - clamp((state.discipline || 0) + (state.energy || 0) * 0.5, 0, 150) / 400;
    return clamp(Math.round(raw * resilience), 0, 100);
  }

  // efficiency 0.25..1: repeated identical actions in one year yield diminishing returns,
  // and high fatigue lowers everything.
  function getActionEfficiency(state, key = null) {
    let eff = 1 - (state.actionFatigue || 0) / 160;
    if (key) {
      const reps = (state.repeatedActions && state.repeatedActions[key]) || 0;
      eff *= 1 / (1 + reps * 0.45);
    }
    return clamp(eff, 0.25, 1);
  }

  function canPerformAction(state, cost = 1) {
    return !state.event && !state.deceased;
  }

  function fatigueLabel(state) {
    const f = state.actionFatigue || 0;
    if (f < 15) return { level: "fresh", text: "Бодрость", kind: "success" };
    if (f < 40) return { level: "active", text: "В тонусе", kind: "" };
    if (f < 65) return { level: "tired", text: "Усталость", kind: "risk" };
    if (f < 85) return { level: "exhausted", text: "Истощение", kind: "danger" };
    return { level: "burnout", text: "Грань выгорания", kind: "danger" };
  }

  // ---- Life stages & age-adaptive availability -------------------------------
  // Sandbox philosophy: age should shape HOW an action plays (effect, framing,
  // risk), not slam a wall in front of the player. Adult-only themes stay hard
  // gated at 18; everything else becomes a soft, adapted experience.

  const LIFE_STAGES = [
    { id: "infant", label: "Младенчество", min: 0, max: 2 },
    { id: "child", label: "Детство", min: 3, max: 6 },
    { id: "kid", label: "Школьник", min: 7, max: 12 },
    { id: "teen", label: "Подросток", min: 13, max: 17 },
    { id: "youngAdult", label: "Молодость", min: 18, max: 24 },
    { id: "adult", label: "Взрослая жизнь", min: 25, max: 59 },
    { id: "senior", label: "Зрелость", min: 60, max: 200 },
  ];

  // How many years early a non-adult action may start, with a fading effect.
  const EARLY_GRACE = 4;

  function getLifeStageContext(state) {
    const age = (state && state.age) || 0;
    const stage = LIFE_STAGES.find((s) => age >= s.min && age <= s.max) || LIFE_STAGES[LIFE_STAGES.length - 1];
    return {
      age,
      stage: stage.id,
      label: stage.label,
      isMinor: age < 18,
      isAdult: age >= 18,
      isChild: age < 13,
      isTeen: age >= 13 && age < 18,
      isSenior: age >= 60,
    };
  }

  // An action is hard-locked by age only when it is genuinely adult-restricted.
  function isAdultRestricted(action) {
    if (!action) return false;
    if (action.adultOnly) return true;
    if (action.ageRestriction === "adult") return true;
    // minAge of 18+ marks an adult-life action (alcohol, loans, nightlife, etc.).
    if (typeof action.minAge === "number" && action.minAge >= 18) return true;
    return false;
  }

  // Decide availability + how the action should feel at the player's age.
  // Returns { available, hardBlocked, adapted, ageFactor, reason, title, description }.
  function adaptActionForAge(state, action) {
    const ctx = getLifeStageContext(state);
    const out = {
      available: true,
      hardBlocked: false,
      adapted: false,
      ageFactor: 1,
      reason: "",
      title: action.title,
      description: action.description || "",
    };
    if (!action) return out;

    // Hard adult gate — never soften these.
    if (isAdultRestricted(action)) {
      if (ctx.age < 18) {
        out.available = false;
        out.hardBlocked = true;
        out.reason = "Доступно с 18 лет.";
      }
      return out;
    }

    // Natural upper window (childhood milestones) stays a real ceiling so adults
    // don't see "learn to walk". This is content scoping, not a frustrating wall.
    if (typeof action.maxAge === "number" && ctx.age > action.maxAge) {
      out.available = false;
      out.reason = "Этот этап жизни уже позади.";
      return out;
    }

    // Soft lower window: let the player start a bit early as a "child version".
    if (typeof action.minAge === "number" && ctx.age < action.minAge) {
      const yearsEarly = action.minAge - ctx.age;
      if (yearsEarly > EARLY_GRACE) {
        out.available = false;
        out.reason = `Пока рано — лучше с ${action.minAge} лет.`;
        return out;
      }
      out.adapted = true;
      out.ageFactor = clamp(1 - yearsEarly * 0.18, 0.4, 1);
      out.reason = "Ранний, детский вариант — эффект слабее.";
      out.description = `Детский вариант. ${out.description}`.trim();
    }

    return out;
  }

  // Scale an action's numeric effects by how age-appropriate it is right now.
  function getAgeAdjustedEffects(state, action) {
    const adapt = adaptActionForAge(state, action);
    const base = action && action.effects ? action.effects : {};
    if (adapt.ageFactor >= 0.999) return { effects: base, ageFactor: 1, adapted: adapt.adapted };
    const scaleObj = (obj) => {
      const out = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === "skills" && value && typeof value === "object") {
          out[key] = scaleObj(value);
        } else if (typeof value === "number") {
          out[key] = value > 0 ? Math.max(1, Math.round(value * adapt.ageFactor)) : Math.round(value * adapt.ageFactor);
        } else {
          out[key] = value;
        }
      }
      return out;
    };
    return { effects: scaleObj(base), ageFactor: adapt.ageFactor, adapted: adapt.adapted };
  }

  function resetYearlyActionLoad(state) {
    state.yearlyActionCount = 0;
    state.yearlyActivityLoad = 0;
    state.repeatedActions = {};
    state.lastActionResults = [];
    // fatigue partially carries over, recovers across the year
    state.actionFatigue = clamp(Math.round((state.actionFatigue || 0) * 0.35), 0, 100);
  }

  // End-of-year consequences from how hard the year was lived.
  function applyYearlyFatigueConsequences(state) {
    const load = state.yearlyActivityLoad || 0;
    const fatigue = state.actionFatigue || 0;
    const messages = [];
    if (load <= SOFT_COMFORT_LOAD && fatigue < 20) {
      // calm year: small recovery
      state.energy = clamp((state.energy || 0) + 4, 0, 100);
      state.mental = clamp((state.mental || 0) + 2, 0, 100);
      return messages;
    }
    if (fatigue >= 35) {
      const over = Math.max(0, load - SOFT_COMFORT_LOAD);
      state.energy = clamp((state.energy || 0) - Math.round(over * 1.6), 0, 100);
      state.stress = clamp((state.stress || 0) + Math.round(over * 1.4), 0, 100);
      if (typeof state.sleep === "number") state.sleep = clamp(state.sleep - Math.round(over), 0, 100);
      messages.push("Год был очень насыщенным — накопилась усталость.");
    }
    if (fatigue >= 65) {
      state.mental = clamp((state.mental || 0) - Math.round((fatigue - 60) * 0.3), 0, 100);
      state.health = clamp((state.health || 0) - Math.round((fatigue - 60) * 0.2), 0, 100);
      messages.push("Перегрузка ударила по здоровью и нервам.");
    }
    if (fatigue >= 85 && (window.GameRandom?.roll?.(100) || 0) < 35) {
      state.health = clamp((state.health || 0) - 8, 0, 100);
      if (window.GameState?.addDanger) window.GameState.addDanger(10);
      messages.push("Из-за выгорания случилась травма/срыв.");
    }
    return messages;
  }

  window.GameActionLoad = {
    SOFT_COMFORT_LOAD,
    recordActionUse,
    computeFatigue,
    getActionEfficiency,
    canPerformAction,
    fatigueLabel,
    resetYearlyActionLoad,
    applyYearlyFatigueConsequences,
    LIFE_STAGES,
    getLifeStageContext,
    isAdultRestricted,
    adaptActionForAge,
    getAgeAdjustedEffects,
  };
})();
