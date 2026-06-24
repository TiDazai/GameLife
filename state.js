(() => {
  const { countries, names, professions, certificateCatalog, budgetModes, housingCatalog, characterCreation, socialClasses } = window.GameData;
  const { pick, roll, clamp } = window.GameRandom;
  const NpcFactory = window.GameNpcFactory;
  let renderCallback = () => {};
  let appMode = "creator";

const rub = new Intl.NumberFormat("ru-RU");

const baseState = {
  version: 9,
  age: 0,
  year: 2026,
  tab: "life",
  country: "ru",
  city: "kazan",
  gender: "male",
  firstName: "Вы",
  lastName: "",
  socialClass: "regular",
  districtQuality: 58,
  educationAccess: 62,
  livingWithParents: true,
  personalMoney: 0,
  familyMoney: 1800,
  debt: 0,
  economy: null,
  actions: 3,
  maxActions: 3,
  health: 82,
  happiness: 76,
  knowledge: 0,
  social: 0,
  discipline: 6,
  stress: 4,
  mental: 78,
  energy: 72,
  healthProfile: null,
  looks: 55,
  fame: 0,
  karma: 50,
  criminalRecord: 0,
  legalStatus: "clean",
  fines: [],
  activeCases: [],
  pastCases: [],
  publicTrust: 50,
  socialStanding: 50,
  legalHistory: [],
  lifestyle: 48,
  taxableIncome: 0,
  taxesPaid: 0,
  taxDebt: 0,
  grades: 0,
  educationLevel: "Детство",
  education: null,
  profession: "none",
  job: null,
  salary: 0,
  careerLevel: 0,
  experience: 0,
  career: null,
  reputation: 0,
  portfolio: 0,
  network: 0,
  certificates: [],
  budgetMode: "balanced",
  creditScore: 55,
  emergencyFundTarget: 3,
  relationship: null,
  children: [],
  npcs: [],
  company: null,
  housing: "parents",
  possessions: [],
  assets: {
    deposits: 0,
    stocks: 0,
    pension: 0,
    property: 0,
  },
  skills: {
    logic: 0,
    creativity: 0,
    empathy: 0,
    fitness: 0,
    finance: 0,
    language: 0,
    craft: 0,
    leadership: 0,
  },
  traits: {
    curiosity: 50,
    risk: 50,
    kindness: 50,
    ambition: 50,
  },
  documents: {
    birthCertificate: true,
    passport: false,
    taxId: false,
    driverLicense: false,
    workPermit: true,
    insurance: "family",
    visas: [],
  },
  event: null,
  flags: [],
  message: "",
  family: [],
  log: [],
  deceased: false,
  deathAge: null,
  deathYear: null,
  deathCause: "",
  deathRisk: 0,
  lifeType: null,
  lifeSummary: null,
  achievements: [],
  unlockedAchievements: [],
  legacySnapshot: null,
  dangerThisYear: 0,
  generation: 1,
  familyHistory: [],
  inheritedFrom: null,
  yearlyActionCount: 0,
  actionFatigue: 0,
  yearlyActivityLoad: 0,
  repeatedActions: {},
  lastActionResults: [],
  talents: [],
  weaknesses: [],
  hiddenModifiers: {},
  personalityTraits: [],
  lifeGoal: null,
  lifeGoalProgress: {},
  storyArcs: [],
  worldEvents: [],
  worldEventHistory: [],
  adultStats: null,
  // --- deepened object model (NPC-first world) ---
  places: [],
  educationPath: null,
  workplace: null,
  nightlife: null,
  adultWork: null,
  pregnancy: null,
};

const state = createNewLife();

function createNewLife(options = {}) {
  const st = JSON.parse(JSON.stringify(baseState));
  const countryKeys = Object.keys(countries);
  st.country = countries[options.country] ? options.country : pick(countryKeys);
  st.city = countries[st.country].cities[options.city] ? options.city : pick(Object.keys(countries[st.country].cities));
  const playerGender = characterCreation.genders[options.gender] ? options.gender : Math.random() > 0.5 ? "male" : "female";
  const socialClassId = socialClasses[options.socialClass] ? options.socialClass : pick(Object.keys(socialClasses));
  const socialClass = socialClasses[socialClassId];
  const first = cleanName(options.firstName) || nameFor(st.country, playerGender);
  const last = cleanName(options.lastName) || surnameFor(st.country);
  const fatherAge = 25 + roll(15);
  const motherAge = 23 + roll(13);
  st.family = [
    person("player", first, "Главный герой", playerGender, 0, true, "Ребенок", 100),
    person("mother", nameFor(st.country, "female"), "Мама", "female", motherAge, true, randomParentJob(socialClassId), 72 + roll(18) + socialClass.parentBondBonus),
    person("father", nameFor(st.country, "male"), "Папа", "male", fatherAge, true, randomParentJob(socialClassId), 62 + roll(24) + socialClass.parentBondBonus),
    person("grandma1", nameFor(st.country, "female"), "Бабушка", "female", motherAge + 24 + roll(10), true, "Пенсионер", 45 + roll(30)),
    person("grandpa1", nameFor(st.country, "male"), "Дедушка", "male", motherAge + 25 + roll(12), true, "Пенсионер", 40 + roll(30)),
  ];
  st.family.forEach((member) => {
    member.bond = clamp(member.bond, 0, 100);
    member.health = clamp(member.health + (member.id === "mother" || member.id === "father" ? socialClass.parentHealthBonus : 0), 0, 100);
  });
  st.npcs = st.family.map((member) => NpcFactory.migrateLegacyPerson({ ...member, lastName: last }, st));
  st.gender = playerGender;
  st.firstName = first;
  st.lastName = last;
  st.socialClass = socialClassId;
  st.districtQuality = socialClass.districtQuality;
  st.educationAccess = Math.round((socialClass.educationAccess + cityData(st).education) / 2);
  st.familyMoney = Math.floor(socialClass.familyMoney + householdIncome(st) * 0.5);
  st.happiness = clamp(st.happiness + socialClass.happiness, 0, 100);
  st.stress = clamp(st.stress + socialClass.stress, 0, 100);
  st.mental = clamp(st.mental + Math.floor(socialClass.happiness / 2) - Math.max(0, Math.floor(socialClass.stress / 3)), 0, 100);
  st.traits = resolveTraits(options.traits);
  st.skills.empathy = Math.floor((st.traits.kindness + livingParentCountFor(st) * 8) / 12);
  st.skills.logic = Math.floor(st.traits.curiosity / 14);
  applyBirthProfile(st, options);
  if (window.GameLifeGoals?.assignGoal) window.GameLifeGoals.assignGoal(st, options.lifeGoal);
  if (window.GameCareerEngine?.normalizeCareerState) window.GameCareerEngine.normalizeCareerState(st, st);
  if (window.GameEconomyEngine?.normalizeEconomyState) window.GameEconomyEngine.normalizeEconomyState(st, st);
  if (window.GameHealthEngine?.normalizeHealthState) window.GameHealthEngine.normalizeHealthState(st, st);
  if (window.GameLegalEngine?.normalizeLegalState) window.GameLegalEngine.normalizeLegalState(st, st);
  if (window.GamePlaces?.ensureCityPlaces) window.GamePlaces.ensureCityPlaces(st);
  st.achievements = window.GameLifeSummaryEngine?.readAchievements?.() || [];
  const birthVerb = playerGender === "female" ? "родилась" : "родился";
  st.log = [
    `0 лет: ${first} ${last} ${birthVerb} в городе ${cityName(st)} (${countryName(st)}).`,
    `Семья ${last}: стартовый класс - ${socialClass.name.toLowerCase()}, район ${st.districtQuality}/100, доступ к образованию ${st.educationAccess}/100.`,
  ];
  return st;
}

function cleanName(value) {
  return String(value || "").trim().slice(0, 28);
}

// Country-aware name helpers. Fall back to the legacy Russian pool if GameNames
// is unavailable (e.g. in isolated tests that don't load it).
function nameFor(country, gender) {
  if (window.GameNames?.firstName) return window.GameNames.firstName(country, gender);
  return pick(gender === "female" ? names.female : names.male);
}
function surnameFor(country) {
  if (window.GameNames?.lastName) return window.GameNames.lastName(country);
  return pick(names.last);
}

function resolveTraits(traits = {}) {
  return Object.fromEntries(
    Object.entries(characterCreation.traitRanges).map(([id, config]) => {
      const selected = Number(traits[id]);
      const random = config.randomMin + roll(config.randomMax - config.randomMin + 1);
      return [id, clamp(Number.isFinite(selected) ? selected : random, config.min, config.max)];
    })
  );
}

function applyBirthProfile(st, options = {}) {
  const cc = characterCreation || {};
  const talentPool = cc.talents || [];
  const weaknessPool = cc.weaknesses || [];
  const personalityPool = cc.personalityTraits || [];
  const modifierPool = cc.hiddenModifierPool || [];

  const pickSome = (pool, requested, count) => {
    if (Array.isArray(requested) && requested.length) {
      return pool.filter((item) => requested.includes(item.id));
    }
    const copy = [...pool];
    const out = [];
    for (let i = 0; i < count && copy.length; i += 1) {
      out.push(copy.splice(roll(copy.length), 1)[0]);
    }
    return out;
  };

  const chosenTalents = pickSome(talentPool, options.talents, 1 + roll(2));
  const chosenWeaknesses = pickSome(weaknessPool, options.weaknesses, roll(2));
  const chosenPersonality = pickSome(personalityPool, options.personalityTraits, 1 + roll(2));

  st.talents = chosenTalents.map((t) => t.id);
  st.weaknesses = chosenWeaknesses.map((w) => w.id);
  st.personalityTraits = chosenPersonality.map((p) => p.id);

  const applyPack = (pack) => {
    if (pack.effects) {
      for (const [key, amount] of Object.entries(pack.effects)) {
        if (key in st && typeof st[key] === "number") st[key] = clamp(st[key] + amount, 0, 100);
      }
    }
    if (pack.skills) {
      for (const [id, amount] of Object.entries(pack.skills)) {
        st.skills[id] = clamp((st.skills[id] || 0) + amount, 0, 100);
      }
    }
  };
  chosenTalents.forEach(applyPack);
  chosenWeaknesses.forEach(applyPack);

  st.hiddenModifiers = {};
  modifierPool.forEach((mod) => {
    st.hiddenModifiers[mod.id] = mod.min + roll(mod.max - mod.min + 1);
  });
  return st;
}

function normalizeState(st) {
  const fresh = JSON.parse(JSON.stringify(baseState));
  const merged = { ...fresh, ...st };
  merged.assets = { ...fresh.assets, ...(st.assets || {}) };
  merged.skills = { ...fresh.skills, ...(st.skills || {}) };
  merged.traits = { ...fresh.traits, ...(st.traits || {}) };
  merged.documents = { ...fresh.documents, ...(st.documents || {}) };
  merged.version = Number.isFinite(st.version) ? Math.max(9, st.version) : 9;
  merged.flags = Array.isArray(st.flags) ? st.flags : [];
  merged.event = st.event?.id && typeof st.event === "object" ? {
    id: st.event.id,
    category: st.event.category,
    title: st.event.title,
    description: st.event.description || st.event.text || "",
    text: st.event.text || st.event.description || "",
    options: Array.isArray(st.event.options) ? st.event.options.map((option) => ({
      id: option.id,
      label: option.label,
      description: option.description || "",
    })) : [],
  } : null;
  merged.possessions = Array.isArray(st.possessions) ? st.possessions : [];
  merged.certificates = Array.isArray(st.certificates) ? st.certificates : [];
  if (window.GameCareerEngine?.normalizeCareerState) window.GameCareerEngine.normalizeCareerState(merged, st);
  merged.budgetMode = budgetModes[st.budgetMode] ? st.budgetMode : "balanced";
  merged.creditScore = clamp(Number.isFinite(st.creditScore) ? st.creditScore : 55, 0, 100);
  merged.portfolio = clamp(Number.isFinite(st.portfolio) ? st.portfolio : 0, 0, 100);
  merged.network = clamp(Number.isFinite(st.network) ? st.network : 0, 0, 100);
  merged.looks = clamp(Number.isFinite(st.looks) ? st.looks : 55, 0, 100);
  merged.fame = clamp(Number.isFinite(st.fame) ? st.fame : 0, 0, 100);
  merged.karma = clamp(Number.isFinite(st.karma) ? st.karma : 50, 0, 100);
  merged.criminalRecord = Math.max(0, Number.isFinite(st.criminalRecord) ? st.criminalRecord : 0);
  merged.housing = st.housing || (st.livingWithParents ? "parents" : "room");
  merged.family = Array.isArray(st.family) && st.family.length ? st.family : fresh.family;
  merged.socialClass = socialClasses[st.socialClass] ? st.socialClass : "regular";
  merged.firstName = cleanName(st.firstName) || merged.family.find((item) => item.id === "player")?.name || "Вы";
  merged.lastName = cleanName(st.lastName);
  merged.gender = characterCreation.genders[st.gender] ? st.gender : merged.family.find((item) => item.id === "player")?.gender || "male";
  merged.districtQuality = clamp(Number.isFinite(st.districtQuality) ? st.districtQuality : socialClasses[merged.socialClass].districtQuality, 0, 100);
  merged.educationAccess = clamp(Number.isFinite(st.educationAccess) ? st.educationAccess : socialClasses[merged.socialClass].educationAccess, 0, 100);
  if (merged.relationship) {
    merged.relationship = {
      trust: 45,
      romance: 45,
      conflict: 10,
      sharedBudget: false,
      ...merged.relationship,
    };
  }
  if (merged.company) {
    merged.company = {
      marketing: 0,
      quality: 0,
      automation: 0,
      branches: 0,
      debt: 0,
      ...merged.company,
    };
  }
  if (window.GameEconomyEngine?.normalizeEconomyState) window.GameEconomyEngine.normalizeEconomyState(merged, st);
  if (window.GameHealthEngine?.normalizeHealthState) window.GameHealthEngine.normalizeHealthState(merged, st);
  if (window.GameLegalEngine?.normalizeLegalState) window.GameLegalEngine.normalizeLegalState(merged, st);
  merged.children = Array.isArray(st.children)
    ? st.children.map((child) => ({ education: 0, talent: 35 + roll(40), ...child }))
    : [];
  merged.npcs = normalizeNpcState(merged, st);
  merged.log = Array.isArray(st.log) ? st.log : [];
  merged.deceased = Boolean(st.deceased);
  merged.deathAge = Number.isFinite(st.deathAge) ? st.deathAge : null;
  merged.deathYear = Number.isFinite(st.deathYear) ? st.deathYear : null;
  merged.deathCause = st.deathCause || "";
  merged.deathRisk = Number.isFinite(st.deathRisk) ? st.deathRisk : 0;
  merged.lifeType = st.lifeType || null;
  merged.lifeSummary = st.lifeSummary || null;
  merged.achievements = Array.isArray(st.achievements) ? st.achievements : (window.GameLifeSummaryEngine?.readAchievements?.() || []);
  merged.unlockedAchievements = Array.isArray(st.unlockedAchievements) ? st.unlockedAchievements : [];
  merged.legacySnapshot = st.legacySnapshot || null;
  merged.dangerThisYear = Number.isFinite(st.dangerThisYear) ? st.dangerThisYear : 0;
  merged.generation = Number.isFinite(st.generation) ? st.generation : 1;
  merged.familyHistory = Array.isArray(st.familyHistory) ? st.familyHistory : [];
  merged.inheritedFrom = st.inheritedFrom || null;
  merged.yearlyActionCount = Number.isFinite(st.yearlyActionCount) ? st.yearlyActionCount : 0;
  merged.actionFatigue = clamp(Number.isFinite(st.actionFatigue) ? st.actionFatigue : 0, 0, 100);
  merged.yearlyActivityLoad = Number.isFinite(st.yearlyActivityLoad) ? st.yearlyActivityLoad : 0;
  merged.repeatedActions = st.repeatedActions && typeof st.repeatedActions === "object" ? st.repeatedActions : {};
  merged.lastActionResults = Array.isArray(st.lastActionResults) ? st.lastActionResults : [];
  merged.talents = Array.isArray(st.talents) ? st.talents : [];
  merged.weaknesses = Array.isArray(st.weaknesses) ? st.weaknesses : [];
  merged.hiddenModifiers = st.hiddenModifiers && typeof st.hiddenModifiers === "object" ? st.hiddenModifiers : {};
  merged.personalityTraits = Array.isArray(st.personalityTraits) ? st.personalityTraits : [];
  merged.lifeGoal = st.lifeGoal || null;
  merged.lifeGoalProgress = st.lifeGoalProgress && typeof st.lifeGoalProgress === "object" ? st.lifeGoalProgress : {};
  merged.storyArcs = Array.isArray(st.storyArcs) ? st.storyArcs : [];
  merged.worldEvents = Array.isArray(st.worldEvents) ? st.worldEvents : [];
  merged.worldEventHistory = Array.isArray(st.worldEventHistory) ? st.worldEventHistory : [];
  merged.adultStats = st.adultStats && typeof st.adultStats === "object" ? st.adultStats : null;
  // --- deepened object model normalization (guarded; safe for old saves) ---
  merged.places = Array.isArray(st.places) ? st.places : [];
  if (window.GamePlaces?.normalizePlaces) window.GamePlaces.normalizePlaces(merged);
  merged.educationPath = st.educationPath && typeof st.educationPath === "object" ? st.educationPath : null;
  merged.workplace = st.workplace && typeof st.workplace === "object" ? st.workplace : null;
  merged.nightlife = st.nightlife && typeof st.nightlife === "object" ? st.nightlife : null;
  merged.adultWork = st.adultWork && typeof st.adultWork === "object" ? st.adultWork : null;
  merged.pregnancy = st.pregnancy && typeof st.pregnancy === "object" ? st.pregnancy : null;
  if (window.GameEducationPath?.normalize) window.GameEducationPath.normalize(merged);
  if (window.GameWorkplace?.normalize) window.GameWorkplace.normalize(merged);
  if (window.GameNightlife?.normalize) window.GameNightlife.normalize(merged);
  if (window.GameAdultWork?.normalize) window.GameAdultWork.normalize(merged);
  if (window.GamePregnancy?.normalize) window.GamePregnancy.normalize(merged);
  if (window.GameRelationshipEngine?.normalizeNpcs) window.GameRelationshipEngine.normalizeNpcs(merged);
  else syncLegacyFromNpcs(merged);
  return merged;
}

function normalizeNpcState(merged, original) {
  if (Array.isArray(original.npcs) && original.npcs.length) {
    return original.npcs.map((npc) => NpcFactory.normalizeNpc(npc, merged));
  }
  const npcs = [];
  (Array.isArray(original.family) ? original.family : []).forEach((member) => {
    npcs.push(NpcFactory.migrateLegacyPerson(member, merged));
  });
  if (!npcs.some((npc) => npc.id === "player")) npcs.unshift(NpcFactory.createPlayerNpc(merged));
  const partner = NpcFactory.migrateLegacyPartner(original.relationship, merged);
  if (partner) npcs.push(partner);
  (Array.isArray(original.children) ? original.children : []).forEach((child) => {
    npcs.push(NpcFactory.migrateLegacyChild(child, merged));
  });
  return npcs;
}

function syncLegacyFromNpcs(st) {
  const npcs = Array.isArray(st.npcs) ? st.npcs : [];
  const familyTypes = new Set(["self", "parent", "grandparent", "sibling"]);
  st.family = npcs.filter((npc) => familyTypes.has(npc.relationType)).map((npc) => ({ ...npc, job: npc.occupation }));
  const partner = npcs.find((npc) => npc.alive && (npc.relationType === "spouse" || npc.relationType === "partner"));
  st.relationship = partner ? {
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
    sharedBudget: partner.tags?.includes("shared_budget") || false,
    married: partner.relationType === "spouse",
  } : null;
  st.children = npcs.filter((npc) => npc.relationType === "child").map((child) => ({
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
    talent: child.talent || 40,
  }));
}

function createLifeFromChild(parentState, childId) {
  const child = parentState.children.find((item) => item.id === childId);
  if (!child) return null;
  const inheritedMoney = Math.max(0, Math.floor(netWorthFor(parentState) * 0.28));
  const inheritedProperty = Math.max(0, Math.floor((parentState.assets?.property || 0) * 0.35));
  const inheritedReputation = clamp(Math.floor((parentState.reputation || 0) * 0.35 + (parentState.fame || 0) * 0.15), 0, 40);
  const next = createNewLife({
    firstName: child.name,
    lastName: parentState.lastName,
    gender: child.gender,
    country: parentState.country,
    city: parentState.city,
    socialClass: parentState.socialClass,
  });
  next.age = child.age;
  next.year = parentState.year;
  next.firstName = child.name;
  next.lastName = parentState.lastName;
  next.gender = child.gender;
  next.personalMoney = inheritedMoney;
  next.assets.property = inheritedProperty;
  next.reputation = inheritedReputation;
  next.generation = (parentState.generation || 1) + 1;
  const parentSummary = parentState.lifeSummary || parentState.legacySnapshot;
  next.familyHistory = [...(parentState.familyHistory || []), parentSummary].filter(Boolean).slice(-8);
  next.inheritedFrom = {
    name: `${parentState.firstName} ${parentState.lastName}`.trim(),
    age: parentState.deathAge,
    lifeType: parentState.lifeType?.name || parentSummary?.lifeType?.name || "",
    inheritedMoney,
    inheritedProperty,
    inheritedReputation,
  };
  next.educationLevel = child.age >= 18 ? "Среднее образование" : child.age >= 7 ? "Школа" : "Детство";
  next.grades = clamp(Math.floor((parentState.educationAccess || 55) * 0.35 + (child.talent || 40) * 0.3), 0, 100);
  next.family = [
    person("player", child.name, "Главный герой", child.gender, child.age, true, child.age < 18 ? "Ребенок" : "Старт взрослой жизни", 100),
    person("parent1", parentState.firstName || "Родитель", "Родитель", parentState.gender || "male", parentState.deathAge || parentState.age, false, "память семьи", 80),
  ];
  next.npcs = next.family.map((member) => NpcFactory.migrateLegacyPerson({ ...member, lastName: next.lastName }, next));
  next.log = [
    `${next.age} лет: вы продолжили семейную историю как ${child.name} ${parentState.lastName}.`,
    `Наследство: деньги ${fmtFor(next, inheritedMoney)}, недвижимость ${fmtFor(next, inheritedProperty)}, репутация ${inheritedReputation}/100.`,
    ...parentState.log.slice(0, 8).map((entry) => `История семьи: ${entry}`),
  ];
  return next;
}

function person(id, name, role, gender, age, alive, job, bond) {
  return { id, name, role, gender, age, alive, job, bond, health: 65 + roll(30) };
}

function randomParentJob(socialClassId = "regular") {
  return pick(socialClasses[socialClassId]?.parentJobs || socialClasses.regular.parentJobs);
}


function fmt(value) {
  const symbol = countries[state.country]?.currency || "₽";
  const amount = rub.format(Math.floor(value));
  if (symbol === "$" || symbol === "€" || symbol === "¥") return `${symbol}${amount}`;
  return `${amount} ${symbol}`;
}

function ageText(age) {
  const mod10 = age % 10;
  const mod100 = age % 100;
  if (mod10 === 1 && mod100 !== 11) return `${age} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${age} года`;
  return `${age} лет`;
}

function cityData(st = state) {
  return countries[st.country].cities[st.city];
}

function socialClassData(st = state) {
  return socialClasses[st.socialClass] || socialClasses.regular;
}

function cityName(st = state) {
  return cityData(st).name;
}

function countryName(st = state) {
  return countries[st.country].name;
}

function player() {
  return state.family.find((item) => item.id === "player");
}

function livingParentCount() {
  return state.family.filter((item) => (item.id === "mother" || item.id === "father") && item.alive).length;
}

function livingParentCountFor(st) {
  return st.family.filter((item) => (item.id === "mother" || item.id === "father") && item.alive).length;
}

function housingData() {
  return housingCatalog[state.housing] || housingCatalog.parents;
}

function netWorth() {
  return netWorthFor(state);
}

function netWorthFor(st) {
  if (window.GameEconomyEngine?.calculateNetWorth && st.economy) return window.GameEconomyEngine.calculateNetWorth(st);
  const home = housingCatalog[st.housing] || housingCatalog.parents;
  const property = st.housing === "ownedFlat" || st.housing === "house" ? home.buy : 0;
  const companyValue = st.company ? st.company.cash + st.company.level * 1800 + st.company.reputation * 70 : 0;
  return Math.floor(
    (st.personalMoney || 0) +
      (st.assets?.deposits || 0) +
      (st.assets?.stocks || 0) +
      (st.assets?.pension || 0) * 0.65 +
      (st.assets?.property || 0) +
      property +
      companyValue -
      (st.debt || 0)
  );
}

function fmtFor(st, value) {
  const symbol = countries[st.country]?.currency || "₽";
  const amount = rub.format(Math.floor(value));
  if (symbol === "$" || symbol === "€" || symbol === "¥") return `${symbol}${amount}`;
  return `${amount} ${symbol}`;
}

function countryTaxRate() {
  if (window.GameEconomyEngine?.countryTaxRate) return window.GameEconomyEngine.countryTaxRate(state);
  const rates = { ru: 0.13, de: 0.24, jp: 0.19, us: 0.22, se: 0.27 };
  return rates[state.country] || 0.18;
}

function addIncome(amount) {
  if (window.GameEconomyEngine?.recordIncome) {
    window.GameEconomyEngine.recordIncome(state, "доход", amount, true);
    return;
  }
  state.personalMoney += amount;
  if (state.age >= 18) state.taxableIncome += amount;
}

function skillAverage(ids) {
  return ids.reduce((sum, id) => sum + (state.skills[id] || 0), 0) / ids.length;
}

function improveSkill(id, amount) {
  state.skills[id] = clamp((state.skills[id] || 0) + amount, 0, 100);
  if (id === "fitness" && state.healthProfile) {
    state.healthProfile.fitness = state.skills[id];
    window.GameHealthEngine?.syncLegacy?.(state);
  }
}

function hasPossession(id) {
  return state.possessions.includes(id);
}

function hasCertificate(id) {
  return state.certificates.includes(id);
}

function budgetModeData() {
  return budgetModes[state.budgetMode] || budgetModes.balanced;
}

function emergencyFundMonths() {
  const cost = Math.max(1, personalCost());
  return Math.floor((state.personalMoney / cost) * 10) / 10;
}

function certificateBonus() {
  return state.certificates.reduce((sum, id) => sum + (certificateCatalog[id]?.reputation || 0), 0);
}

function partnerIncome() {
  if (!state.relationship?.married) return 0;
  const trust = (state.relationship.trust || 40) / 100;
  const bond = state.relationship.bond / 100;
  const city = cityData();
  const base = 650 + (state.relationship.age > 22 ? 280 : 80);
  const shared = state.relationship.sharedBudget ? 1 : 0.42;
  return Math.floor(base * city.salary * (0.65 + trust * 0.25 + bond * 0.25) * shared);
}

function creditLimit() {
  if (state.economy) {
    const income = Math.max(annualSalary(), partnerIncome(), state.economy.yearlyIncome || 500, 500);
    return Math.floor(income * (0.35 + state.creditScore / 95));
  }
  const income = Math.max(annualSalary(), partnerIncome(), 500);
  return Math.floor(income * (0.35 + state.creditScore / 95));
}

function changeCredit(amount) {
  if (state.economy) state.economy.creditScore = clamp((state.economy.creditScore || 55) + amount, 0, 100);
  state.creditScore = clamp(state.creditScore + amount, 0, 100);
}

function householdIncome(st = state) {
  const city = cityData(st);
  const socialClass = socialClasses[st.socialClass] || socialClasses.regular;
  return st.family
    .filter((item) => item.alive && (item.id === "mother" || item.id === "father"))
    .reduce((sum, item) => {
      const base = item.job === "Пенсионер" ? 300 : 650 + item.bond * 4;
      return sum + Math.floor(base * city.salary * socialClass.moneyMultiplier);
    }, 0);
}

function householdCost() {
  const city = cityData();
  const dependents = 1 + state.children.length + (state.relationship ? 1 : 0);
  const childCost = state.age < 18 && state.livingWithParents ? 0 : dependents * 260 * city.cost;
  const rent = state.livingWithParents ? 0 : housingData().annual * city.cost;
  const carCost = hasPossession("car") ? 520 * city.cost : 0;
  return Math.floor(560 * city.cost + childCost + rent + carCost);
}

function personalCost() {
  if (window.GameEconomyEngine?.calculateAnnualExpenses && state.economy) return window.GameEconomyEngine.calculateAnnualExpenses(state).total;
  if (state.age < 18 && state.livingWithParents) return 0;
  const mode = budgetModeData();
  const base = (420 * cityData().cost + (state.relationship ? 140 : 0) + state.children.length * 250) * mode.cost;
  const housing = state.livingWithParents ? 0 : housingData().annual * cityData().cost;
  const carCost = hasPossession("car") ? 520 * cityData().cost : 0;
  return Math.floor(base + housing + carCost);
}

function stageName() {
  if (state.age < 3) return "Младенчество";
  if (state.age < 7) return "Дошкольник";
  if (state.age < 14) return "Школа";
  if (state.age < 18) return "Подросток";
  if (state.age < 25) return "Старт взрослой жизни";
  if (state.age < 45) return "Взрослая жизнь";
  if (state.age < 65) return "Зрелость";
  return "Поздняя жизнь";
}

function maxActionsForAge() {
  let max = state.age < 4 ? 2 : 3;
  if (state.age >= 7) max += 1;
  if (state.age >= 18) max += 1;
  if (state.discipline > 70) max += 1;
  if (state.health < 35 || state.stress > 80) max -= 1;
  if (window.GameHealthEngine?.actionPenalty) max -= window.GameHealthEngine.actionPenalty(state);
  return clamp(max, 1, 7);
}

function setAppMode(mode) {
  appMode = ["creator", "life", "death"].includes(mode) ? mode : "creator";
}

function getAppMode() {
  return appMode;
}

function canAct(cost = 1) {
  return !state.event && !state.deceased;
}

function spendAction(cost = 1) {
  state.actions = Math.max(0, state.actions - cost);
  if (window.GameActionLoad?.recordActionUse) {
    window.GameActionLoad.recordActionUse(state);
  } else {
    state.yearlyActionCount = (state.yearlyActionCount || 0) + 1;
    state.yearlyActivityLoad = (state.yearlyActivityLoad || 0) + cost;
  }
}

function addLog(text) {
  state.log.unshift(`${state.age} лет: ${text}`);
  state.log = state.log.slice(0, 36);
}

function notify(text) {
  state.message = text;
  addLog(text);
  requestRender();
}

function change(values) {
  for (const [key, amount] of Object.entries(values)) {
    if (["health", "happiness", "knowledge", "social", "discipline", "stress", "mental", "energy", "grades", "reputation", "lifestyle", "portfolio", "network", "creditScore", "looks", "fame", "karma", "publicTrust", "socialStanding"].includes(key)) {
      state[key] = clamp(state[key] + amount, 0, 100);
    } else {
      state[key] += amount;
    }
  }
  if (state.healthProfile) {
    ["health", "mental", "stress", "energy"].forEach((key) => {
      state.healthProfile[key] = clamp(state[key], 0, 100);
    });
    if (state.skills?.fitness !== undefined) state.healthProfile.fitness = clamp(state.skills.fitness, 0, 100);
    window.GameHealthEngine?.syncLegacy?.(state);
  }
  if (window.GameLegalEngine?.syncLegalStatus) window.GameLegalEngine.syncLegalStatus(state);
}

function addDanger(amount) {
  state.dangerThisYear = clamp((state.dangerThisYear || 0) + amount, 0, 100);
}

function familyBond(id, amount) {
  const member = state.family.find((item) => item.id === id);
  if (member) member.bond = clamp(member.bond + amount, 0, 100);
  const npc = state.npcs?.find((item) => item.id === id);
  if (npc) npc.bond = clamp(npc.bond + amount, 0, 100);
}

function canPay(amount) {
  return state.personalMoney >= amount;
}

function pay(amount) {
  if (window.GameEconomyEngine?.payExpense && state.economy) {
    return window.GameEconomyEngine.payExpense(state, "платеж", amount, { allowDebt: false }).debt === 0;
  }
  if (state.personalMoney >= amount) {
    state.personalMoney -= amount;
    return true;
  }
  return false;
}

function borrow(amount) {
  if (window.GameEconomyEngine?.takeLoan && state.economy) {
    return window.GameEconomyEngine.takeLoan(state, "consumer", amount).ok;
  }
  if (state.debt + amount > creditLimit()) return false;
  state.personalMoney += amount;
  state.debt += amount;
  changeCredit(-Math.ceil(amount / Math.max(700, annualSalary() || 700)));
  return true;
}

function professionData() {
  const job = window.GameCareerEngine?.jobById?.(state.career?.jobId);
  if (job) return { name: job.title, salary: job.baseSalary, knowledge: job.requirements.knowledge, social: 0, stress: job.stress, industry: job.industry };
  return professions[state.profession] || professions.none;
}

function professionSkillIds(id = state.profession) {
  const job = window.GameCareerEngine?.jobById?.(state.career?.jobId);
  if (job) return Object.keys(job.requirements.skills || {});
  const map = {
    service: ["empathy", "leadership", "finance"],
    trade: ["craft", "fitness", "finance"],
    it: ["logic", "language", "finance"],
    medicine: ["logic", "empathy", "fitness"],
    engineering: ["logic", "craft", "leadership"],
    education: ["empathy", "language", "leadership"],
    art: ["creativity", "language", "empathy"],
    finance: ["finance", "logic", "leadership"],
  };
  return map[id] || ["logic", "empathy"];
}

function applyProfessionSkillGrowth() {
  for (const id of professionSkillIds()) improveSkill(id, 2);
}

function annualSalary() {
  if (window.GameCareerEngine?.calculateSalary) return window.GameCareerEngine.calculateSalary(state);
  if (state.profession === "none") return 0;
  const prof = professionData();
  const education = state.educationLevel === "Высшее образование" ? 1.3 : state.educationLevel === "Колледж" ? 1.12 : 1;
  const level = 1 + state.careerLevel * 0.18;
  const coreSkills = skillAverage(professionSkillIds());
  const proof = 1 + (state.portfolio * 0.45 + state.network * 0.3 + certificateBonus() * 2.2) / 260;
  const publicBonus = 1 + state.fame / 450;
  const recordPenalty = Math.max(0.62, 1 - state.criminalRecord * 0.08);
  const skill = 1 + (state.knowledge + coreSkills * 1.4 + state.social * 0.35 + state.discipline * 0.25) / 320;
  return Math.floor(prof.salary * cityData().salary * education * level * skill * proof * publicBonus * recordPenalty);
}

function payOrDebt(amount) {
  if (window.GameEconomyEngine?.payExpense && state.economy) {
    window.GameEconomyEngine.payExpense(state, "платеж", amount, { loanType: "consumer" });
    return;
  }
  if (state.personalMoney >= amount) state.personalMoney -= amount;
  else {
    const gap = amount - state.personalMoney;
    state.personalMoney = 0;
    state.debt += gap;
  }
}

  function setState(nextState) {
    for (const key of Object.keys(state)) delete state[key];
    Object.assign(state, nextState);
  }

  function setRenderCallback(callback) {
    renderCallback = typeof callback === "function" ? callback : () => {};
  }

  function requestRender() {
    renderCallback();
  }

  window.GameState = {
    state,
    baseState,
    createNewLife,
    createLifeFromChild,
    normalizeState,
    setState,
    setRenderCallback,
    requestRender,
    setAppMode,
    getAppMode,
    person,
    randomParentJob,
    fmt,
    ageText,
    cityData,
    cityName,
    countryName,
    socialClassData,
    player,
    livingParentCount,
    livingParentCountFor,
    housingData,
    netWorth,
    netWorthFor,
    countryTaxRate,
    addIncome,
    skillAverage,
    improveSkill,
    hasPossession,
    hasCertificate,
    budgetModeData,
    emergencyFundMonths,
    certificateBonus,
    partnerIncome,
    creditLimit,
    changeCredit,
    householdIncome,
    householdCost,
    personalCost,
    stageName,
    maxActionsForAge,
    canAct,
    spendAction,
    addLog,
    notify,
    change,
    addDanger,
    familyBond,
    canPay,
    pay,
    borrow,
    professionData,
    professionSkillIds,
    applyProfessionSkillGrowth,
    annualSalary,
    payOrDebt,
  };
})();
