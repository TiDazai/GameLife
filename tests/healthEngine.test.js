const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
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
  "data/legal.js",
  "data/places.js",
  "data/education/specialties.js",
  "data/education/schools.js",
  "data/education/universities.js",
  "data/relationshipActions.js",
  "engine/npcFactory.js",
  "engine/careerEngine.js",
  "engine/economyEngine.js",
  "engine/healthEngine.js",
  "engine/legalEngine.js",
  "engine/lifeSummaryEngine.js",
  "engine/placesEngine.js",
  "engine/educationPathEngine.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Здоров", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
  return GameState.state;
}

function adult() {
  const st = fresh();
  st.age = 35;
  st.actions = 6;
  st.personalMoney = 5000;
  st.familyMoney = 5000;
  st.economy.cash = 5000;
  GameEconomyEngine.syncLegacy(st);
  GameHealthEngine.normalizeHealthState(st, st);
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

test("condition risk reacts to stress, sleep and immunity", () => {
  const st = adult();
  st.healthProfile.stress = 75;
  st.healthProfile.sleep = 35;
  st.healthProfile.immunity = 30;
  const risk = GameHealthEngine.conditionRisk(st, GameHealthEngine.conditionById("insomnia"));
  assert(risk > 0.02);
});

test("condition can be added to the normalized health profile", () => {
  const st = adult();
  const result = GameHealthEngine.addCondition(st, "common_cold", "test");
  assert.equal(result.ok, true);
  assert.equal(GameHealthEngine.hasCondition(st, "common_cold"), true);
  assert(st.healthProfile.treatmentHistory[0].includes("Простуда"));
});

test("treatment spends money, applies effects and can close condition", () => {
  const st = adult();
  GameHealthEngine.addCondition(st, "common_cold", "test");
  const beforeMoney = st.personalMoney;
  const beforeEnergy = st.energy;
  const result = GameHealthEngine.treatCondition(st, "common_cold", "clinic", () => 0);
  assert.equal(result.ok, true);
  assert.equal(result.success, true);
  assert(st.personalMoney < beforeMoney);
  assert(st.energy > beforeEnergy);
  assert.equal(GameHealthEngine.hasCondition(st, "common_cold"), false);
});

test("yearly effects reduce health stats for active conditions", () => {
  const st = adult();
  GameHealthEngine.addCondition(st, "insomnia", "test");
  const beforeSleep = st.healthProfile.sleep;
  const beforeEnergy = st.healthProfile.energy;
  const summary = GameHealthEngine.resolveHealthYear(st, () => 1);
  assert(summary.affectedBy.includes("Бессонница"));
  assert(st.healthProfile.sleep < beforeSleep);
  assert(st.healthProfile.energy < beforeEnergy);
});

test("insurance lowers treatment cost", () => {
  const st = adult();
  const condition = GameHealthEngine.conditionById("migraine");
  const treatment = condition.treatmentOptions.find((item) => item.id === "neurologist");
  st.documents.insurance = "none";
  const none = GameHealthEngine.treatmentCost(st, condition, treatment);
  st.documents.insurance = "basic";
  const basic = GameHealthEngine.treatmentCost(st, condition, treatment);
  st.documents.insurance = "premium";
  const premium = GameHealthEngine.treatmentCost(st, condition, treatment);
  assert(none > basic);
  assert(basic > premium);
});

test("health conditions add to death risk modifier", () => {
  const st = adult();
  st.age = 55;
  GameHealthEngine.addCondition(st, "heart_issues", "test");
  assert(GameHealthEngine.deathRiskModifier(st) >= 0.006);
});

test("normalizeState migrates legacy health fields", () => {
  const migrated = GameState.normalizeState({
    version: 5,
    age: 28,
    country: "ru",
    city: "kazan",
    firstName: "Иван",
    lastName: "Сейвов",
    gender: "male",
    health: 64,
    mental: 58,
    stress: 44,
    energy: 51,
    skills: { fitness: 33 },
  });
  assert.equal(migrated.version, 9);
  assert.equal(migrated.healthProfile.health, 64);
  assert.equal(migrated.healthProfile.mental, 58);
  assert.equal(migrated.healthProfile.stress, 44);
  assert.equal(migrated.healthProfile.energy, 51);
  assert.equal(migrated.healthProfile.fitness, 33);
});
