(() => {
  const { clamp } = window.GameRandom;

  const legacyEducationMap = {
    "Детство": "preschool",
    "Дошкольное развитие": "preschool",
    "Школа": "school",
    "Профиль выбран": "school",
    "Базовое образование": "secondary",
    "Среднее образование": "secondary",
    "Колледж": "college",
    "Высшее образование": "university",
    "Университет": "university",
    "Магистратура": "master",
  };

  function levels() {
    return window.GameData.educationLevels || {};
  }

  function jobs() {
    return window.GameData.jobs || [];
  }

  function industries() {
    return window.GameData.industries || {};
  }

  function levelData(levelId) {
    return levels()[levelId] || levels().preschool;
  }

  function jobById(jobId) {
    return jobs().find((job) => job.id === jobId) || null;
  }

  function industryData(industryId) {
    return industries()[industryId] || industries().service;
  }

  function educationRank(state, levelId = state.education?.levelId) {
    return levelData(levelId)?.rank || 0;
  }

  function educationName(state) {
    return levelData(state.education?.levelId)?.name || state.educationLevel || "Дошкольное развитие";
  }

  function normalizeCareerState(state, original = state) {
    const levelId = original.education?.levelId || legacyEducationMap[original.educationLevel] || (state.age >= 18 ? "secondary" : state.age >= 7 ? "school" : "preschool");
    state.education = {
      levelId,
      completed: Array.isArray(original.education?.completed) ? original.education.completed : [levelId],
      history: Array.isArray(original.education?.history) ? original.education.history : [],
      courses: Array.isArray(original.education?.courses) ? original.education.courses : [],
      selfStudyHours: Number.isFinite(original.education?.selfStudyHours) ? original.education.selfStudyHours : 0,
    };
    if (!state.education.completed.includes(levelId)) state.education.completed.push(levelId);
    const legacyJob = original.career?.jobId || original.job?.id || null;
    state.career = {
      jobId: legacyJob,
      status: original.career?.status || (legacyJob ? "employed" : "none"),
      industry: original.career?.industry || jobById(legacyJob)?.industry || original.profession || "none",
      level: Number.isFinite(original.career?.level) ? original.career.level : Number(original.careerLevel) || 0,
      experience: Number.isFinite(original.career?.experience) ? original.career.experience : Number(original.experience) || 0,
      yearsInJob: Number.isFinite(original.career?.yearsInJob) ? original.career.yearsInJob : 0,
      burnout: clamp(Number(original.career?.burnout) || 0, 0, 100),
      breakYears: Number.isFinite(original.career?.breakYears) ? original.career.breakYears : 0,
      mentor: original.career?.mentor || null,
      lastInterview: original.career?.lastInterview || null,
      history: Array.isArray(original.career?.history) ? original.career.history : [],
    };
    syncLegacy(state);
    return state;
  }

  function syncLegacy(state) {
    const job = jobById(state.career?.jobId);
    state.careerLevel = Number(state.career?.level) || 0;
    state.experience = Number(state.career?.experience) || 0;
    state.educationLevel = educationName(state);
    if (job) {
      state.profession = industryData(job.industry)?.profession || job.industry;
      state.job = { id: job.id, title: job.title, industry: job.industry };
    } else if (!state.profession) {
      state.profession = "none";
      state.job = null;
    }
  }

  function statValue(state, key) {
    if (state.skills && key in state.skills) return Number(state.skills[key]) || 0;
    if (key in state) return Number(state[key]) || 0;
    return 0;
  }

  function skillAverageForJob(state, job) {
    const entries = Object.keys(job?.requirements?.skills || {});
    if (!entries.length) return 0;
    return entries.reduce((sum, skill) => sum + statValue(state, skill), 0) / entries.length;
  }

  function missingRequirements(state, job) {
    const missing = [];
    if (!job) return ["Должность не найдена"];
    if (state.age < job.minAge) missing.push(`возраст ${job.minAge}+`);
    if (educationRank(state) < educationRank(state, job.requirements.education)) missing.push(levelData(job.requirements.education).name);
    if ((state.knowledge || 0) < job.requirements.knowledge) missing.push(`знания ${job.requirements.knowledge}`);
    for (const [skill, value] of Object.entries(job.requirements.skills || {})) {
      if (statValue(state, skill) < value) missing.push(`${skill}: ${value}`);
    }
    const legalBlock = window.GameLegalEngine?.careerBlockReason?.(state, job);
    if (legalBlock) missing.push(legalBlock);
    return missing;
  }

  function meetsJobRequirements(state, jobOrId) {
    const job = typeof jobOrId === "string" ? jobById(jobOrId) : jobOrId;
    return missingRequirements(state, job).length === 0;
  }

  function availableJobs(state) {
    return jobs().filter((job) => state.age >= job.minAge && missingRequirements(state, job).length <= 2);
  }

  function countrySalaryFactor(state) {
    // Prefer the data-driven salaryMultiplier; fall back to legacy values for old saves.
    const country = window.GameData?.countries?.[state.country];
    if (country && Number.isFinite(country.salaryMultiplier)) return country.salaryMultiplier;
    return { ru: 0.92, de: 1.18, jp: 1.12, us: 1.28, se: 1.2 }[state.country] || 1;
  }

  function educationSalaryFactor(state) {
    const rank = educationRank(state);
    return 0.84 + rank * 0.07 + (state.certificates?.length || 0) * 0.025;
  }

  function calculateSalary(state, jobId = state.career?.jobId) {
    const job = jobById(jobId);
    if (!job) return 0;
    const city = window.GameState?.cityData ? window.GameState.cityData(state) : { salary: 1 };
    const skillFactor = 1 + (skillAverageForJob(state, job) - 30) / 180;
    const experienceFactor = 1 + (state.career?.experience || 0) * job.salaryGrowth;
    const levelFactor = 1 + (state.career?.level || 0) * 0.16;
    const reputationFactor = 1 + (state.reputation || 0) / 420 + (state.portfolio || 0) / 520 + (state.network || 0) / 620;
    const recordPenalty = Math.max(0.62, 1 - (state.criminalRecord || 0) * 0.08);
    const legalPenalty = 1 - (window.GameLegalEngine?.careerPenalty?.(state, job) || 0);
    const worldSalary = window.GameWorldEvents?.combinedModifiers?.(state)?.salary || 1;
    return Math.max(0, Math.floor(job.baseSalary * city.salary * countrySalaryFactor(state) * educationSalaryFactor(state) * skillFactor * experienceFactor * levelFactor * reputationFactor * recordPenalty * legalPenalty * worldSalary));
  }

  function appendCareerHistory(state, text) {
    state.career.history.unshift(`${state.age} лет: ${text}`);
    state.career.history = state.career.history.slice(0, 24);
    if (window.GameState?.addLog) window.GameState.addLog(text);
  }

  function payCost(state, cost) {
    if (cost <= 0) return true;
    if (state.personalMoney + state.familyMoney < cost) return false;
    if (state.personalMoney >= cost) state.personalMoney -= cost;
    else {
      const rest = cost - state.personalMoney;
      state.personalMoney = 0;
      state.familyMoney = Math.max(0, state.familyMoney - rest);
    }
    return true;
  }

  function applyEffects(state, effects = {}, skills = {}) {
    if (window.GameState?.change) window.GameState.change(effects);
    for (const [skill, amount] of Object.entries(skills)) {
      if (window.GameState?.improveSkill) window.GameState.improveSkill(skill, amount);
    }
  }

  function study(state, levelId) {
    const level = levelData(levelId);
    if (!level || state.age < level.minAge || !window.GameState?.canAct?.()) return { ok: false, text: "Обучение недоступно." };
    const cost = Math.floor((level.cost || 0) * (window.GameState?.cityData?.(state)?.cost || 1));
    if (!payCost(state, cost)) return { ok: false, text: "Не хватает денег на обучение." };
    window.GameState.spendAction();
    applyEffects(state, level.effects, level.skills);
    if (levelId === "self") state.education.selfStudyHours += 60;
    else if (levelId === "courses") state.education.courses.push(`course-${state.age}-${Date.now()}`);
    else if (educationRank(state, levelId) >= educationRank(state)) state.education.levelId = levelId;
    if (!state.education.completed.includes(levelId)) state.education.completed.push(levelId);
    state.education.history.unshift(`${state.age} лет: ${level.name}`);
    state.education.history = state.education.history.slice(0, 24);
    syncLegacy(state);
    const text = `Образование: ${level.name}.`;
    if (window.GameState?.notify) window.GameState.notify(text);
    return { ok: true, text };
  }

  function interviewScore(state, job) {
    const education = educationRank(state) - educationRank(state, job.requirements.education);
    const skills = skillAverageForJob(state, job);
    // World events change how many opportunities are on the market.
    const opportunityMod = window.GameWorldEvents?.combinedModifiers?.(state)?.opportunity || 1;
    const base =
      28 +
      education * 8 +
      (state.knowledge - job.requirements.knowledge) * 0.45 +
      (skills - 30) * 0.55 +
      (state.reputation || 0) * 0.35 +
      (state.network || 0) * 0.25 +
      (state.portfolio || 0) * 0.25 +
      (state.career?.mentor ? 6 : 0) -
      (state.stress || 0) * 0.25 -
      (window.GameLegalEngine?.careerPenalty?.(state, job) || 0) * 45;
    return base * opportunityMod;
  }

  function hire(state, jobId) {
    const job = jobById(jobId);
    if (!job) return { ok: false, text: "Должность не найдена." };
    state.career.jobId = job.id;
    state.career.status = "employed";
    state.career.industry = job.industry;
    state.career.yearsInJob = 0;
    state.career.breakYears = 0;
    state.career.burnout = Math.max(0, state.career.burnout - 10);
    syncLegacy(state);
    // Build the concrete employer object graph (company, workplace, boss,
    // coworkers as NPCs) for the deepened world model.
    if (window.GameWorkplace?.onHire) window.GameWorkplace.onHire(state, job);
    appendCareerHistory(state, `Получена работа: ${job.title}.`);
    return { ok: true, text: `Получена работа: ${job.title}.` };
  }

  function interview(state, jobId, rng = Math.random) {
    const job = jobById(jobId);
    if (!job || !window.GameState?.canAct?.()) return { ok: false, text: "Собеседование недоступно." };
    if (!meetsJobRequirements(state, job)) return { ok: false, text: `Не хватает: ${missingRequirements(state, job).join(", ")}.` };
    window.GameState.spendAction();
    const score = interviewScore(state, job);
    const success = rng() * 100 < score;
    state.career.lastInterview = { jobId, score: Math.round(score), success };
    if (!success) {
      applyEffects(state, { stress: 4, network: 2 }, {});
      const text = "Собеседование не завершилось оффером, но дало обратную связь.";
      if (window.GameState?.notify) window.GameState.notify(text);
      return { ok: false, text };
    }
    const result = hire(state, job.id);
    applyEffects(state, { happiness: 5, reputation: 2, stress: 2 }, {});
    if (window.GameState?.notify) window.GameState.notify(result.text);
    return result;
  }

  function work(state) {
    const job = jobById(state.career?.jobId);
    if (!job || state.career.status !== "employed" || !window.GameState?.canAct?.()) return { ok: false, text: "Работа недоступна." };
    window.GameState.spendAction();
    const profile = state.healthProfile || window.GameHealthEngine?.normalizeHealthState?.(state, state) || {};
    const conditions = window.GameHealthEngine?.allStateConditions?.(state) || [];
    const conditionLoad = conditions.reduce((sum, item) => sum + (item.severity || 0), 0);
    const healthMultiplier = clamp(
      1 - Math.max(0, 45 - (profile.energy || state.energy || 50)) / 120 - Math.max(0, conditionLoad - 4) / 80,
      0.65,
      1
    );
    const earned = Math.floor(calculateSalary(state, job.id) * healthMultiplier);
    if (window.GameState?.addIncome) window.GameState.addIncome(earned);
    state.career.experience += 1;
    state.career.yearsInJob += 1;
    state.career.burnout = clamp(state.career.burnout + job.stress / 4 + (state.stress > 65 ? 4 : 0) + (healthMultiplier < 0.9 ? 3 : 0), 0, 100);
    applyEffects(state, { stress: job.stress, discipline: 2, reputation: Math.ceil(job.prestige / 35) }, job.skillGrowth);
    syncLegacy(state);
    const healthText = healthMultiplier < 0.9 ? " Самочувствие снизило результат." : "";
    const text = `Работа ${job.title} принесла ${window.GameState?.fmt ? window.GameState.fmt(earned) : earned}.${healthText}`;
    if (window.GameState?.notify) window.GameState.notify(text);
    return { ok: true, text, earned };
  }

  function sideJob(state) {
    if (state.age < 14 || !window.GameState?.canAct?.()) return { ok: false, text: "Подработка недоступна." };
    window.GameState.spendAction();
    const earned = Math.floor((220 + (state.discipline || 0) * 4 + (state.social || 0) * 2) * (window.GameState?.cityData?.(state)?.salary || 1));
    if (window.GameState?.addIncome) window.GameState.addIncome(earned);
    applyEffects(state, { stress: 4, discipline: 2, social: 1 }, { finance: 2, empathy: 1 });
    if (window.GameState?.notify) window.GameState.notify(`Подработка принесла ${window.GameState.fmt(earned)}.`);
    return { ok: true, earned };
  }

  function freelance(state) {
    if (state.age < 16 || !window.GameState?.canAct?.()) return { ok: false, text: "Фриланс недоступен." };
    window.GameState.spendAction();
    const tools = window.GameState?.hasPossession?.("laptop") ? 1.18 : 1;
    const earned = Math.floor((300 + (state.knowledge || 0) * 9 + (state.social || 0) * 7 + (state.reputation || 0) * 8 + ((state.skills.logic || 0) + (state.skills.creativity || 0) + (state.skills.finance || 0)) * 4) * (window.GameState?.cityData?.(state)?.salary || 1) * tools);
    if (window.GameState?.addIncome) window.GameState.addIncome(earned);
    applyEffects(state, { stress: 7, reputation: 2, social: 1, portfolio: 3 }, { finance: 2, leadership: 1 });
    if (window.GameState?.notify) window.GameState.notify(`Фриланс принес ${window.GameState.fmt(earned)}.`);
    return { ok: true, earned };
  }

  function promote(state) {
    const job = jobById(state.career?.jobId);
    if (!job || state.career.status !== "employed") return { ok: false, text: "Повышение недоступно." };
    const req = job.promotionRequirements;
    const ready = state.career.experience >= req.experience && state.reputation >= req.reputation && skillAverageForJob(state, job) >= skillAverageForJob({ ...state, skills: req.skills }, job) * 0.55;
    if (!ready) return { ok: false, text: "Для повышения пока не хватает опыта, репутации или навыков." };
    state.career.level += 1;
    state.career.burnout = clamp(state.career.burnout + 5, 0, 100);
    if (window.GameWorkplace?.promote) window.GameWorkplace.promote(state);
    syncLegacy(state);
    applyEffects(state, { happiness: 5, reputation: 3, stress: 5, creditScore: 1 }, {});
    appendCareerHistory(state, "Получено повышение.");
    if (window.GameState?.notify) window.GameState.notify("Повышение получилось. Карьерный уровень вырос.");
    return { ok: true };
  }

  function fire(state, reason = "Работа завершилась увольнением.") {
    if (!state.career?.jobId) return { ok: false, text: "Работы нет." };
    appendCareerHistory(state, reason);
    state.career.jobId = null;
    state.career.status = "fired";
    state.career.yearsInJob = 0;
    state.job = null;
    state.profession = "none";
    if (window.GameWorkplace?.leave) window.GameWorkplace.leave(state, reason);
    applyEffects(state, { stress: 10, happiness: -6, reputation: -3 }, {});
    syncLegacy(state);
    if (window.GameState?.notify) window.GameState.notify(reason);
    return { ok: true, text: reason };
  }

  function demote(state) {
    if (!state.career?.jobId || state.career.level <= 0) return { ok: false, text: "Понижение недоступно." };
    state.career.level = Math.max(0, state.career.level - 1);
    state.career.burnout = clamp(state.career.burnout - 8, 0, 100);
    syncLegacy(state);
    applyEffects(state, { stress: 5, reputation: -2, happiness: -3 }, {});
    appendCareerHistory(state, "Произошло понижение.");
    if (window.GameState?.notify) window.GameState.notify("Роль стала ниже, но нагрузка немного уменьшилась.");
    return { ok: true };
  }

  function careerBreak(state) {
    if (!window.GameState?.canAct?.()) return { ok: false, text: "Пауза недоступна." };
    window.GameState.spendAction();
    state.career.status = "break";
    state.career.breakYears += 1;
    state.career.burnout = clamp(state.career.burnout - 22, 0, 100);
    applyEffects(state, { stress: -14, mental: 7, energy: 8, reputation: -1 }, {});
    appendCareerHistory(state, "Взят карьерный перерыв.");
    if (window.GameState?.notify) window.GameState.notify("Карьерный перерыв снизил риск выгорания.");
    return { ok: true };
  }

  function develop(state, type) {
    if (!window.GameState?.canAct?.()) return { ok: false };
    if (type === "mentor") {
      const cost = Math.floor(500 * (window.GameState?.cityData?.(state)?.cost || 1));
      if (state.personalMoney < cost) return { ok: false };
    }
    window.GameState.spendAction();
    if (type === "portfolio") {
      applyEffects(state, { portfolio: 8, reputation: 3, stress: 2 }, { leadership: 1 });
      if (window.GameState?.notify) window.GameState.notify("Портфолио усилило вашу карьерную позицию.");
    }
    if (type === "network") {
      applyEffects(state, { network: 8, social: 3, reputation: 2, stress: 2 }, { empathy: 2 });
      if (window.GameState?.notify) window.GameState.notify("Новые профессиональные контакты открыли будущие возможности.");
    }
    if (type === "mentor") {
      const cost = Math.floor(500 * (window.GameState?.cityData?.(state)?.cost || 1));
      state.personalMoney -= cost;
      state.career.mentor = { age: state.age, industry: state.career.industry };
      applyEffects(state, { knowledge: 5, portfolio: 5, network: 5, reputation: 2 }, { [industryData(state.career.industry)?.skills?.[0] || "leadership"]: 4 });
      if (window.GameState?.notify) window.GameState.notify("Ментор ускорил профессиональный рост.");
    }
    return { ok: true };
  }

  function workplaceEvent(state, type, rng = Math.random) {
    const job = jobById(state.career?.jobId);
    if (!job) return { ok: false };
    if (type === "conflict") {
      applyEffects(state, { stress: 8, reputation: rng() < 0.45 ? -3 : 1 }, { empathy: 1 });
      appendCareerHistory(state, "На работе произошел конфликт.");
    }
    if (type === "bonus") {
      const amount = Math.floor(calculateSalary(state, job.id) * (0.18 + rng() * 0.22));
      state.personalMoney += amount;
      applyEffects(state, { happiness: 4, reputation: 2 }, {});
      appendCareerHistory(state, `Получена премия ${window.GameState?.fmt ? window.GameState.fmt(amount) : amount}.`);
    }
    return { ok: true };
  }

  function resolveCareerYear(state, rng = Math.random) {
    const job = jobById(state.career?.jobId);
    if (!job || state.career.status !== "employed") return "";
    state.career.burnout = clamp(state.career.burnout + job.burnoutRisk * 18 + Math.max(0, state.stress - 65) / 12, 0, 100);
    let note = "";
    if (rng() < job.firingRisk + Math.max(0, state.career.burnout - 80) / 400 - (state.reputation || 0) / 1400) {
      fire(state, "Работодатель завершил сотрудничество.");
      return "увольнение";
    }
    if (state.career.burnout > 78 && rng() < job.burnoutRisk) {
      applyEffects(state, { stress: 8, mental: -7, health: -3, happiness: -4 }, {});
      note = "выгорание усилилось";
    }
    if (rng() < 0.08 + (state.reputation || 0) / 1200) {
      const amount = Math.floor(calculateSalary(state, job.id) * 0.12);
      state.personalMoney += amount;
      note = note ? `${note}, премия ${window.GameState?.fmt ? window.GameState.fmt(amount) : amount}` : `премия ${window.GameState?.fmt ? window.GameState.fmt(amount) : amount}`;
    }
    syncLegacy(state);
    return note;
  }

  function applyCareerAction(state, type, payload, rng = Math.random) {
    if (type === "study") return study(state, payload);
    if (type === "interview") return interview(state, payload, rng);
    if (type === "work") return work(state);
    if (type === "side_job") return sideJob(state);
    if (type === "freelance") return freelance(state);
    if (type === "promotion") return promote(state);
    if (type === "fire") return fire(state);
    if (type === "demotion") return demote(state);
    if (type === "break") return careerBreak(state);
    if (["portfolio", "network", "mentor"].includes(type)) return develop(state, type);
    if (["conflict", "bonus"].includes(type)) return workplaceEvent(state, type, rng);
    return { ok: false, text: "Неизвестное карьерное действие." };
  }

  window.GameCareerEngine = {
    legacyEducationMap,
    levels,
    jobs,
    industries,
    levelData,
    jobById,
    industryData,
    educationRank,
    educationName,
    normalizeCareerState,
    syncLegacy,
    missingRequirements,
    meetsJobRequirements,
    availableJobs,
    countrySalaryFactor,
    calculateSalary,
    study,
    interview,
    hire,
    work,
    sideJob,
    freelance,
    promote,
    fire,
    demote,
    careerBreak,
    develop,
    workplaceEvent,
    resolveCareerYear,
    applyCareerAction,
  };
})();
