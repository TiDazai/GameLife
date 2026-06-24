(() => {
  const { companySectors, deathRiskConfig, lifeTypes } = window.GameData;
  const { roll, clamp } = window.GameRandom;
  const {
    state,
    fmt,
    cityData,
    countryTaxRate,
    change,
    skillAverage,
    householdIncome,
    householdCost,
    personalCost,
    payOrDebt,
    partnerIncome,
    addIncome,
    budgetModeData,
    changeCredit,
    player,
    maxActionsForAge,
    addLog,
    housingData,
    hasPossession,
    improveSkill,
    requestRender,
    setAppMode,
    netWorth,
    livingParentCount,
    professionData,
    annualSalary,
  } = window.GameState;
  const { maybeEvent } = window.GameEvents;

function resolveTaxesYear() {
  if (window.GameEconomyEngine?.resolveTaxes) {
    const due = window.GameEconomyEngine.resolveTaxes(state);
    return due > 0 ? `налоги ${fmt(due)}` : "";
  }
  if (state.age < 18 || state.taxableIncome <= 0) return "";
  const rate = state.documents.taxId ? countryTaxRate() : countryTaxRate() + 0.06;
  const due = Math.floor(state.taxableIncome * rate);
  state.taxableIncome = 0;
  if (due <= 0) return "";
  if (state.personalMoney >= due) {
    state.personalMoney -= due;
    state.taxesPaid += due;
    return `налоги ${fmt(due)}`;
  }
  const paid = state.personalMoney;
  state.personalMoney = 0;
  state.taxesPaid += paid;
  state.taxDebt += due - paid;
  state.debt += due - paid;
  change({ stress: 5, reputation: -1 });
  return `налоги частично, долг ${fmt(due - paid)}`;
}

function resolveCompanyYear() {
  if (!state.company) return "";
  const sector = companySectors[state.company.sector];
  const founder = 1 + skillAverage(["finance", "leadership", "empathy"]) / 260;
  const branchPower = 1 + state.company.branches * 0.38;
  const demand = 1 + state.company.marketing / 180 + state.company.quality / 220;
  const income = Math.floor((sector.baseRevenue * state.company.level + state.company.employees * 380 + state.company.reputation * 18) * cityData().opportunity / 100 * founder * branchPower * demand);
  const automationDiscount = 1 - Math.min(0.35, state.company.automation / 260);
  const costs = Math.floor((300 + state.company.employees * 420 + state.company.level * 160 + state.company.branches * 740) * automationDiscount);
  const debtInterest = Math.ceil((state.company.debt || 0) * 0.08);
  const profit = income - costs;
  state.company.cash += profit - debtInterest;
  state.company.reputation = clamp(state.company.reputation + (profit > 0 ? 2 : -3), 0, 100);
  change({ stress: state.company.stress });
  if (state.company.cash < 0) {
    state.debt += Math.abs(state.company.cash);
    state.company.cash = 0;
  }
  return `Компания: ${profit >= 0 ? "прибыль" : "убыток"} ${fmt(Math.abs(profit))}${debtInterest ? `, кредит ${fmt(debtInterest)}` : ""}.`;
}

function resolveAssetsYear() {
  if (window.GameEconomyEngine?.applyAssetReturns) return window.GameEconomyEngine.applyAssetReturns(state, Math.random).join(", ");
  const notes = [];
  if (state.assets.deposits > 0) {
    const income = Math.floor(state.assets.deposits * 0.045);
    state.assets.deposits += income;
    notes.push(`вклад +${fmt(income)}`);
  }
  if (state.assets.stocks > 0) {
    const rate = -0.12 + Math.random() * 0.28 + state.skills.finance / 900;
    const result = Math.floor(state.assets.stocks * rate);
    state.assets.stocks = Math.max(0, state.assets.stocks + result);
    notes.push(`акции ${result >= 0 ? "+" : "-"}${fmt(Math.abs(result))}`);
  }
  if (state.assets.pension > 0) {
    const income = Math.floor(state.assets.pension * 0.035);
    state.assets.pension += income;
    notes.push(`пенсия +${fmt(income)}`);
  }
  return notes.join(", ");
}

function resolveDeathRisk() {
  const ageBand = deathRiskConfig.ageBands.find((item) => state.age >= item.min && state.age <= item.max) || deathRiskConfig.ageBands.at(-1);
  const healthRisk = Math.max(0, 45 - state.health) * deathRiskConfig.factors.lowHealth;
  const mentalRisk = Math.max(0, 35 - state.mental) * deathRiskConfig.factors.lowMental;
  const stressRisk = Math.max(0, state.stress - 65) * deathRiskConfig.factors.stress;
  const dangerRisk = (state.dangerThisYear || 0) * deathRiskConfig.factors.danger / 100;
  const criminalRisk = (state.criminalRecord || 0) * deathRiskConfig.factors.criminalRecord;
  const extremeAgeRisk = Math.max(0, state.age - 95) * deathRiskConfig.factors.extremeAge;
  const conditionRisk = window.GameHealthEngine?.deathRiskModifier?.(state) || 0;
  const risk = clamp(ageBand.risk + healthRisk + mentalRisk + stressRisk + dangerRisk + criminalRisk + extremeAgeRisk + conditionRisk, 0, deathRiskConfig.maxRisk);
  const reasons = [
    ["возраст", ageBand.risk + extremeAgeRisk],
    ["здоровье", healthRisk],
    ["психика", mentalRisk],
    ["стресс", stressRisk],
    ["опасные решения", dangerRisk],
    ["криминальный след", criminalRisk],
    ["состояния здоровья", conditionRisk],
  ].sort((a, b) => b[1] - a[1]);
  return { risk, reason: reasons[0][0] };
}

function resolveLifeType() {
  const total = netWorth();
  const context = {
    age: state.age,
    netWorth: total,
    children: state.children.length,
    happiness: state.happiness,
    knowledge: state.knowledge,
    education: state.educationLevel,
    fame: state.fame,
    criminalRecord: state.criminalRecord,
    social: state.social,
    relationship: Boolean(state.relationship),
  };
  const match = lifeTypes.find((type) => {
    const test = type.test;
    if (test.fallback) return false;
    if (test.netWorth !== undefined && context.netWorth < test.netWorth) return false;
    if (test.netWorthMax !== undefined && context.netWorth > test.netWorthMax) return false;
    if (test.children !== undefined && context.children < test.children) return false;
    if (test.childrenMax !== undefined && context.children > test.childrenMax) return false;
    if (test.happiness !== undefined && context.happiness < test.happiness) return false;
    if (test.knowledge !== undefined && context.knowledge < test.knowledge) return false;
    if (test.education !== undefined && context.education !== test.education) return false;
    if (test.fame !== undefined && context.fame < test.fame) return false;
    if (test.criminalRecord !== undefined && context.criminalRecord < test.criminalRecord) return false;
    if (test.socialMax !== undefined && context.social > test.socialMax) return false;
    if (test.relationship !== undefined && context.relationship !== test.relationship) return false;
    if (test.age !== undefined && context.age < test.age) return false;
    return true;
  });
  return match || lifeTypes.find((type) => type.test.fallback);
}

function createLegacySnapshot() {
  return {
    id: `life-${Date.now()}`,
    name: `${state.firstName} ${state.lastName}`.trim(),
    generation: state.generation || 1,
    country: state.country,
    city: state.city,
    age: state.deathAge,
    year: state.deathYear,
    netWorth: netWorth(),
    family: `родители ${livingParentCount()}/2, детей ${state.children.length}`,
    children: state.children.map((child) => ({ id: child.id, name: child.name, age: child.age, gender: child.gender })),
    career: `${professionData().name}, уровень ${state.careerLevel}, доход ${fmt(annualSalary())}`,
    education: state.educationLevel,
    business: state.company ? `${companySectors[state.company.sector].name}, филиалов ${state.company.branches || 0}` : "нет",
    health: state.health,
    happiness: state.happiness,
    fame: state.fame,
    karma: state.karma,
    criminalRecord: state.criminalRecord,
    lifeType: state.lifeType,
    keyEvents: state.log.slice(0, 10),
  };
}

function resolvePlayerDeath() {
  const death = resolveDeathRisk();
  state.deathRisk = death.risk;
  if (Math.random() >= death.risk) {
    state.dangerThisYear = 0;
    return false;
  }
  state.deceased = true;
  state.deathAge = state.age;
  state.deathYear = state.year;
  state.deathCause = death.reason;
  state.event = null;
  state.actions = 0;
  addLog(`Жизнь завершилась. Главный фактор риска: ${death.reason}.`);
  if (window.GameLifeSummaryEngine?.createLifeSummary) {
    state.lifeSummary = window.GameLifeSummaryEngine.createLifeSummary(state);
    state.lifeType = state.lifeSummary.lifeType;
    state.legacySnapshot = window.GameLifeSummaryEngine.toGenerationRecord(state.lifeSummary);
  } else {
    state.lifeType = resolveLifeType();
    state.legacySnapshot = createLegacySnapshot();
  }
  window.GameStorage?.recordGenerationHistory?.(state.legacySnapshot);
  setAppMode("death");
  return true;
}

function endYear() {
  if (state.deceased) {
    setAppMode("death");
    requestRender();
    return;
  }
  if (state.event) {
    requestRender();
    return;
  }

  const notes = [];
  const familyIncome = householdIncome();
  const familyCost = Math.floor(householdCost() * (state.age < 18 ? 1 : 0.35));
  state.familyMoney += familyIncome - familyCost;
  if (state.familyMoney < 0) {
    state.debt += Math.abs(state.familyMoney);
    state.familyMoney = 0;
    change({ stress: 8, happiness: -4 });
    notes.push("семья закрыла дефицит долгом");
  }

  if (state.age >= 18) {
    const partnerPay = partnerIncome();
    if (partnerPay > 0) {
      window.GameEconomyEngine?.recordIncome ? window.GameEconomyEngine.recordIncome(state, "вклад партнера", partnerPay, true) : addIncome(partnerPay);
      notes.push(`вклад партнера ${fmt(partnerPay)}`);
    }
    const mode = budgetModeData();
    change({ happiness: mode.happiness, discipline: mode.discipline, stress: mode.stress });
    changeCredit(mode.credit);
  }

  const companyNote = resolveCompanyYear();
  if (companyNote) notes.push(companyNote);
  const careerNote = window.GameCareerEngine?.resolveCareerYear?.(state, Math.random);
  if (careerNote) notes.push(`карьера: ${careerNote}`);
  const healthSummary = window.GameHealthEngine?.resolveHealthYear?.(state, Math.random);
  if (healthSummary?.newConditions?.length) notes.push(`здоровье: ${healthSummary.newConditions.join(", ")}`);
  const legalNote = window.GameLegalEngine?.resolveLegalYear?.(state, Math.random);
  if (legalNote) notes.push(`правовой статус: ${legalNote}`);
  const economySummary = window.GameEconomyEngine?.resolveEconomyYear?.(state, Math.random);
  if (economySummary) notes.push(`финансы: доход ${fmt(economySummary.income)}, расходы ${fmt(economySummary.expenses)}`);

  const fatigueNotes = window.GameActionLoad?.applyYearlyFatigueConsequences?.(state) || [];
  fatigueNotes.forEach((entry) => notes.push(entry));
  window.GameWorldEvents?.tick?.(state, Math.random);
  window.GameStoryArcs?.tick?.(state, Math.random);
  window.GameLifeGoals?.evaluate?.(state);
  window.GameAdultRelationships?.clearIfLocked?.(state);

  ageFamily();
  naturalChanges();
  state.age += 1;
  state.year += 1;
  player().age = state.age;
  const playerNpc = window.GameRelationshipEngine?.findNpc?.(state, "player");
  if (playerNpc) {
    playerNpc.age = state.age;
    playerNpc.health = state.health;
    playerNpc.mental = state.mental;
    playerNpc.money = Math.max(0, state.personalMoney || 0);
    window.GameRelationshipEngine.syncLegacy(state);
  }
  state.maxActions = maxActionsForAge();
  state.actions = state.maxActions;
  window.GameActionLoad?.resetYearlyActionLoad?.(state);
  updateEducationByAge();
  if (resolvePlayerDeath()) {
    requestRender();
    return;
  }
  maybeEvent();

  const note = notes.length ? notes.join(", ") : "год прошел спокойно";
  state.message = state.event ? state.message : `Новый год жизни: ${note}.`;
  addLog(state.message);
  requestRender();
}

function ageFamily() {
  window.GameRelationshipEngine?.yearlyRelationships?.(state, Math.random);
}

function naturalChanges() {
  if (window.GameHealthEngine?.normalizeHealthState) window.GameHealthEngine.normalizeHealthState(state, state);
  if (window.GameLegalEngine?.normalizeLegalState) window.GameLegalEngine.normalizeLegalState(state, state);
  const city = cityData();
  const home = housingData();
  const itemKnowledge = hasPossession("books") ? 1 : 0;
  const itemHealth = hasPossession("bike") ? 1 : 0;
  const districtHealth = state.districtQuality > 75 ? 1 : state.districtQuality < 45 ? -1 : 0;
  const districtStress = state.districtQuality > 75 ? -1 : state.districtQuality < 45 ? 2 : 0;
  change({
    health: (city.safety > 80 ? 1 : -1) + itemHealth + districtHealth,
    happiness: (state.livingWithParents && state.age > 22 ? -2 : 0) + home.happiness + (state.districtQuality > 80 ? 1 : 0),
    knowledge: (state.age < 22 ? 1 : 0) + itemKnowledge,
    social: state.age > 70 ? -1 : 0,
    stress: (state.age < 18 ? -1 : 2) + home.stress + districtStress,
    lifestyle: Math.floor((home.quality - 50) / 18),
    mental: state.stress > 65 ? -4 : state.happiness > 70 ? 2 : 0,
    energy: state.health > 70 ? 2 : -2,
    looks: state.age < 25 ? 1 : state.age > 55 ? -1 : 0,
    fame: state.fame > 0 ? -1 : 0,
    karma: state.karma > 55 ? -1 : state.karma < 45 ? 1 : 0,
  });
  if (hasPossession("laptop")) improveSkill("logic", 1);
  if (hasPossession("tools")) improveSkill("craft", 1);
  if (state.health < 25) {
    change({ happiness: -5, stress: 7 });
    const bill = state.documents.insurance === "premium" ? 80 : state.documents.insurance === "basic" ? 170 : 300;
    if (window.GameEconomyEngine?.payExpense) window.GameEconomyEngine.payExpense(state, "медицинский кризис", bill, { loanType: "consumer" });
    else state.debt += bill;
    addLog("Плохое здоровье вызвало расходы на лечение.");
  }
  if (state.stress > 92) {
    change({ health: -8, happiness: -8, mental: -10, energy: -8, discipline: -4 });
    addLog("Высокий стресс ударил по здоровью и дисциплине.");
  }
  if (state.mental < 25) {
    change({ happiness: -6, stress: 8, social: -2 });
    addLog("Ментальное состояние стало критическим: отношения и энергия просели.");
  }
  if (state.taxDebt > 0) {
    change({ stress: 3, reputation: -1 });
  }
  if (state.criminalRecord > 0) {
    change({ reputation: -state.criminalRecord, stress: Math.min(5, state.criminalRecord) });
  }
}

function updateEducationByAge() {
  if (state.age === 7 && state.education?.levelId === "preschool") {
    state.education.levelId = "school";
    if (!state.education.completed.includes("school")) state.education.completed.push("school");
  }
  if (state.age === 18 && state.education?.levelId === "school") {
    state.education.levelId = "secondary";
    if (!state.education.completed.includes("secondary")) state.education.completed.push("secondary");
  }
  window.GameCareerEngine?.syncLegacy?.(state);
}

  window.GameSimulation = {
    resolveTaxesYear,
    resolveCompanyYear,
    resolveAssetsYear,
    resolveDeathRisk,
    resolveLifeType,
    createLegacySnapshot,
    resolvePlayerDeath,
    endYear,
    ageFamily,
    naturalChanges,
    updateEducationByAge,
  };
})();
