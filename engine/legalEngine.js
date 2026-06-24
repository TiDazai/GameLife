(() => {
  const { clamp } = window.GameRandom;

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function statuses() {
    return window.GameData.legalStatuses || {};
  }

  function actions() {
    return window.GameData.legalActions || {};
  }

  function offenses() {
    return window.GameData.legalOffenses || [];
  }

  function offenseById(id) {
    return offenses().find((offense) => offense.id === id) || null;
  }

  function caseOutcomes() {
    return window.GameData.legalCaseOutcomes || {};
  }

  function normalizeFine(raw = {}, index = 0) {
    const amount = Math.max(0, Math.floor(safeNumber(raw.amount, raw.value || 0)));
    const paid = Boolean(raw.paid);
    return {
      id: raw.id || `fine-${Date.now()}-${index}`,
      reason: raw.reason || "Штраф",
      amount,
      paid,
      year: Math.floor(safeNumber(raw.year, 0)),
      overdue: Boolean(raw.overdue),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      history: Array.isArray(raw.history) ? raw.history.slice(-8) : [],
    };
  }

  function normalizeCase(raw = {}, index = 0) {
    return {
      id: raw.id || `case-${Date.now()}-${index}`,
      title: raw.title || raw.reason || "Разбирательство",
      type: raw.type || "general",
      severity: clamp(safeNumber(raw.severity, 1), 1, 5),
      status: raw.status || "open",
      openedAge: Math.max(0, Math.floor(safeNumber(raw.openedAge, raw.age || 0))),
      lawyer: Boolean(raw.lawyer),
      restrictions: Array.isArray(raw.restrictions) ? raw.restrictions : [],
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      history: Array.isArray(raw.history) ? raw.history.slice(-12) : [],
    };
  }

  function normalizeLegalState(state, original = state) {
    const legacyStatus = original.legalStatus || (safeNumber(original.criminalRecord) > 0 ? "convicted" : "clean");
    state.reputation = clamp(safeNumber(original.reputation, 0), 0, 100);
    state.karma = clamp(safeNumber(original.karma, 50), 0, 100);
    state.criminalRecord = Math.max(0, Math.floor(safeNumber(original.criminalRecord, 0)));
    state.legalStatus = statuses()[legacyStatus] ? legacyStatus : "clean";
    state.fines = Array.isArray(original.fines) ? original.fines.map(normalizeFine) : [];
    state.activeCases = Array.isArray(original.activeCases) ? original.activeCases.map(normalizeCase) : [];
    state.pastCases = Array.isArray(original.pastCases) ? original.pastCases.map(normalizeCase).slice(0, 36) : [];
    state.publicTrust = clamp(safeNumber(original.publicTrust, Math.floor(state.reputation * 0.6 + state.karma * 0.4)), 0, 100);
    state.socialStanding = clamp(safeNumber(original.socialStanding, Math.floor(state.reputation * 0.5 + state.publicTrust * 0.3 + (100 - state.criminalRecord * 10) * 0.2)), 0, 100);
    state.legalHistory = Array.isArray(original.legalHistory) ? original.legalHistory.slice(0, 36) : [];
    syncLegalStatus(state);
    return state;
  }

  function syncLegalStatus(state) {
    const unpaid = unpaidFines(state).length;
    if (state.criminalRecord >= 3) state.legalStatus = "convicted";
    else if ((state.activeCases || []).some((item) => item.status === "open")) state.legalStatus = "case_open";
    else if (state.criminalRecord > 0 || hasRestriction(state)) state.legalStatus = "restricted";
    else if (unpaid > 0) state.legalStatus = "fined";
    else if (state.publicTrust < 35 || state.reputation < 25) state.legalStatus = "watched";
    else state.legalStatus = "clean";
    state.publicTrust = clamp(state.publicTrust, 0, 100);
    state.socialStanding = clamp(state.socialStanding, 0, 100);
    state.reputation = clamp(state.reputation, 0, 100);
    state.karma = clamp(state.karma, 0, 100);
  }

  function addHistory(state, text) {
    state.legalHistory = Array.isArray(state.legalHistory) ? state.legalHistory : [];
    state.legalHistory.unshift(`${state.age || 0} лет: ${text}`);
    state.legalHistory = state.legalHistory.slice(0, 36);
    if (window.GameState?.addLog) window.GameState.addLog(text);
  }

  function unpaidFines(state) {
    return (state.fines || []).filter((fine) => !fine.paid && fine.amount > 0);
  }

  function addFine(state, amount, reason = "Штраф", options = {}) {
    normalizeLegalState(state, state);
    const fine = normalizeFine({
      id: options.id || `fine-${state.age || 0}-${Date.now()}-${state.fines.length}`,
      reason,
      amount: Math.max(0, Math.floor(safeNumber(amount))),
      year: state.year || 0,
      tags: options.tags || [],
    });
    state.fines.unshift(fine);
    applyEffects(state, { stress: options.stress ?? 2, reputation: options.reputation ?? -1, publicTrust: options.publicTrust ?? -1 });
    addHistory(state, `${reason}: начислен штраф ${window.GameState?.fmt ? window.GameState.fmt(fine.amount) : fine.amount}.`);
    syncLegalStatus(state);
    return fine;
  }

  function addCase(state, caseData = {}) {
    normalizeLegalState(state, state);
    const legalCase = normalizeCase({
      id: caseData.id || `case-${state.age || 0}-${Date.now()}-${state.activeCases.length}`,
      title: caseData.title || "Разбирательство",
      type: caseData.type || "general",
      severity: caseData.severity || 1,
      openedAge: state.age || 0,
      restrictions: caseData.restrictions || [],
      tags: caseData.tags || [],
      history: [`${state.age || 0} лет: дело открыто.`],
    });
    state.activeCases.unshift(legalCase);
    applyEffects(state, { stress: 6, reputation: -2, publicTrust: -3 });
    addHistory(state, `${legalCase.title}: открыто разбирательство.`);
    syncLegalStatus(state);
    return legalCase;
  }

  function closeCase(state, caseId, outcomeId = "warning") {
    normalizeLegalState(state, state);
    const index = state.activeCases.findIndex((item) => item.id === caseId);
    if (index < 0) return { ok: false, text: "Дело не найдено." };
    const legalCase = state.activeCases[index];
    const outcome = caseOutcomes()[outcomeId] || caseOutcomes().warning || { title: "Итог", fineMultiplier: 0, record: 0, reputation: 0, stress: 0 };
    state.activeCases.splice(index, 1);
    legalCase.status = "closed";
    legalCase.outcome = outcome.id || outcomeId;
    legalCase.history.unshift(`${state.age || 0} лет: ${outcome.title}.`);
    state.pastCases.unshift(legalCase);
    state.pastCases = state.pastCases.slice(0, 36);
    if (outcome.fineMultiplier > 0) addFine(state, Math.floor((180 + legalCase.severity * 260) * outcome.fineMultiplier), legalCase.title, { tags: legalCase.tags });
    applyEffects(state, { criminalRecord: outcome.record || 0, reputation: outcome.reputation || 0, stress: outcome.stress || 0, publicTrust: (outcome.reputation || 0) });
    addHistory(state, `${legalCase.title}: ${outcome.title.toLowerCase()}.`);
    syncLegalStatus(state);
    return { ok: true, case: legalCase, outcome };
  }

  function payFine(state, fineId = null) {
    normalizeLegalState(state, state);
    const fine = fineId ? state.fines.find((item) => item.id === fineId && !item.paid) : unpaidFines(state)[0];
    if (!fine) return { ok: false, text: "Неоплаченных штрафов нет." };
    if (!window.GameState?.canAct?.()) return { ok: false, text: "Нет действий." };
    const amount = fine.amount;
    if ((state.personalMoney || 0) + (state.familyMoney || 0) < amount) return { ok: false, text: "Не хватает денег." };
    window.GameState.spendAction();
    if (window.GameEconomyEngine?.payExpense) window.GameEconomyEngine.payExpense(state, `штраф: ${fine.reason}`, amount, { allowDebt: false });
    else if (state.personalMoney >= amount) state.personalMoney -= amount;
    else {
      const rest = amount - state.personalMoney;
      state.personalMoney = 0;
      state.familyMoney = Math.max(0, state.familyMoney - rest);
    }
    fine.paid = true;
    fine.history.unshift(`${state.age || 0} лет: оплачен.`);
    applyEffects(state, { stress: -2, publicTrust: 1 });
    addHistory(state, `Оплачен штраф: ${fine.reason}.`);
    syncLegalStatus(state);
    window.GameState?.notify?.(`Штраф оплачен: ${fine.reason}.`);
    return { ok: true, fine };
  }

  function hireLawyer(state, caseId = null) {
    normalizeLegalState(state, state);
    if (!window.GameState?.canAct?.()) return { ok: false, text: "Нет действий." };
    const target = caseId ? state.activeCases.find((item) => item.id === caseId) : state.activeCases[0];
    if (!target && state.criminalRecord < 1) return { ok: false, text: "Юрист сейчас не нужен." };
    const cost = Math.floor(((actions().lawyer?.baseCost || 950) + (target?.severity || state.criminalRecord || 1) * 420) * (window.GameState?.cityData?.(state)?.cost || 1));
    if ((state.personalMoney || 0) < cost) return { ok: false, text: "Не хватает личных денег." };
    window.GameState.spendAction();
    state.personalMoney -= cost;
    if (target) {
      target.lawyer = true;
      target.severity = Math.max(1, target.severity - 1);
      target.history.unshift(`${state.age || 0} лет: подключен юрист.`);
    } else {
      state.criminalRecord = Math.max(0, state.criminalRecord - 1);
    }
    applyEffects(state, { stress: -5, reputation: 1, publicTrust: 1 });
    addHistory(state, `Юрист помог смягчить правовой риск за ${window.GameState?.fmt ? window.GameState.fmt(cost) : cost}.`);
    syncLegalStatus(state);
    window.GameState?.notify?.("Юрист снизил напряжение вокруг дела.");
    return { ok: true, cost, case: target || null };
  }

  function restoreReputation(state, type = "restore_reputation") {
    normalizeLegalState(state, state);
    const action = actions()[type] || actions().restore_reputation;
    if (!action || !window.GameState?.canAct?.() || state.age < action.minAge) return { ok: false };
    const cost = Math.floor((action.baseCost || 0) * (window.GameState?.cityData?.(state)?.cost || 1));
    if (cost > 0 && (state.personalMoney || 0) < cost) return { ok: false, text: "Не хватает денег." };
    window.GameState.spendAction();
    if (cost > 0) state.personalMoney -= cost;
    applyEffects(state, {
      reputation: action.reputation || 0,
      karma: action.karma || 0,
      publicTrust: action.publicTrust || 0,
      socialStanding: action.socialStanding || 0,
      stress: action.stress || 0,
    });
    if (type === "volunteer" && window.GameState?.improveSkill) window.GameState.improveSkill("empathy", 2);
    addHistory(state, `${action.title}: репутационный след стал мягче.`);
    window.GameState?.notify?.(`${action.title}: доверие немного восстановилось.`);
    return { ok: true, cost };
  }

  function closeTaxIssue(state) {
    normalizeLegalState(state, state);
    if (!window.GameState?.canAct?.() || state.age < 16) return { ok: false };
    const base = actions().close_tax?.baseCost || 250;
    const taxDebt = Math.max(0, safeNumber(state.taxDebt) || safeNumber(state.economy?.taxDebt));
    const cost = Math.floor((base + taxDebt) * (window.GameState?.cityData?.(state)?.cost || 1));
    if ((state.personalMoney || 0) + (state.familyMoney || 0) < cost) return { ok: false, text: "Не хватает денег." };
    window.GameState.spendAction();
    if (window.GameEconomyEngine?.payExpense) window.GameEconomyEngine.payExpense(state, "закрытие налоговой проблемы", cost, { allowDebt: false });
    else state.personalMoney = Math.max(0, state.personalMoney - cost);
    if (state.economy) state.economy.taxDebt = 0;
    state.taxDebt = 0;
    state.activeCases = state.activeCases.filter((item) => !item.tags.includes("tax"));
    applyEffects(state, { stress: -4, reputation: 1, publicTrust: 2 });
    addHistory(state, "Налоговая проблема закрыта.");
    syncLegalStatus(state);
    window.GameState?.notify?.("Налоговая проблема закрыта.");
    return { ok: true, cost };
  }

  function applyEffects(state, effects = {}) {
    normalizeLegalState(state, state);
    Object.entries(effects || {}).forEach(([key, value]) => {
      const amount = safeNumber(value);
      if (["reputation", "karma", "publicTrust", "socialStanding"].includes(key)) state[key] = clamp(safeNumber(state[key]) + amount, 0, 100);
      else if (key === "criminalRecord") state.criminalRecord = Math.max(0, Math.floor(safeNumber(state.criminalRecord) + amount));
      else if (key === "legalStatus" && statuses()[value]) state.legalStatus = value;
      else if (key === "legalFine") addFine(state, amount, "Правовое событие");
      else if (key === "legalCase" && value) addCase(state, typeof value === "object" ? value : { title: String(value), severity: 1 });
      else if (key === "debt" && window.GameEconomyEngine?.takeLoan && amount > 0) window.GameEconomyEngine.takeLoan(state, "consumer", amount, { disburse: false, force: true });
      else if (key in state && window.GameState?.change && ["stress", "happiness", "creditScore", "fame", "mental"].includes(key)) window.GameState.change({ [key]: amount });
      else if (key in state) state[key] = safeNumber(state[key]) + amount;
    });
    syncLegalStatus(state);
  }

  function socialCircleRisk(state) {
    const npcs = state.npcs || [];
    const enemies = npcs.filter((npc) => npc.alive && npc.relationType === "enemy").length;
    const conflicts = npcs.filter((npc) => npc.alive && (npc.conflict || 0) > 65).length;
    const support = npcs.filter((npc) => npc.alive && ["parent", "spouse", "partner", "best_friend", "friend"].includes(npc.relationType) && (npc.trust || 0) > 60).length;
    return enemies * 8 + conflicts * 4 - support * 3;
  }

  function moneyPressure(state) {
    const cash = safeNumber(state.personalMoney) + safeNumber(state.familyMoney);
    const debt = safeNumber(state.debt) + safeNumber(state.taxDebt) + safeNumber(state.economy?.debt);
    return clamp(debt / 180 + Math.max(0, 600 - cash) / 35, 0, 35);
  }

  function legalRisk(state) {
    normalizeLegalState(state, state);
    const citySafety = window.GameState?.cityData?.(state)?.safety ?? 60;
    const risk = 5 +
      Math.max(0, (state.traits?.risk || 0) - 45) * 0.22 +
      Math.max(0, (state.stress || 0) - 45) * 0.18 +
      moneyPressure(state) +
      socialCircleRisk(state) +
      (state.criminalRecord || 0) * 8 +
      Math.max(0, 65 - citySafety) * 0.18;
    return clamp(Math.round(risk), 0, 100);
  }

  function commitOffense(state, offenseId, rng = Math.random) {
    normalizeLegalState(state, state);
    const offense = offenseById(offenseId);
    if (!offense || state.age < offense.minAge || !window.GameState?.canAct?.()) return { ok: false, text: "Недоступно." };
    window.GameState.spendAction();
    const pressure = legalRisk(state) / 260;
    const caught = rng() < clamp(offense.caughtChance + pressure - (state.traits?.risk || 0) / 900, 0.05, 0.85);
    if (caught) {
      const amount = Math.floor(offense.baseFine * (window.GameState?.cityData?.(state)?.cost || 1));
      addFine(state, amount, offense.title, { tags: offense.tags, stress: 4, reputation: -2 });
      if (offense.tags.includes("case")) addCase(state, { title: offense.title, type: offense.id, severity: 1 + Math.floor(amount / 500), tags: offense.tags });
      applyEffects(state, offense.effectsOnCaught);
      addHistory(state, `${offense.title}: последствия оказались заметными.`);
      window.GameState?.notify?.(`${offense.title}: возникли правовые последствия.`);
      return { ok: true, caught: true };
    }
    const gain = Math.floor((offense.baseFine * 0.7 + (rng() * offense.baseFine)) * (window.GameState?.cityData?.(state)?.cost || 1));
    if (window.GameEconomyEngine?.recordIncome) window.GameEconomyEngine.recordIncome(state, "сомнительный доход", gain, true);
    else state.personalMoney += gain;
    applyEffects(state, { stress: 5, karma: -6, reputation: -2, publicTrust: -2 });
    addHistory(state, `${offense.title}: получилось избежать формального дела, но доверие просело.`);
    window.GameState?.notify?.(`Рискованное действие принесло ${window.GameState?.fmt ? window.GameState.fmt(gain) : gain}, но оставило след.`);
    return { ok: true, caught: false, gain };
  }

  function hasRestriction(state, restriction = null) {
    const cases = state.activeCases || [];
    if (!restriction) return cases.some((item) => (item.restrictions || []).length);
    return cases.some((item) => (item.restrictions || []).includes(restriction));
  }

  function careerPenalty(state, job = null) {
    normalizeLegalState(state, state);
    let penalty = 0;
    if (state.legalStatus === "case_open") penalty += 0.08;
    if (state.legalStatus === "restricted") penalty += 0.12;
    if (state.legalStatus === "convicted") penalty += 0.22;
    penalty += Math.min(0.28, (state.criminalRecord || 0) * 0.045);
    if (job && ["government", "finance", "medicine", "education"].includes(job.industry) && state.criminalRecord > 0) penalty += 0.1;
    return clamp(penalty, 0, 0.5);
  }

  function careerBlockReason(state, job = null) {
    normalizeLegalState(state, state);
    if (!job) return "";
    if (hasRestriction(state, "work")) return "ограничение на работу";
    if (["government", "finance", "medicine", "education"].includes(job.industry) && state.criminalRecord >= 2) return "юридический след для доверительной отрасли";
    if (state.legalStatus === "convicted" && job.prestige >= 70) return "высокий уровень правовых проверок";
    return "";
  }

  function canAcquireDocument(state, documentId) {
    normalizeLegalState(state, state);
    if (documentId === "passport" && (hasRestriction(state, "travel") || state.legalStatus === "case_open")) return { ok: false, text: "Есть ограничение на поездки." };
    if (documentId === "workPermit" && (hasRestriction(state, "work") || state.legalStatus === "convicted")) return { ok: false, text: "Есть ограничение на работу." };
    return { ok: true };
  }

  function resolveLegalYear(state, rng = Math.random) {
    normalizeLegalState(state, state);
    const notes = [];
    unpaidFines(state).forEach((fine) => {
      if (rng() < 0.25 || fine.overdue) {
        fine.overdue = true;
        fine.amount = Math.floor(fine.amount * 1.08 + 25);
        applyEffects(state, { stress: 1, publicTrust: -1, creditScore: -1 });
        notes.push("штраф вырос");
      }
    });
    [...state.activeCases].forEach((legalCase) => {
      const base = 0.2 + legalCase.severity * 0.08 + (legalCase.lawyer ? 0.18 : 0);
      if (rng() < base) {
        const outcome = legalCase.lawyer ? "warning" : legalCase.severity >= 4 ? "conviction" : rng() < 0.55 ? "fine" : "probation";
        closeCase(state, legalCase.id, outcome);
        notes.push("дело закрыто");
      } else {
        applyEffects(state, { stress: 2, reputation: -1 });
      }
    });
    if (state.publicTrust < 30 && rng() < 0.2) {
      applyEffects(state, { socialStanding: -2, reputation: -1 });
      notes.push("доверие снизилось");
    }
    syncLegalStatus(state);
    return notes.join(", ");
  }

  window.GameLegalEngine = {
    statuses,
    actions,
    offenses,
    offenseById,
    normalizeLegalState,
    syncLegalStatus,
    addFine,
    addCase,
    closeCase,
    payFine,
    hireLawyer,
    restoreReputation,
    closeTaxIssue,
    applyEffects,
    legalRisk,
    moneyPressure,
    socialCircleRisk,
    commitOffense,
    hasRestriction,
    careerPenalty,
    careerBlockReason,
    canAcquireDocument,
    unpaidFines,
    resolveLegalYear,
  };
})();
