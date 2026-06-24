(() => {
  const { clamp } = window.GameRandom;

  const bounded = ["health", "mental", "stress", "energy", "fitness", "sleep", "immunity"];

  function catalog() {
    return window.GameData.healthConditionCatalog || [];
  }

  function conditionById(id) {
    return catalog().find((item) => item.id === id) || null;
  }

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeCondition(raw = {}) {
    const condition = conditionById(raw.id) || {};
    return {
      id: raw.id || condition.id,
      title: raw.title || condition.title || raw.id || "Состояние",
      severity: clamp(safeNumber(raw.severity, condition.severity || 1), 1, 5),
      yearsActive: Math.max(0, Math.floor(safeNumber(raw.yearsActive))),
      treatedThisYear: Boolean(raw.treatedThisYear),
      source: raw.source || "risk",
      history: Array.isArray(raw.history) ? raw.history.slice(-10) : [],
    };
  }

  function normalizeHabits(raw = {}) {
    return {
      smoking: Boolean(raw.smoking),
      alcohol: clamp(safeNumber(raw.alcohol, 15), 0, 100),
      activity: clamp(safeNumber(raw.activity, 45), 0, 100),
      nutrition: clamp(safeNumber(raw.nutrition, 50), 0, 100),
      screenTime: clamp(safeNumber(raw.screenTime, 45), 0, 100),
    };
  }

  function normalizeHealthState(state, original = state) {
    const profile = original.healthProfile || {};
    state.healthProfile = {
      health: clamp(safeNumber(profile.health, original.health ?? 82), 0, 100),
      mental: clamp(safeNumber(profile.mental, original.mental ?? 78), 0, 100),
      stress: clamp(safeNumber(profile.stress, original.stress ?? 4), 0, 100),
      energy: clamp(safeNumber(profile.energy, original.energy ?? 72), 0, 100),
      fitness: clamp(safeNumber(profile.fitness, original.skills?.fitness ?? 35), 0, 100),
      sleep: clamp(safeNumber(profile.sleep, 68), 0, 100),
      immunity: clamp(safeNumber(profile.immunity, Math.floor((original.health ?? 75) * 0.55 + 20)), 0, 100),
      chronicConditions: Array.isArray(profile.chronicConditions) ? profile.chronicConditions.map(normalizeCondition) : [],
      injuries: Array.isArray(profile.injuries) ? profile.injuries.map(normalizeCondition) : [],
      activeConditions: Array.isArray(profile.activeConditions) ? profile.activeConditions.map(normalizeCondition) : [],
      habits: normalizeHabits(profile.habits),
      treatmentHistory: Array.isArray(profile.treatmentHistory) ? profile.treatmentHistory.slice(0, 36) : [],
      lastYearSummary: profile.lastYearSummary || null,
    };
    syncLegacy(state);
    return state.healthProfile;
  }

  function syncLegacy(state) {
    const profile = state.healthProfile;
    if (!profile) return;
    state.health = clamp(profile.health, 0, 100);
    state.mental = clamp(profile.mental, 0, 100);
    state.stress = clamp(profile.stress, 0, 100);
    state.energy = clamp(profile.energy, 0, 100);
    if (state.skills) state.skills.fitness = clamp(profile.fitness, 0, 100);
  }

  function allStateConditions(state) {
    const profile = state.healthProfile || normalizeHealthState(state, state);
    return [...profile.activeConditions, ...profile.chronicConditions, ...profile.injuries];
  }

  function hasCondition(state, id) {
    return allStateConditions(state).some((item) => item.id === id);
  }

  function bucketFor(condition) {
    if (condition.bucket === "chronic") return "chronicConditions";
    if (condition.bucket === "injury") return "injuries";
    return "activeConditions";
  }

  function addCondition(state, conditionId, source = "risk") {
    if (!state.healthProfile) normalizeHealthState(state, state);
    const condition = conditionById(conditionId);
    if (!condition || hasCondition(state, conditionId) || state.age < condition.minAge) return { ok: false };
    const entry = normalizeCondition({ id: condition.id, title: condition.title, severity: condition.severity, source });
    state.healthProfile[bucketFor(condition)].push(entry);
    addTreatmentHistory(state, `Появилось состояние: ${condition.title}.`);
    syncLegacy(state);
    return { ok: true, condition: entry };
  }

  function removeCondition(state, conditionId) {
    const profile = state.healthProfile;
    ["activeConditions", "chronicConditions", "injuries"].forEach((key) => {
      profile[key] = profile[key].filter((item) => item.id !== conditionId);
    });
    syncLegacy(state);
  }

  function factorApplies(state, factors = {}) {
    const profile = state.healthProfile;
    if (factors.minAge !== undefined && state.age < factors.minAge) return false;
    if (factors.minStress !== undefined && profile.stress < factors.minStress) return false;
    if (factors.maxMental !== undefined && profile.mental > factors.maxMental) return false;
    if (factors.maxEnergy !== undefined && profile.energy > factors.maxEnergy) return false;
    if (factors.maxSleep !== undefined && profile.sleep > factors.maxSleep) return false;
    if (factors.maxImmunity !== undefined && profile.immunity > factors.maxImmunity) return false;
    if (factors.maxFitness !== undefined && profile.fitness > factors.maxFitness) return false;
    if (factors.minFitness !== undefined && profile.fitness < factors.minFitness) return false;
    if (factors.maxHealth !== undefined && profile.health > factors.maxHealth) return false;
    if (factors.minRisk !== undefined && (state.traits?.risk || 0) < factors.minRisk) return false;
    if (factors.hasInjury && !profile.injuries.length) return false;
    if (factors.lowActivity && profile.habits.activity > 35) return false;
    if (factors.highActivity && profile.habits.activity < 78) return false;
    if (factors.poorNutrition && profile.habits.nutrition > 40) return false;
    if (factors.highScreenTime && profile.habits.screenTime < 70) return false;
    return true;
  }

  function conditionRisk(state, condition) {
    if (!condition || hasCondition(state, condition.id) || state.age < condition.minAge || state.deceased) return 0;
    if (!factorApplies(state, condition.riskFactors)) return 0;
    const profile = state.healthProfile;
    const age = Math.max(0, state.age - condition.minAge) / 1600;
    const stress = Math.max(0, profile.stress - 35) / 900;
    const sleep = Math.max(0, 65 - profile.sleep) / 1100;
    const immunity = Math.max(0, 65 - profile.immunity) / 1200;
    const habit = Math.max(0, 45 - profile.habits.activity) / 1800 + Math.max(0, 45 - profile.habits.nutrition) / 1800;
    const severity = condition.severity / 900;
    return clamp(0.003 + age + stress + sleep + immunity + habit + severity, 0, 0.32);
  }

  function getConditionRisks(state) {
    normalizeHealthState(state, state);
    return catalog().map((condition) => ({ condition, risk: conditionRisk(state, condition) })).filter((entry) => entry.risk > 0);
  }

  function applyEffects(state, effects = {}) {
    const profile = state.healthProfile || normalizeHealthState(state, state);
    Object.entries(effects || {}).forEach(([key, amount]) => {
      if (["health", "mental", "stress", "energy"].includes(key) && Number.isFinite(Number(state[key]))) {
        profile[key] = clamp(safeNumber(state[key]), 0, 100);
      }
      if (key === "fitness" && Number.isFinite(Number(state.skills?.fitness))) {
        profile.fitness = clamp(safeNumber(state.skills.fitness), 0, 100);
      }
      if (bounded.includes(key)) profile[key] = clamp(safeNumber(profile[key]) + safeNumber(amount), 0, 100);
      else if (key === "careerBurnout" && state.career) state.career.burnout = clamp((state.career.burnout || 0) + safeNumber(amount), 0, 100);
      else if (key in state) window.GameState?.change ? window.GameState.change({ [key]: amount }) : state[key] += amount;
      else if (state.skills && key in state.skills) state.skills[key] = clamp((state.skills[key] || 0) + safeNumber(amount), 0, 100);
    });
    syncLegacy(state);
  }

  function insuranceDiscount(state) {
    const id = state.documents?.insurance || "none";
    if (id === "premium") return 0.35;
    if (id === "basic") return 0.65;
    if (id === "family" && state.age < 18) return 0.55;
    return 1;
  }

  function treatmentCost(state, condition, treatment) {
    const cityCost = window.GameState?.cityData?.(state)?.cost || 1;
    const modifier = condition.costModifier || 1;
    return Math.floor((treatment.baseCost || 0) * cityCost * modifier * insuranceDiscount(state));
  }

  function treatCondition(state, conditionId, treatmentId, rng = Math.random) {
    normalizeHealthState(state, state);
    const condition = conditionById(conditionId);
    const active = allStateConditions(state).find((item) => item.id === conditionId);
    const treatment = condition?.treatmentOptions.find((item) => item.id === treatmentId);
    if (!condition || !active || !treatment || !window.GameState?.canAct?.()) return { ok: false, text: "Лечение недоступно." };
    const cost = treatmentCost(state, condition, treatment);
    if (cost > 0 && state.personalMoney + state.familyMoney < cost) return { ok: false, text: "Не хватает денег на лечение." };
    window.GameState.spendAction();
    if (cost > 0) {
      if (state.age < 18 && state.familyMoney >= cost) state.familyMoney -= cost;
      else if (window.GameEconomyEngine?.payExpense) window.GameEconomyEngine.payExpense(state, `лечение: ${condition.title}`, cost, { loanType: "consumer" });
      else window.GameState.payOrDebt?.(cost);
    }
    applyEffects(state, treatment.effects);
    active.treatedThisYear = true;
    const success = rng() < treatment.successChance + Math.max(0, state.healthProfile.immunity - 60) / 300;
    if (success) removeCondition(state, conditionId);
    addTreatmentHistory(state, `${treatment.title}: ${condition.title}, ${cost ? window.GameState.fmt(cost) : "без расходов"}${success ? ", состояние закрыто" : ""}.`);
    if (window.GameState?.notify) window.GameState.notify(success ? `${condition.title}: лечение помогло.` : `${condition.title}: стало легче, но нужно наблюдать дальше.`);
    return { ok: true, cost, success };
  }

  function updateHabits(state, changes = {}) {
    normalizeHealthState(state, state);
    Object.entries(changes).forEach(([key, amount]) => {
      if (key === "smoking") state.healthProfile.habits.smoking = Boolean(amount);
      else if (key in state.healthProfile.habits) state.healthProfile.habits[key] = clamp(state.healthProfile.habits[key] + safeNumber(amount), 0, 100);
    });
    addTreatmentHistory(state, "Привычки изменены.");
    syncLegacy(state);
  }

  function applyYearlyBaseline(state) {
    const profile = state.healthProfile;
    const habits = profile.habits;
    const agePressure = state.age > 55 ? -2 : state.age > 35 ? -1 : 0;
    const sleepEffect = profile.sleep < 45 ? -4 : profile.sleep > 75 ? 2 : 0;
    const stressEffect = profile.stress > 70 ? -4 : profile.stress < 30 ? 1 : 0;
    const activityEffect = habits.activity > 65 ? 2 : habits.activity < 30 ? -2 : 0;
    const nutritionEffect = habits.nutrition > 65 ? 2 : habits.nutrition < 35 ? -2 : 0;
    applyEffects(state, {
      health: agePressure + sleepEffect + stressEffect + activityEffect + nutritionEffect,
      immunity: sleepEffect + nutritionEffect + (profile.stress > 75 ? -3 : 1),
      energy: (profile.sleep > 70 ? 3 : -2) + (profile.health > 70 ? 1 : -1),
      mental: profile.stress > 65 ? -3 : profile.sleep > 70 ? 1 : 0,
      fitness: activityEffect,
      sleep: profile.stress > 70 ? -3 : 1,
    });
    if (habits.smoking) applyEffects(state, { health: -2, immunity: -2, energy: -1 });
    if (habits.alcohol > 60) applyEffects(state, { health: -2, mental: -2, sleep: -2 });
  }

  function applyConditionYear(state) {
    const profile = state.healthProfile;
    const notes = [];
    allStateConditions(state).forEach((entry) => {
      const condition = conditionById(entry.id);
      if (!condition) return;
      entry.yearsActive += 1;
      entry.treatedThisYear = false;
      applyEffects(state, condition.effectsPerYear);
      notes.push(condition.title);
      if (entry.yearsActive > 2 && condition.bucket === "active" && condition.severity <= 2 && profile.immunity > 55) removeCondition(state, condition.id);
    });
    return notes;
  }

  function rollNewConditions(state, rng = Math.random) {
    const added = [];
    const risks = getConditionRisks(state).sort((a, b) => b.risk - a.risk);
    for (const entry of risks) {
      if (added.length >= 2) break;
      if (rng() < entry.risk) {
        const result = addCondition(state, entry.condition.id, "yearly");
        if (result.ok) added.push(entry.condition.title);
      }
    }
    return added;
  }

  function deathRiskModifier(state) {
    return allStateConditions(state).reduce((sum, entry) => sum + (conditionById(entry.id)?.deathRiskModifier || 0), 0);
  }

  function actionPenalty(state) {
    const profile = state.healthProfile || normalizeHealthState(state, state);
    const conditionLoad = allStateConditions(state).reduce((sum, entry) => sum + entry.severity, 0);
    let penalty = 0;
    if (profile.energy < 35 || profile.sleep < 35) penalty += 1;
    if (profile.health < 35 || profile.mental < 35) penalty += 1;
    if (conditionLoad >= 6) penalty += 1;
    return penalty;
  }

  function resolveHealthYear(state, rng = Math.random) {
    normalizeHealthState(state, state);
    applyYearlyBaseline(state);
    const conditionNotes = applyConditionYear(state);
    const newNotes = rollNewConditions(state, rng);
    const profile = state.healthProfile;
    const careerImpact = allStateConditions(state).some((item) => ["burnout", "chronic_fatigue", "low_energy"].includes(item.id));
    if (careerImpact && state.career) state.career.burnout = clamp((state.career.burnout || 0) + 4, 0, 100);
    if (allStateConditions(state).some((item) => ["anxiety_period", "depressive_period", "social_exhaustion"].includes(item.id))) {
      window.GameRelationshipEngine?.activePartner?.(state) && window.GameRelationshipEngine.changeNpc(window.GameRelationshipEngine.activePartner(state), { conflict: 1, bond: -1 });
      window.GameRelationshipEngine?.syncLegacy?.(state);
    }
    profile.lastYearSummary = {
      age: state.age,
      health: profile.health,
      mental: profile.mental,
      stress: profile.stress,
      energy: profile.energy,
      active: allStateConditions(state).map((item) => item.title),
      newConditions: newNotes,
      affectedBy: conditionNotes,
    };
    syncLegacy(state);
    return profile.lastYearSummary;
  }

  function addTreatmentHistory(state, text) {
    if (!state.healthProfile) return;
    state.healthProfile.treatmentHistory.unshift(`${state.age || 0} лет: ${text}`);
    state.healthProfile.treatmentHistory = state.healthProfile.treatmentHistory.slice(0, 36);
  }

  window.GameHealthEngine = {
    catalog,
    conditionById,
    normalizeHealthState,
    syncLegacy,
    allStateConditions,
    hasCondition,
    addCondition,
    removeCondition,
    conditionRisk,
    getConditionRisks,
    applyEffects,
    insuranceDiscount,
    treatmentCost,
    treatCondition,
    updateHabits,
    resolveHealthYear,
    deathRiskModifier,
    actionPenalty,
  };
})();
