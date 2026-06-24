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
    // --- deepened relation taxonomy ---
    "crush",
    "date",
    "hookup_18_plus",
    "boss",
    "teacher",
    "professor",
    "classmate",
    "doctor",
    "therapist",
    "client",
    "business_partner",
    "landlord",
    "tenant",
    "police_officer",
    "lawyer",
    "rival",
  ];

  // Relation groups used by UI filters and event routing.
  const relationGroups = {
    family: ["parent", "grandparent", "sibling", "child", "spouse"],
    friends: ["friend", "best_friend", "acquaintance"],
    romance: ["partner", "crush", "date", "hookup_18_plus"],
    exes: ["ex_partner"],
    work: ["coworker", "boss", "client", "business_partner", "mentor"],
    study: ["classmate", "teacher", "professor"],
    services: ["doctor", "therapist", "lawyer", "police_officer", "landlord", "tenant"],
    other: ["enemy", "rival"],
  };

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
    crush: "Симпатия",
    date: "Свидание",
    hookup_18_plus: "Связь 18+",
    boss: "Начальник",
    teacher: "Учитель",
    professor: "Преподаватель",
    classmate: "Одногруппник",
    doctor: "Врач",
    therapist: "Психолог",
    client: "Клиент",
    business_partner: "Деловой партнёр",
    landlord: "Арендодатель",
    tenant: "Арендатор",
    police_officer: "Полицейский",
    lawyer: "Юрист",
    rival: "Соперник",
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

  function randomFirstName(gender, country) {
    if (country && window.GameNames?.firstName) return window.GameNames.firstName(country, gender);
    const names = nameData();
    return pick(names[gender] || names.female || ["Анна"]);
  }

  function randomLastName(country) {
    if (country && window.GameNames?.lastName) return window.GameNames.lastName(country);
    return pick(nameData().last || ["Новиков"]);
  }

  function randomOccupation() {
    return pick(nameData().occupations || ["специалист"]);
  }

  // Tasteful, non-graphic appearance descriptors (game flavor only).
  const HEIGHT_BANDS = ["невысокий", "среднего роста", "высокий"];
  const BUILDS = ["худощавое", "среднее", "спортивное", "плотное"];
  const STYLES = ["простой", "спортивный", "деловой", "элегантный", "неформальный"];
  const HAIR = ["тёмные", "светлые", "русые", "рыжие", "седые"];
  const VIBES = ["спокойный", "энергичный", "сдержанный", "обаятельный", "серьёзный"];

  function buildAppearance(appearance = {}) {
    return {
      height: safeText(appearance.height, pick(HEIGHT_BANDS)),
      build: safeText(appearance.build, pick(BUILDS)),
      style: safeText(appearance.style, pick(STYLES)),
      hair: safeText(appearance.hair, pick(HAIR)),
      vibe: safeText(appearance.vibe, pick(VIBES)),
    };
  }

  // Abstract, adult-only (18+) relationship dimension. Never graphic.
  function buildSexualityProfile(input, age) {
    if (!input || (age || 0) < 18) return null;
    const src = typeof input === "object" ? input : {};
    return {
      orientation: ["hetero", "homo", "bi", "unspecified"].includes(src.orientation) ? src.orientation : "unspecified",
      openness: clamp(safeNumber(src.openness, 30 + roll(40)), 0, 100),
      style: ["monogamous", "casual", "open", "unspecified"].includes(src.style) ? src.style : "unspecified",
      active: Boolean(src.active),
    };
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
    const country = input.country;
    const npc = {
      id: input.id || randomId(relationType),
      name: safeText(input.name || input.firstName, randomFirstName(gender, country)),
      lastName: safeText(input.lastName, randomLastName(country)),
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
      // --- deepened object model ---
      country: safeText(input.country, ""),
      city: safeText(input.city, ""),
      appearance: buildAppearance(input.appearance),
      education: input.education && typeof input.education === "object"
        ? { level: safeText(input.education.level, ""), institutionId: input.education.institutionId || null, specialtyId: input.education.specialtyId || null }
        : { level: "", institutionId: null, specialtyId: null },
      career: input.career && typeof input.career === "object"
        ? { field: safeText(input.career.field, ""), positionId: input.career.positionId || null, companyId: input.career.companyId || null }
        : { field: "", positionId: null, companyId: null },
      workplaceId: input.workplaceId || null,
      schoolId: input.schoolId || null,
      secrets: Array.isArray(input.secrets) ? input.secrets.slice(-12) : [],
      flags: input.flags && typeof input.flags === "object" ? { ...input.flags } : {},
    };
    npc.job = npc.occupation;
    npc.fullName = `${npc.name}${npc.lastName ? " " + npc.lastName : ""}`.trim();
    // Grouped relationship stats mirror the legacy top-level fields for
    // back-compat; engines may read either. attraction/commitment are new.
    npc.relationshipStats = {
      bond: npc.bond,
      trust: npc.trust,
      conflict: npc.conflict,
      romance: npc.romance,
      respect: npc.respect,
      attraction: clamp(safeNumber(input.attraction, npc.romance), 0, 100),
      commitment: clamp(safeNumber(input.commitment, relationType === "spouse" ? 70 : relationType === "partner" ? 45 : 0), 0, 100),
    };
    npc.sexualityProfile = buildSexualityProfile(input.sexualityProfile, npc.age);
    return npc;
  }

  function normalizeNpc(raw = {}, state = {}) {
    const relationType = legacyRelationType(raw);
    const fullName = String(raw.name || "").trim().split(/\s+/);
    return createNpc({
      ...raw,
      country: raw.country || state.country,
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
      country: state.country,
      age: Math.max(16, (state.age || 18) + roll(5) - 2),
      lastName: input.lastName || randomLastName(state.country) || state.lastName,
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
      country: state.country,
      age: 0,
      lastName: state.lastName || input.lastName || randomLastName(state.country),
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

  // Generic builder for "encountered" NPCs (friends, coworkers, services...).
  // Pulls country/city from state and picks a sensible age near the player.
  function createContactNpc(state = {}, relationType, input = {}) {
    const ageSpread = input.ageSpread ?? 6;
    const ageBase = input.age != null ? input.age : Math.max(input.minAge || 14, (state.age || 18) + roll(ageSpread * 2 + 1) - ageSpread);
    return createNpc({
      relationType,
      country: state.country,
      city: state.city,
      age: Math.max(input.minAge || 0, ageBase),
      lastName: input.lastName || randomLastName(state.country),
      ...input,
    });
  }

  function createFriendNpc(state = {}, input = {}) {
    return createContactNpc(state, input.best ? "best_friend" : "friend", { bond: 50 + roll(25), trust: 48 + roll(22), tags: ["friend"], ...input });
  }

  function createAcquaintanceNpc(state = {}, input = {}) {
    return createContactNpc(state, "acquaintance", { bond: 22 + roll(20), trust: 25 + roll(18), tags: ["acquaintance"], ...input });
  }

  function createCoworkerNpc(state = {}, input = {}) {
    return createContactNpc(state, "coworker", { bond: 30 + roll(25), trust: 32 + roll(22), respect: 40 + roll(25), occupation: input.occupation || "коллега", tags: ["work"], ...input });
  }

  function createBossNpc(state = {}, input = {}) {
    return createContactNpc(state, "boss", { ageSpread: 12, minAge: 30, bond: 28 + roll(18), trust: 30 + roll(18), respect: 52 + roll(25), occupation: input.occupation || "руководитель", tags: ["work"], ...input });
  }

  function createClientNpc(state = {}, input = {}) {
    return createContactNpc(state, "client", { bond: 20 + roll(18), trust: 28 + roll(18), occupation: input.occupation || "клиент", tags: ["work"], ...input });
  }

  function createBusinessPartnerNpc(state = {}, input = {}) {
    return createContactNpc(state, "business_partner", { bond: 35 + roll(20), trust: 38 + roll(20), respect: 48 + roll(20), occupation: input.occupation || "партнёр", tags: ["work"], ...input });
  }

  function createTeacherNpc(state = {}, input = {}) {
    return createContactNpc(state, "teacher", { ageSpread: 14, minAge: 25, respect: 55 + roll(20), occupation: input.occupation || "учитель", tags: ["study"], ...input });
  }

  function createProfessorNpc(state = {}, input = {}) {
    return createContactNpc(state, "professor", { ageSpread: 18, minAge: 32, respect: 60 + roll(20), occupation: input.occupation || "преподаватель", tags: ["study"], ...input });
  }

  function createClassmateNpc(state = {}, input = {}) {
    return createContactNpc(state, "classmate", { ageSpread: 2, minAge: 6, bond: 30 + roll(25), trust: 32 + roll(20), occupation: input.occupation || "учащийся", tags: ["study"], ...input });
  }

  function createDoctorNpc(state = {}, input = {}) {
    return createContactNpc(state, "doctor", { ageSpread: 12, minAge: 28, respect: 58 + roll(20), occupation: input.occupation || "врач", tags: ["service"], ...input });
  }

  function createTherapistNpc(state = {}, input = {}) {
    return createContactNpc(state, "therapist", { ageSpread: 12, minAge: 28, respect: 56 + roll(20), trust: 45 + roll(20), occupation: input.occupation || "психолог", tags: ["service"], ...input });
  }

  function createLawyerNpc(state = {}, input = {}) {
    return createContactNpc(state, "lawyer", { ageSpread: 14, minAge: 28, respect: 55 + roll(20), occupation: input.occupation || "юрист", tags: ["service"], ...input });
  }

  function createLandlordNpc(state = {}, input = {}) {
    return createContactNpc(state, "landlord", { ageSpread: 16, minAge: 30, occupation: input.occupation || "арендодатель", tags: ["service"], ...input });
  }

  function createPoliceNpc(state = {}, input = {}) {
    return createContactNpc(state, "police_officer", { ageSpread: 12, minAge: 24, respect: 50 + roll(20), occupation: input.occupation || "сотрудник полиции", tags: ["service"], ...input });
  }

  function createRivalNpc(state = {}, input = {}) {
    return createContactNpc(state, "rival", { bond: 18 + roll(15), conflict: 25 + roll(20), respect: 35 + roll(20), tags: ["rival"], ...input });
  }

  // Romantic contacts. Romance dimensions are only meaningful at 18+; for
  // minors these helpers still create a non-romantic "crush" shell.
  function createCrushNpc(state = {}, input = {}) {
    return createContactNpc(state, "crush", { ageSpread: 3, bond: 30 + roll(20), romance: (state.age || 0) >= 18 ? 30 + roll(25) : 0, tags: ["romance"], ...input });
  }

  function createDateNpc(state = {}, input = {}) {
    return createContactNpc(state, "date", { ageSpread: 4, minAge: 18, bond: 35 + roll(20), trust: 32 + roll(18), romance: 35 + roll(25), tags: ["romance"], ...input });
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
    relationGroups,
    roleByRelation,
    safeNumber,
    randomId,
    randomFirstName,
    randomLastName,
    randomOccupation,
    buildAppearance,
    createNpc,
    normalizeNpc,
    createPlayerNpc,
    createParentNpc,
    createGrandparentNpc,
    createPartnerNpc,
    createChildNpc,
    createContactNpc,
    createFriendNpc,
    createAcquaintanceNpc,
    createCoworkerNpc,
    createBossNpc,
    createClientNpc,
    createBusinessPartnerNpc,
    createTeacherNpc,
    createProfessorNpc,
    createClassmateNpc,
    createDoctorNpc,
    createTherapistNpc,
    createLawyerNpc,
    createLandlordNpc,
    createPoliceNpc,
    createRivalNpc,
    createCrushNpc,
    createDateNpc,
    migrateLegacyPerson,
    migrateLegacyPartner,
    migrateLegacyChild,
  };
})();
