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
  };
})();
