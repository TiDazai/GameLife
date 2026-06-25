const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

global.window = global;
const store = new Map();
global.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

[
  "utils/random.js",
  "data/countries.js",
  "data/names.js",
  "data/professions.js",
  "data/skills.js",
  "data/assets.js",
  "data/characterCreation.js",
  "data/lifeOutcomes.js",
  "data/lifeSummary.js",
  "data/careerEducation.js",
  "data/economy.js",
  "data/health.js",
  "data/health/conditionsDetailed.js",
  "data/legal.js",
  "data/places.js",
  "data/education/specialties.js",
  "data/education/schools.js",
  "data/education/universities.js",
  "data/careers/positions.js",
  "data/careers/careerTracks.js",
  "data/careers/companies.js",
  "data/careers/workplaces.js",
  "data/nightlife.js",
  "data/adultWork.js",
  "data/relationshipActions.js",
  "data/events/childhood.js",
  "data/events/school.js",
  "data/events/teen.js",
  "data/events/adult.js",
  "data/events/career.js",
  "data/events/relationship.js",
  "data/events/money.js",
  "data/events/health.js",
  "data/events/legal.js",
  "data/events/objectReferenced.js",
  "engine/npcFactory.js",
  "engine/careerEngine.js",
  "engine/economyEngine.js",
  "engine/healthEngine.js",
  "engine/legalEngine.js",
  "engine/lifeSummaryEngine.js",
  "engine/placesEngine.js",
  "engine/educationPathEngine.js",
  "engine/workplaceEngine.js",
  "engine/nightlifeEngine.js",
  "engine/adultWorkEngine.js",
  "engine/pregnancyEngine.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
  "engine/socialWorldEngine.js",
  "engine/actions.js",
  "engine/events/eventConditions.js",
  "engine/events/eventEffects.js",
  "engine/events/eventWeights.js",
  "engine/events/eventEngine.js",
  "engine/events.js",
  "engine/simulation.js",
  "storage/saveLoad.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Итогов", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
  return GameState.state;
}

function makeAdult() {
  const st = fresh();
  st.age = 45;
  st.actions = 6;
  st.personalMoney = 5000;
  st.economy.cash = 5000;
  GameEconomyEngine.syncLegacy(st);
  return st;
}

function test(name, run) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("score rules calculate original life type", () => {
  const st = makeAdult();
  st.personalMoney = 1500000;
  st.economy.cash = 1500000;
  st.company = { sector: "it", cash: 120000, level: 8, reputation: 95, employees: 10, branches: 5 };
  GameEconomyEngine.syncLegacy(st);
  const lifeType = GameLifeSummaryEngine.scoreLifeType(st);
  assert.equal(lifeType.name, "Строитель империи");
});

test("achievements unlock and persist between lives", () => {
  store.clear();
  const st = makeAdult();
  st.age = 92;
  st.personalMoney = 1200000;
  st.economy.cash = 1200000;
  st.debt = 0;
  st.taxDebt = 0;
  st.health = 96;
  st.reputation = 100;
  GameEconomyEngine.syncLegacy(st);
  const summary = GameLifeSummaryEngine.createLifeSummary(st);
  assert(summary.achievements.some((item) => item.id === "first_million"));
  assert(summary.achievements.some((item) => item.id === "long_lived"));
  const next = fresh({ firstName: "Новая" });
  assert(GameLifeSummaryEngine.readAchievements().some((item) => item.id === "first_million"));
  assert(next.achievements.some((item) => item.id === "first_million"));
});

test("death creates life summary and generation history", () => {
  store.clear();
  const st = makeAdult();
  st.age = 110;
  st.health = 1;
  st.mental = 1;
  st.stress = 100;
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const died = GameSimulation.resolvePlayerDeath();
    assert.equal(died, true);
  } finally {
    Math.random = originalRandom;
  }
  assert.equal(st.deceased, true);
  assert(st.lifeSummary);
  assert(st.lifeSummary.deathCause);
  assert(st.legacySnapshot.lifeType?.name);
  assert.equal(GameStorage.readGenerationHistory().length, 1);
});

test("inheritance can continue as child and keeps family history", () => {
  store.clear();
  const st = makeAdult();
  st.children = [{ id: "child-1", name: "Лена", gender: "female", age: 12, bond: 80, health: 80, talent: 70 }];
  st.lifeSummary = GameLifeSummaryEngine.createLifeSummary(st, { persistAchievements: false });
  st.lifeType = st.lifeSummary.lifeType;
  st.legacySnapshot = GameLifeSummaryEngine.toGenerationRecord(st.lifeSummary);
  st.deathAge = 45;
  st.deathYear = 2071;
  const next = GameState.createLifeFromChild(st, "child-1");
  assert(next);
  assert.equal(next.generation, 2);
  assert.equal(next.firstName, "Лена");
  assert(next.familyHistory.length >= 1);
  assert(next.inheritedFrom.inheritedMoney >= 0);
});

test("normalizeState migrates summary fields", () => {
  const migrated = GameState.normalizeState({
    version: 7,
    age: 50,
    country: "ru",
    city: "kazan",
    firstName: "Иван",
    lastName: "Сводкин",
    gender: "male",
    lifeSummary: { name: "Иван Сводкин", lifeType: { name: "Тихая гавань" } },
    achievements: [{ id: "demo", name: "Демо" }],
  });
  assert.equal(migrated.version, 9);
  assert.equal(migrated.lifeSummary.lifeType.name, "Тихая гавань");
  assert.equal(migrated.achievements.length, 1);
});
