(() => {
  const { clamp, pick, roll } = window.GameRandom;

  const relationTypes = [
    "parent",
    "grandparent",
    "sibling",
    "friend",
    "best_friend",
    "partner",
    "ex_partner",
    "spouse",
    "child",
    "coworker",
    "mentor",
    "enemy",
    "acquaintance",
    "self",
  ];

  const roleByRelation = {
    self: "Главный герой",
    parent: "Родитель",
    grandparent: "Старший родственник",
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

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function safeText(value, fallback = "") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function randomId(prefix = "npc") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function nameData() {
    return window.GameData?.npcNames || window.GameData?.names || { male: ["Илья"], female: ["Анна"], last: ["Новиков"], occupations: ["специалист"] };
  }

  function randomFirstName(gender) {
    const names = nameData();
    return pick(names[gender] || names.female || ["Анна"]);
  }

  function randomLastName() {
    return pick(nameData().last || ["Новиков"]);
  }

  function randomOccupation() {
    return pick(nameData().occupations || ["специалист"]);
  }

  function normalizePersonality(personality = {}) {
    return {
      curiosity: clamp(safeNumber(personality.curiosity, 45 + roll(25)), 0, 100),
      risk: clamp(safeNumber(personality.risk, 35 + roll(35)), 0, 100),
      kindness: clamp(safeNumber(personality.kindness, 40 + roll(35)), 0, 100),
      ambition: clamp(safeNumber(personality.ambition, 35 + roll(40)), 0, 100),
      patience: clamp(safeNumber(personality.patience, 35 + roll(35)), 0, 100),
    };
  }

  function legacyRelationType(raw = {}) {
    if (raw.relationType && relationTypes.includes(raw.relationType)) return raw.relationType;
    if (raw.id === "player") return "self";
    if (raw.id === "mother" || raw.id === "father" || /мама|папа|родител/i.test(raw.role || "")) return "parent";
    if (/бабуш|дедуш|старш/i.test(raw.role || "")) return "grandparent";
    if (/ребен|сын|дочь/i.test(raw.role || "")) return "child";
    if (raw.married) return "spouse";
    if (raw.romance !== undefined) return "partner";
    return "acquaintance";
  }

  function createNpc(input = {}) {
    const gender = input.gender === "female" ? "female" : "male";
    const relationType = relationTypes.includes(input.relationType) ? input.relationType : "acquaintance";
    const npc = {
      id: input.id || randomId(relationType),
      name: safeText(input.name || input.firstName, randomFirstName(gender)),
      lastName: safeText(input.lastName, randomLastName()),
      gender,
      age: Math.max(0, Math.floor(safeNumber(input.age, 18))),
      role: safeText(input.role, roleByRelation[relationType] || "Знакомый"),
      alive: input.alive !== false,
      health: clamp(safeNumber(input.health, 60 + roll(30)), 0, 100),
      mental: clamp(safeNumber(input.mental, 55 + roll(30)), 0, 100),
      money: Math.max(0, Math.floor(safeNumber(input.money, 120 + roll(900)))),
      occupation: safeText(input.occupation || input.job, relationType === "child" ? "растет" : randomOccupation()),
      personality: normalizePersonality(input.personality),
      bond: clamp(safeNumber(input.bond, 35 + roll(35)), 0, 100),
      trust: clamp(safeNumber(input.trust, 35 + roll(35)), 0, 100),
      conflict: clamp(safeNumber(input.conflict, 8 + roll(18)), 0, 100),
      romance: clamp(safeNumber(input.romance, relationType === "partner" || relationType === "spouse" ? 40 + roll(30) : 0), 0, 100),
      respect: clamp(safeNumber(input.respect, 35 + roll(35)), 0, 100),
      relationType,
      tags: Array.isArray(input.tags) ? [...new Set(input.tags)] : [],
      history: Array.isArray(input.history) ? input.history.slice(-16) : [],
    };
    npc.job = npc.occupation;
    return npc;
  }

  function normalizeNpc(raw = {}, state = {}) {
    const relationType = legacyRelationType(raw);
    const fullName = String(raw.name || "").trim().split(/\s+/);
    return createNpc({
      ...raw,
      name: raw.firstName || fullName[0] || raw.name,
      lastName: raw.lastName || (fullName.length > 1 ? fullName.slice(1).join(" ") : state.lastName),
      relationType,
      occupation: raw.occupation || raw.job,
      tags: raw.sharedBudget ? [...(raw.tags || []), "shared_budget"] : raw.tags,
    });
  }

  function createPlayerNpc(state) {
    return createNpc({
      id: "player",
      name: state.firstName || "Вы",
      lastName: state.lastName || "",
      gender: state.gender || "male",
      age: state.age || 0,
      role: "Главный герой",
      alive: !state.deceased,
      health: state.health,
      mental: state.mental,
      money: state.personalMoney,
      occupation: state.age < 18 ? "растет" : "самостоятельная жизнь",
      bond: 100,
      trust: 100,
      conflict: 0,
      respect: 100,
      relationType: "self",
      tags: ["player"],
    });
  }

  function createParentNpc(input = {}) {
    return createNpc({ relationType: "parent", bond: 68, trust: 62, respect: 66, ...input });
  }

  function createGrandparentNpc(input = {}) {
    return createNpc({ relationType: "grandparent", bond: 52, trust: 54, respect: 70, occupation: "пенсионер", ...input });
  }

  function createPartnerNpc(state = {}, input = {}) {
    const gender = input.gender || (Math.random() > 0.5 ? "female" : "male");
    return createNpc({
      relationType: input.married ? "spouse" : "partner",
      gender,
      age: Math.max(16, (state.age || 18) + roll(5) - 2),
      lastName: input.lastName || state.lastName || randomLastName(),
      bond: 45 + Math.floor(((state.social || 0) + (state.happiness || 0)) / 5),
      trust: 42 + Math.floor(((state.skills?.empathy || 0) / 3)),
      romance: 38 + roll(20),
      respect: 45,
      ...input,
    });
  }

  function createChildNpc(state = {}, input = {}) {
    const gender = input.gender || (Math.random() > 0.5 ? "male" : "female");
    return createNpc({
      relationType: "child",
      gender,
      age: 0,
      lastName: state.lastName || input.lastName || randomLastName(),
      occupation: "растет",
      bond: 80,
      trust: 72,
      conflict: 4,
      respect: 45,
      health: 70 + roll(25),
      mental: 70 + roll(20),
      money: 0,
      tags: ["family"],
      ...input,
    });
  }

  function migrateLegacyPerson(raw, state = {}) {
    return normalizeNpc(raw, state);
  }

  function migrateLegacyPartner(raw, state = {}) {
    if (!raw) return null;
    return createPartnerNpc(state, {
      ...raw,
      relationType: raw.married ? "spouse" : "partner",
      role: raw.married ? "Супруг/супруга" : "Партнер",
      tags: raw.sharedBudget ? ["shared_budget"] : [],
    });
  }

  function migrateLegacyChild(raw, state = {}) {
    return createChildNpc(state, {
      ...raw,
      relationType: "child",
      role: "Ребенок",
      trust: raw.trust ?? raw.bond ?? 70,
      respect: raw.respect ?? 42,
      mental: raw.mental ?? 72,
      money: raw.money ?? 0,
      tags: raw.tags || ["family"],
    });
  }

  window.GameNpcFactory = {
    relationTypes,
    roleByRelation,
    safeNumber,
    randomId,
    randomFirstName,
    randomLastName,
    randomOccupation,
    createNpc,
    normalizeNpc,
    createPlayerNpc,
    createParentNpc,
    createGrandparentNpc,
    createPartnerNpc,
    createChildNpc,
    migrateLegacyPerson,
    migrateLegacyPartner,
    migrateLegacyChild,
  };
})();
