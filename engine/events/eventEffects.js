(() => {
  const boundedStats = [
    "health",
    "happiness",
    "knowledge",
    "social",
    "discipline",
    "stress",
    "mental",
    "energy",
    "grades",
    "reputation",
    "lifestyle",
    "portfolio",
    "network",
    "creditScore",
    "looks",
    "fame",
    "karma",
  ];
  const healthProfileStats = ["sleep", "immunity", "fitness"];

  function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function addBounded(state, key, amount) {
    state[key] = window.GameRandom.clamp(safeNumber(state[key]) + safeNumber(amount), 0, 100);
  }

  function addOpen(state, key, amount, min = -Infinity) {
    state[key] = Math.max(min, safeNumber(state[key]) + safeNumber(amount));
  }

  function ensureFlags(state) {
    if (!Array.isArray(state.flags)) state.flags = [];
  }

  function applySkill(state, key, amount) {
    if (!state.skills) state.skills = {};
    state.skills[key] = window.GameRandom.clamp(safeNumber(state.skills[key]) + safeNumber(amount), 0, 100);
  }

  function applyRelationship(state, key, amount) {
    const npc = window.GameRelationshipEngine?.activePartner?.(state);
    if (npc) {
      window.GameRelationshipEngine.changeNpc(npc, { [key]: amount });
      window.GameRelationshipEngine.syncLegacy(state);
      return;
    }
    if (state.relationship) state.relationship[key] = window.GameRandom.clamp(safeNumber(state.relationship[key]) + safeNumber(amount), 0, 100);
  }

  function startRelationship(state, rng = Math.random) {
    if (state.relationship) return;
    if (window.GameRelationshipEngine?.startRelationship) {
      window.GameRelationshipEngine.startRelationship(state, { gender: rng() > 0.5 ? "female" : "male" });
      return;
    }
    const names = window.GameData?.names || { male: ["Илья"], female: ["Анна"] };
    const gender = rng() > 0.5 ? "female" : "male";
    const list = names[gender] || names.female;
    state.relationship = {
      name: list[Math.floor(rng() * list.length)] || "Партнер",
      age: state.age + Math.floor(rng() * 5) - 2,
      bond: 45 + Math.floor((safeNumber(state.social) + safeNumber(state.happiness)) / 5),
      trust: 42 + Math.floor(safeNumber(state.skills?.empathy) / 3),
      romance: 38 + Math.floor(rng() * 20),
      conflict: 8 + Math.floor(rng() * 12),
      sharedBudget: false,
      married: false,
      gender,
    };
  }

  function applyEffects(state, effects = {}, rng = Math.random) {
    for (const [key, rawAmount] of Object.entries(effects || {})) {
      if (rawAmount === undefined || rawAmount === null) continue;
      if (["legalFine", "legalCase", "legalStatus", "publicTrust", "socialStanding"].includes(key) && window.GameLegalEngine?.applyEffects) {
        window.GameLegalEngine.applyEffects(state, { [key]: rawAmount });
      } else if (["health", "mental", "stress", "energy"].includes(key) && window.GameHealthEngine?.applyEffects) {
        window.GameHealthEngine.applyEffects(state, { [key]: rawAmount });
      } else if (boundedStats.includes(key)) {
        addBounded(state, key, rawAmount);
      } else if (healthProfileStats.includes(key)) {
        if (window.GameHealthEngine?.applyEffects) window.GameHealthEngine.applyEffects(state, { [key]: rawAmount });
      } else if (state.skills && key in state.skills) {
        applySkill(state, key, rawAmount);
      } else if (key === "money" || key === "personalMoney") {
        if (window.GameEconomyEngine?.recordIncome && safeNumber(rawAmount) > 0) window.GameEconomyEngine.recordIncome(state, "событие", rawAmount, true);
        else if (window.GameEconomyEngine?.payExpense && safeNumber(rawAmount) < 0) window.GameEconomyEngine.payExpense(state, "событие", Math.abs(safeNumber(rawAmount)), { loanType: "consumer" });
        else addOpen(state, "personalMoney", rawAmount, 0);
      } else if (key === "familyMoney") {
        addOpen(state, "familyMoney", rawAmount, 0);
      } else if (key === "debt") {
        if (window.GameEconomyEngine?.takeLoan && safeNumber(rawAmount) > 0) window.GameEconomyEngine.takeLoan(state, "consumer", rawAmount, { disburse: false, force: true });
        else addOpen(state, key, rawAmount, 0);
      } else if (key === "taxDebt") {
        if (state.economy) state.economy.taxDebt = Math.max(0, safeNumber(state.economy.taxDebt) + safeNumber(rawAmount));
        addOpen(state, key, rawAmount, 0);
        window.GameEconomyEngine?.syncLegacy?.(state);
      } else if (key === "criminalRecord" && window.GameLegalEngine?.applyEffects) {
        window.GameLegalEngine.applyEffects(state, { criminalRecord: rawAmount });
      } else if (key === "experience" || key === "careerLevel") {
        addOpen(state, key, rawAmount, 0);
      } else if (key === "danger") {
        state.dangerThisYear = window.GameRandom.clamp(safeNumber(state.dangerThisYear) + safeNumber(rawAmount), 0, 100);
      } else if (key === "careerBurnout") {
        if (state.career) state.career.burnout = window.GameRandom.clamp(safeNumber(state.career.burnout) + safeNumber(rawAmount), 0, 100);
      } else if (key === "careerPromotion" && rawAmount) {
        window.GameCareerEngine?.promote?.(state);
      } else if (key === "careerFired" && rawAmount) {
        window.GameCareerEngine?.fire?.(state, "Карьерное событие привело к увольнению.");
      } else if (key === "careerDemotion" && rawAmount) {
        window.GameCareerEngine?.demote?.(state);
      } else if (key === "careerBonus" && rawAmount) {
        const salary = window.GameCareerEngine?.calculateSalary?.(state) || 0;
        if (window.GameEconomyEngine?.recordIncome) window.GameEconomyEngine.recordIncome(state, "карьерная премия", Math.floor(salary * safeNumber(rawAmount)), true);
        else addOpen(state, "personalMoney", Math.floor(salary * safeNumber(rawAmount)), 0);
      } else if (key === "healthCondition" || key === "addHealthCondition") {
        if (rawAmount) window.GameHealthEngine?.addCondition?.(state, String(rawAmount), "event");
      } else if (key === "removeHealthCondition") {
        if (rawAmount) window.GameHealthEngine?.removeCondition?.(state, String(rawAmount));
      } else if (key === "relationshipTrust") {
        applyRelationship(state, "trust", rawAmount);
      } else if (key === "relationshipRomance") {
        applyRelationship(state, "romance", rawAmount);
      } else if (key === "relationshipConflict") {
        applyRelationship(state, "conflict", rawAmount);
      } else if (key === "relationshipBond") {
        applyRelationship(state, "bond", rawAmount);
      } else if (key === "relationshipStart" && rawAmount) {
        startRelationship(state, rng);
      } else if (key === "familyBond") {
        if (window.GameRelationshipEngine?.changeNpc) {
          (state.npcs || []).forEach((npc) => {
            if (npc.relationType !== "self" && ["parent", "grandparent", "sibling", "child", "spouse", "partner"].includes(npc.relationType)) {
              window.GameRelationshipEngine.changeNpc(npc, { bond: rawAmount });
            }
          });
          window.GameRelationshipEngine.syncLegacy(state);
        } else {
          (state.family || []).forEach((member) => {
            if (member.id !== "player") member.bond = window.GameRandom.clamp(safeNumber(member.bond) + safeNumber(rawAmount), 0, 100);
          });
        }
      } else if (key === "childBond") {
        if (window.GameRelationshipEngine?.changeNpc) {
          (state.npcs || []).filter((npc) => npc.relationType === "child").forEach((child) => window.GameRelationshipEngine.changeNpc(child, { bond: rawAmount }));
          window.GameRelationshipEngine.syncLegacy(state);
        } else {
          (state.children || []).forEach((child) => {
            child.bond = window.GameRandom.clamp(safeNumber(child.bond) + safeNumber(rawAmount), 0, 100);
          });
        }
      } else if (key === "npcTrust" || key === "npcBond" || key === "npcConflict" || key === "npcRespect") {
        const map = { npcTrust: "trust", npcBond: "bond", npcConflict: "conflict", npcRespect: "respect" };
        const relationType = effects.npcRelationType || "parent";
        (state.npcs || []).filter((npc) => npc.alive && npc.relationType === relationType).forEach((npc) => {
          window.GameRelationshipEngine?.changeNpc?.(npc, { [map[key]]: rawAmount });
        });
        window.GameRelationshipEngine?.syncLegacy?.(state);
      } else if (key === "flags") {
        ensureFlags(state);
        rawAmount.forEach((flag) => {
          if (!state.flags.includes(flag)) state.flags.push(flag);
        });
      } else if (key === "removeFlags") {
        ensureFlags(state);
        state.flags = state.flags.filter((flag) => !rawAmount.includes(flag));
      }
    }
  }

  window.GameEventEffects = { applyEffects, safeNumber, boundedStats };
})();
