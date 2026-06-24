(() => {
  const achievementKey = "gamelife-achievements";
  const { clamp } = window.GameRandom;

  function safeNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === "") return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function rules() {
    return window.GameData.lifeTypeRules || [];
  }

  function achievementRules() {
    return window.GameData.achievementRules || [];
  }

  function fmtMoney(state, amount) {
    return window.GameState?.fmt ? window.GameState.fmt(amount) : String(Math.floor(amount || 0));
  }

  function netWorthOf(state) {
    return window.GameState?.netWorth ? window.GameState.netWorth() : netWorthForState(state);
  }

  function netWorthForState(state) {
    if (window.GameEconomyEngine?.calculateNetWorth) return window.GameEconomyEngine.calculateNetWorth(state);
    const assets = state.assets || {};
    const economy = state.economy || {};
    const realEstate = Array.isArray(economy.realEstate) ? economy.realEstate.reduce((sum, item) => sum + safeNumber(item.value), 0) : safeNumber(assets.property);
    return Math.floor(safeNumber(state.personalMoney) + safeNumber(state.familyMoney) + safeNumber(assets.deposits) + safeNumber(assets.stocks) + safeNumber(assets.pension) + realEstate - safeNumber(state.debt) - safeNumber(state.taxDebt));
  }

  function educationRank(state) {
    return window.GameCareerEngine?.educationRank?.(state) || ({ preschool: 1, school: 2, secondary: 3, college: 4, university: 5, master: 6, certificates: 4 }[state.education?.levelId] || 0);
  }

  function activePartnerCount(state) {
    return (state.npcs || []).filter((npc) => ["partner", "spouse", "ex_partner"].includes(npc.relationType)).length + (state.relationship ? 1 : 0);
  }

  function relationshipAverage(state) {
    const close = (state.npcs || []).filter((npc) => npc.alive && npc.relationType !== "self");
    if (!close.length) return 0;
    return close.reduce((sum, npc) => sum + safeNumber(npc.bond) + safeNumber(npc.trust) - safeNumber(npc.conflict), 0) / (close.length * 2);
  }

  function businessScore(state) {
    if (!state.company) return 0;
    return clamp(safeNumber(state.company.level) * 12 + safeNumber(state.company.branches) * 10 + safeNumber(state.company.reputation) * 0.55 + Math.min(35, safeNumber(state.company.cash) / 1200), 0, 100);
  }

  function moneyScore(state) {
    const worth = netWorthForState(state);
    if (worth <= -5000) return 0;
    return clamp(Math.log10(Math.max(1, worth + 1000)) * 18 - 35, 0, 100);
  }

  function familyScore(state) {
    const children = (state.children || []).length;
    const livingFamily = (state.npcs || []).filter((npc) => npc.alive && ["parent", "grandparent", "sibling", "child", "spouse", "partner"].includes(npc.relationType));
    const bond = livingFamily.length ? livingFamily.reduce((sum, npc) => sum + safeNumber(npc.bond), 0) / livingFamily.length : 0;
    return clamp(children * 14 + bond * 0.55 + (state.relationship?.married ? 15 : 0), 0, 100);
  }

  function careerScore(state) {
    return clamp(safeNumber(state.careerLevel) * 12 + safeNumber(state.experience) * 4 + (state.career?.status === "employed" ? 12 : 0) + safeNumber(state.portfolio) * 0.2, 0, 100);
  }

  function educationScore(state) {
    return clamp(educationRank(state) * 14 + safeNumber(state.knowledge) * 0.35 + (state.certificates || []).length * 5, 0, 100);
  }

  function legalScore(state) {
    const activeCases = Array.isArray(state.activeCases) ? state.activeCases.length : 0;
    const unpaidFines = window.GameLegalEngine?.unpaidFines?.(state).length || (state.fines || []).filter((fine) => !fine.paid).length;
    return clamp(100 - safeNumber(state.criminalRecord) * 18 - activeCases * 12 - unpaidFines * 5 + (safeNumber(state.publicTrust) - 50) * 0.35, 0, 100);
  }

  function calculateScores(state) {
    const scores = {
      money: moneyScore(state),
      family: familyScore(state),
      career: careerScore(state),
      education: educationScore(state),
      health: clamp((safeNumber(state.health) + safeNumber(state.energy) * 0.25) / 1.25, 0, 100),
      happiness: clamp(safeNumber(state.happiness), 0, 100),
      reputation: clamp((safeNumber(state.reputation) * 0.65 + safeNumber(state.publicTrust, state.reputation) * 0.35), 0, 100),
      karma: clamp(safeNumber(state.karma, 50), 0, 100),
      legal: legalScore(state),
      fame: clamp(safeNumber(state.fame), 0, 100),
      business: businessScore(state),
      relationships: clamp(relationshipAverage(state), 0, 100),
    };
    return Object.fromEntries(Object.entries(scores).map(([key, value]) => [key, Math.round(clamp(value, 0, 100))]));
  }

  function contextFor(state) {
    const scores = calculateScores(state);
    const inheritedMoney = safeNumber(state.inheritedFrom?.inheritedMoney) + safeNumber(state.inheritedFrom?.inheritedProperty);
    const debt = safeNumber(state.debt) + safeNumber(state.taxDebt) + safeNumber(state.economy?.debt);
    return {
      ...scores,
      age: safeNumber(state.deathAge, state.age),
      netWorth: netWorthForState(state),
      children: (state.children || []).length,
      generation: safeNumber(state.generation, 1),
      inherited: Boolean(state.inheritedFrom),
      inheritedValue: inheritedMoney,
      discipline: safeNumber(state.discipline),
      stress: safeNumber(state.stress),
      risk: safeNumber(state.traits?.risk),
      debt,
      taxDebt: safeNumber(state.taxDebt),
      criminalRecord: safeNumber(state.criminalRecord),
      activeCases: Array.isArray(state.activeCases) ? state.activeCases.length : 0,
      pastCases: Array.isArray(state.pastCases) ? state.pastCases.length : 0,
      careerLevel: safeNumber(state.careerLevel),
      reputationValue: safeNumber(state.reputation),
      publicTrust: safeNumber(state.publicTrust),
      healthValue: safeNumber(state.health),
      happinessValue: safeNumber(state.happiness),
      fameValue: safeNumber(state.fame),
      businessScore: scores.business,
      educationScore: scores.education,
      lateSuccess: Math.max(scores.career, scores.money, scores.reputation),
      hardship: clamp(100 - scores.money + (100 - scores.happiness) * 0.45 + (100 - scores.legal) * 0.55 + (100 - scores.health) * 0.35, 0, 100),
      chaos: clamp(safeNumber(state.dangerThisYear) + (100 - scores.legal) * 0.55 + safeNumber(state.stress) * 0.35 + safeNumber(state.traits?.risk) * 0.35, 0, 100),
    };
  }

  function thresholdsPass(context, thresholds = {}) {
    if (thresholds.money !== undefined && context.money < thresholds.money) return false;
    if (thresholds.family !== undefined && context.family < thresholds.family) return false;
    if (thresholds.familyMax !== undefined && context.family > thresholds.familyMax) return false;
    if (thresholds.business !== undefined && context.business < thresholds.business) return false;
    if (thresholds.education !== undefined && context.education < thresholds.education) return false;
    if (thresholds.happiness !== undefined && context.happiness < thresholds.happiness) return false;
    if (thresholds.legal !== undefined && context.legal < thresholds.legal) return false;
    if (thresholds.legalMax !== undefined && context.legal > thresholds.legalMax) return false;
    if (thresholds.reputation !== undefined && context.reputation < thresholds.reputation) return false;
    if (thresholds.fame !== undefined && context.fame < thresholds.fame) return false;
    if (thresholds.fameMax !== undefined && context.fame > thresholds.fameMax) return false;
    if (thresholds.age !== undefined && context.age < thresholds.age) return false;
    if (thresholds.risk !== undefined && context.risk < thresholds.risk) return false;
    if (thresholds.discipline !== undefined && context.discipline < thresholds.discipline) return false;
    if (thresholds.stress !== undefined && context.stress < thresholds.stress) return false;
    if (thresholds.hardship !== undefined && context.hardship < thresholds.hardship) return false;
    if (thresholds.chaos !== undefined && context.chaos < thresholds.chaos) return false;
    if (thresholds.lateSuccess !== undefined && context.lateSuccess < thresholds.lateSuccess) return false;
    if (thresholds.inherited !== undefined && context.inherited !== thresholds.inherited) return false;
    if (thresholds.inheritedMax !== undefined && context.inheritedValue > thresholds.inheritedMax) return false;
    return true;
  }

  function scoreLifeType(state) {
    const context = contextFor(state);
    const candidates = rules().map((rule) => {
      const base = Object.entries(rule.weights || {}).reduce((sum, [category, weight]) => sum + (context[category] || 0) * weight, 0);
      const thresholdBonus = thresholdsPass(context, rule.thresholds) ? 80 : -140;
      return { ...rule, score: Math.round(base + thresholdBonus) };
    }).sort((a, b) => b.score - a.score);
    return candidates[0] || { id: "quiet_harbor", name: "Тихая гавань", description: "", score: 0 };
  }

  function testAchievement(context, test = {}) {
    if (test.netWorth !== undefined && context.netWorth < test.netWorth) return false;
    if (test.age !== undefined && context.age < test.age) return false;
    if (test.children !== undefined && context.children < test.children) return false;
    if (test.businessScore !== undefined && context.businessScore < test.businessScore) return false;
    if (test.health !== undefined && context.healthValue < test.health) return false;
    if (test.happiness !== undefined && context.happinessValue < test.happiness) return false;
    if (test.careerLevel !== undefined && context.careerLevel < test.careerLevel) return false;
    if (test.debtMax !== undefined && context.debt > test.debtMax) return false;
    if (test.taxDebtMax !== undefined && context.taxDebt > test.taxDebtMax) return false;
    if (test.educationScore !== undefined && context.educationScore < test.educationScore) return false;
    if (test.reputation !== undefined && context.reputationValue < test.reputation) return false;
    if (test.publicTrust !== undefined && context.publicTrust < test.publicTrust) return false;
    if (test.criminalRecordMax !== undefined && context.criminalRecord > test.criminalRecordMax) return false;
    if (test.activeCasesMax !== undefined && context.activeCases > test.activeCasesMax) return false;
    if (test.fame !== undefined && context.fameValue < test.fame) return false;
    if (test.generation !== undefined && context.generation < test.generation) return false;
    if (test.lateSuccess !== undefined && context.lateSuccess < test.lateSuccess) return false;
    return true;
  }

  function readAchievements() {
    try {
      const raw = localStorage.getItem(achievementKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAchievements(items) {
    localStorage.setItem(achievementKey, JSON.stringify(items.slice(0, 100)));
  }

  function unlockAchievements(state, summary = null) {
    const finalSummary = summary || createLifeSummary(state, { persistAchievements: false });
    const context = contextFor(state);
    const unlockedNow = achievementRules()
      .filter((rule) => testAchievement(context, rule.test))
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        unlockedAt: Date.now(),
        lifeName: finalSummary.name,
        generation: finalSummary.generation,
      }));
    const existing = readAchievements();
    const byId = new Map(existing.map((item) => [item.id, item]));
    unlockedNow.forEach((item) => {
      if (!byId.has(item.id)) byId.set(item.id, item);
    });
    const merged = [...byId.values()];
    writeAchievements(merged);
    state.achievements = merged;
    state.unlockedAchievements = unlockedNow.filter((item) => !existing.some((old) => old.id === item.id));
    return state.unlockedAchievements;
  }

  function gameDeathCause(state) {
    const reason = state.deathCause || "возраст";
    const map = {
      "возраст": "Жизнь завершилась естественным ходом времени.",
      "здоровье": "Организм не выдержал накопленных проблем со здоровьем.",
      "психика": "Внутреннее напряжение стало главным фактором финала.",
      "стресс": "Долгое давление и стресс слишком дорого обошлись.",
      "опасные решения": "Опасные решения собрали слишком высокий риск.",
      "криминальный след": "Правовой и криминальный след резко повысил опасность.",
      "состояния здоровья": "Накопленные состояния здоровья стали решающим фактором.",
    };
    return map[reason] || `Главный фактор финала: ${reason}.`;
  }

  function createLifeSummary(state, options = {}) {
    const lifeType = scoreLifeType(state);
    const scores = calculateScores(state);
    const legalStatusName = window.GameData.legalStatuses?.[state.legalStatus]?.name || state.legalStatus || "Чистый статус";
    const activePartner = window.GameRelationshipEngine?.activePartner?.(state);
    const spouse = window.GameRelationshipEngine?.spouse?.(state);
    const partners = (state.npcs || []).filter((npc) => ["partner", "spouse", "ex_partner"].includes(npc.relationType));
    const summary = {
      id: `life-${Date.now()}`,
      name: `${state.firstName} ${state.lastName}`.trim(),
      generation: safeNumber(state.generation, 1),
      country: state.country,
      city: state.city,
      age: safeNumber(state.deathAge, state.age),
      year: safeNumber(state.deathYear, state.year),
      deathCause: gameDeathCause(state),
      deathRiskFactor: state.deathCause || "",
      netWorth: netWorthForState(state),
      family: {
        livingParents: window.GameState?.livingParentCount ? window.GameState.livingParentCount() : (state.npcs || []).filter((npc) => npc.alive && npc.relationType === "parent").length,
        children: (state.children || []).length,
        partners: partners.length,
        spouse: spouse?.name || "",
        activePartner: activePartner?.name || "",
      },
      children: (state.children || []).map((child) => ({ id: child.id, name: child.name, age: child.age, gender: child.gender, bond: child.bond })),
      partners: partners.map((npc) => ({ id: npc.id, name: `${npc.name} ${npc.lastName || ""}`.trim(), relationType: npc.relationType, bond: npc.bond, trust: npc.trust })),
      career: {
        title: state.job?.title || window.GameState?.professionData?.().name || "нет",
        level: safeNumber(state.careerLevel),
        experience: safeNumber(state.experience),
        status: state.career?.status || "none",
        income: window.GameState?.annualSalary ? window.GameState.annualSalary() : 0,
      },
      education: state.educationLevel || state.education?.levelId || "нет",
      business: state.company ? {
        name: window.GameData.companySectors?.[state.company.sector]?.name || state.company.sector,
        level: safeNumber(state.company.level),
        branches: safeNumber(state.company.branches),
        reputation: safeNumber(state.company.reputation),
      } : null,
      health: safeNumber(state.health),
      mental: safeNumber(state.mental),
      happiness: safeNumber(state.happiness),
      fame: safeNumber(state.fame),
      karma: safeNumber(state.karma),
      reputation: safeNumber(state.reputation),
      legalStatus: legalStatusName,
      criminalRecord: safeNumber(state.criminalRecord),
      keyEvents: Array.isArray(state.log) ? state.log.slice(0, 12) : [],
      generations: {
        current: safeNumber(state.generation, 1),
        history: Array.isArray(state.familyHistory) ? state.familyHistory.slice(-8) : [],
      },
      scores,
      lifeType: {
        id: lifeType.id,
        name: lifeType.name,
        description: lifeType.description,
        score: lifeType.score,
      },
      achievements: [],
    };
    if (options.persistAchievements !== false) {
      summary.achievements = unlockAchievements(state, summary);
    }
    return summary;
  }

  function toGenerationRecord(summary) {
    return {
      id: summary.id,
      name: summary.name,
      generation: summary.generation,
      country: summary.country,
      city: summary.city,
      age: summary.age,
      year: summary.year,
      netWorth: summary.netWorth,
      lifeType: summary.lifeType,
      keyEvents: summary.keyEvents,
      children: summary.children,
      achievements: summary.achievements,
    };
  }

  window.GameLifeSummaryEngine = {
    achievementKey,
    rules,
    achievementRules,
    calculateScores,
    contextFor,
    scoreLifeType,
    createLifeSummary,
    unlockAchievements,
    readAchievements,
    writeAchievements,
    toGenerationRecord,
    netWorthForState,
    gameDeathCause,
  };
})();
