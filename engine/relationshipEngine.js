(() => {
  const { clamp, roll } = window.GameRandom;
  const NpcFactory = window.GameNpcFactory;

  const relationLabels = {
    self: "Вы",
    parent: "Родитель",
    grandparent: "Старшее поколение",
    sibling: "Брат/сестра",
    friend: "Друг",
    best_friend: "Близкий друг",
    partner: "Партнер",
    ex_partner: "Бывший партнер",
    spouse: "Супруг/супруга",
    child: "Ребенок",
    coworker: "Коллега",
    mentor: "Наставник",
    enemy: "Недоброжелатель",
    acquaintance: "Знакомый",
  };

  const relationStats = ["bond", "trust", "conflict", "romance", "respect", "health", "mental"];

  function list(state) {
    if (!Array.isArray(state.npcs)) state.npcs = [];
    return state.npcs;
  }

  function findNpc(state, id) {
    return list(state).find((npc) => npc.id === id) || null;
  }

  function getByRelation(state, relationType) {
    return list(state).filter((npc) => npc.relationType === relationType);
  }

  function activePartner(state) {
    return list(state).find((npc) => npc.alive && (npc.relationType === "spouse" || npc.relationType === "partner")) || null;
  }

  function spouse(state) {
    return list(state).find((npc) => npc.alive && npc.relationType === "spouse") || null;
  }

  function children(state) {
    return getByRelation(state, "child");
  }

  function parents(state) {
    return getByRelation(state, "parent");
  }

  function addNpc(state, npc) {
    const normalized = NpcFactory.normalizeNpc(npc, state);
    const existingIndex = list(state).findIndex((item) => item.id === normalized.id);
    if (existingIndex >= 0) state.npcs[existingIndex] = normalized;
    else state.npcs.push(normalized);
    syncLegacy(state);
    return normalized;
  }

  function addNpcHistory(npc, text) {
    if (!npc || !text) return;
    npc.history = Array.isArray(npc.history) ? npc.history : [];
    npc.history.unshift(text);
    npc.history = npc.history.slice(0, 16);
  }

  function changeNpc(npc, deltas = {}) {
    if (!npc) return null;
    for (const [key, amount] of Object.entries(deltas)) {
      if (relationStats.includes(key)) {
        npc[key] = clamp((Number(npc[key]) || 0) + (Number(amount) || 0), 0, 100);
      } else if (key === "money") {
        npc.money = Math.max(0, Math.floor((Number(npc.money) || 0) + (Number(amount) || 0)));
      }
    }
    npc.job = npc.occupation;
    // keep the grouped relationshipStats snapshot in sync with legacy fields
    if (npc.relationshipStats && typeof npc.relationshipStats === "object") {
      ["bond", "trust", "conflict", "romance", "respect"].forEach((key) => {
        if (key in npc) npc.relationshipStats[key] = npc[key];
      });
    }
    return npc;
  }

  function legacyMember(npc) {
    return {
      ...npc,
      name: npc.name,
      role: npc.role || relationLabels[npc.relationType] || "Родственник",
      job: npc.occupation,
    };
  }

  function syncLegacy(state) {
    const npcs = list(state);
    const familyTypes = new Set(["self", "parent", "grandparent", "sibling"]);
    state.family = npcs.filter((npc) => familyTypes.has(npc.relationType)).map(legacyMember);
    const partner = activePartner(state);
    state.relationship = partner
      ? {
          id: partner.id,
          name: partner.name,
          lastName: partner.lastName,
          age: partner.age,
          bond: partner.bond,
          trust: partner.trust,
          romance: partner.romance,
          conflict: partner.conflict,
          respect: partner.respect,
          health: partner.health,
          mental: partner.mental,
          money: partner.money,
          occupation: partner.occupation,
          gender: partner.gender,
          sharedBudget: partner.tags.includes("shared_budget"),
          married: partner.relationType === "spouse",
        }
      : null;
    state.children = children(state).map((child) => ({
      id: child.id,
      name: child.name,
      lastName: child.lastName,
      gender: child.gender,
      age: child.age,
      bond: child.bond,
      trust: child.trust,
      health: child.health,
      mental: child.mental,
      education: child.education || 0,
      talent: child.talent || Math.max(30, Math.floor((child.personality.curiosity + child.personality.ambition) / 2)),
    }));
    return state;
  }

  function ensurePlayer(state) {
    if (!findNpc(state, "player")) state.npcs.unshift(NpcFactory.createPlayerNpc(state));
  }

  function normalizeNpcs(state) {
    const migrated = [];
    if (Array.isArray(state.npcs) && state.npcs.length) {
      state.npcs = state.npcs.map((npc) => NpcFactory.normalizeNpc(npc, state));
      ensurePlayer(state);
      syncLegacy(state);
      return state.npcs;
    }

    (Array.isArray(state.family) ? state.family : []).forEach((member) => migrated.push(NpcFactory.migrateLegacyPerson(member, state)));
    if (!migrated.some((npc) => npc.id === "player")) migrated.unshift(NpcFactory.createPlayerNpc(state));
    const partner = NpcFactory.migrateLegacyPartner(state.relationship, state);
    if (partner) migrated.push(partner);
    (Array.isArray(state.children) ? state.children : []).forEach((child) => migrated.push(NpcFactory.migrateLegacyChild(child, state)));
    state.npcs = migrated;
    syncLegacy(state);
    return state.npcs;
  }

  function startRelationship(state, input = {}) {
    if (activePartner(state)) return null;
    const npc = input.id ? NpcFactory.normalizeNpc(input, state) : NpcFactory.createPartnerNpc(state, input);
    npc.relationType = "partner";
    npc.role = relationLabels.partner;
    npc.romance = clamp(npc.romance || 45, 0, 100);
    if (!npc.metContext) npc.metContext = "dating";
    if (npc.metYear == null) npc.metYear = state.age || 0;
    addNpcHistory(npc, "Начались отношения.");
    addNpc(state, npc);
    return npc;
  }

  function setRelation(state, npcId, relationType, text) {
    const npc = findNpc(state, npcId);
    if (!npc) return null;
    npc.relationType = relationType;
    npc.role = relationLabels[relationType] || npc.role;
    addNpcHistory(npc, text);
    syncLegacy(state);
    return npc;
  }

  function marryNpc(state, npcId) {
    const npc = findNpc(state, npcId) || activePartner(state);
    if (!npc || npc.relationType !== "partner") return null;
    npc.tags = npc.tags.filter((tag) => tag !== "engaged");
    return setRelation(state, npc.id, "spouse", "Оформлен брак.");
  }

  function divorceNpc(state, npcId) {
    const npc = findNpc(state, npcId) || spouse(state);
    if (!npc || npc.relationType !== "spouse") return null;
    npc.tags = npc.tags.filter((tag) => tag !== "shared_budget" && tag !== "engaged");
    changeNpc(npc, { romance: -35, trust: -12, bond: -18, conflict: 12 });
    return setRelation(state, npc.id, "ex_partner", "Брак завершился разводом.");
  }

  function breakupNpc(state, npcId) {
    const npc = findNpc(state, npcId) || activePartner(state);
    if (!npc || npc.relationType !== "partner") return null;
    changeNpc(npc, { romance: -30, trust: -8, bond: -12, conflict: 8 });
    return setRelation(state, npc.id, "ex_partner", "Отношения завершились.");
  }

  function createChild(state, input = {}) {
    const child = NpcFactory.createChildNpc(state, input);
    addNpcHistory(child, "Рождение в семье.");
    addNpc(state, child);
    return child;
  }

  function npcDeathRisk(npc) {
    const ageRisk = npc.age < 55 ? 0.0006 : npc.age < 65 ? 0.003 : npc.age < 78 ? 0.018 : npc.age < 90 ? 0.06 : 0.14;
    const healthRisk = npc.age < 65 ? (100 - npc.health) / 7000 : (100 - npc.health) / 2600;
    const mentalRisk = Math.max(0, 25 - npc.mental) / 3500;
    return Math.max(0, ageRisk + healthRisk + mentalRisk);
  }

  function maybeNpcDeath(state, npc, rng = Math.random) {
    if (!npc || !npc.alive || npc.relationType === "self") return false;
    if (rng() >= npcDeathRisk(npc)) return false;
    npc.alive = false;
    addNpcHistory(npc, "Ушел из жизни.");
    const label = npc.role || relationLabels[npc.relationType] || "Близкий человек";
    if (window.GameState?.change) window.GameState.change({ happiness: -10, stress: 10, mental: -4 });
    if (window.GameState?.addLog) window.GameState.addLog(`${label} ${npc.name} ${npc.gender === "female" ? "ушла" : "ушел"} из жизни.`);
    return true;
  }

  function applyYearlyNpcDrift(state, npc, rng = Math.random) {
    if (npc.relationType === "self") {
      npc.age = state.age;
      npc.health = state.health;
      npc.mental = state.mental;
      npc.money = Math.max(0, state.personalMoney || 0);
      return;
    }
    if (npc.alive) {
      npc.age += 1;
      npc.health = clamp(npc.health + roll(7) - 4, 0, 100);
      npc.mental = clamp(npc.mental + roll(7) - 4, 0, 100);
      const warmth = (npc.bond + npc.trust + npc.respect) / 3;
      const conflictPressure = npc.conflict > 55 ? 2 : npc.conflict > 30 ? 1 : 0;
      changeNpc(npc, {
        bond: (warmth > 70 ? 1 : 0) - conflictPressure + Math.floor(rng() * 3) - 1,
        trust: npc.conflict > 60 ? -2 : Math.floor(rng() * 3) - 1,
        conflict: (state.stress > 70 ? 2 : state.happiness > 70 ? -1 : 0) + Math.floor(rng() * 3) - 1,
        respect: npc.relationType === "child" && state.reputation > 60 ? 1 : 0,
      });
      maybeNpcDeath(state, npc, rng);
    }
  }

  function yearlyRelationships(state, rng = Math.random) {
    normalizeNpcs(state);
    const beforeAliveChildren = children(state).filter((child) => child.alive).length;
    list(state).forEach((npc) => applyYearlyNpcDrift(state, npc, rng));
    const partner = activePartner(state);
    const liveFamily = list(state).filter((npc) => npc.alive && ["parent", "grandparent", "sibling", "child", "spouse", "partner"].includes(npc.relationType));
    const avgBond = liveFamily.length ? liveFamily.reduce((sum, npc) => sum + npc.bond - npc.conflict * 0.4, 0) / liveFamily.length : 50;
    const partnerEffect = partner ? Math.floor((partner.bond + partner.trust + partner.romance - partner.conflict * 1.4 - 150) / 28) : 0;
    const childPressure = Math.max(0, beforeAliveChildren - 1);
    if (window.GameState?.change) {
      window.GameState.change({
        happiness: clamp(Math.floor((avgBond - 50) / 18) + partnerEffect, -8, 8),
        stress: clamp(Math.floor((50 - avgBond) / 18) + childPressure, -5, 8),
        mental: clamp(Math.floor((avgBond - 50) / 22), -5, 5),
        reputation: liveFamily.some((npc) => npc.relationType === "enemy") ? -1 : 0,
      });
    }
    syncLegacy(state);
    return state.npcs;
  }

  window.GameRelationshipEngine = {
    relationLabels,
    list,
    findNpc,
    getByRelation,
    activePartner,
    spouse,
    children,
    parents,
    addNpc,
    addNpcHistory,
    changeNpc,
    syncLegacy,
    normalizeNpcs,
    startRelationship,
    marryNpc,
    divorceNpc,
    breakupNpc,
    createChild,
    maybeNpcDeath,
    yearlyRelationships,
  };
})();
