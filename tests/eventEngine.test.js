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
  "engine/events/eventConditions.js",
  "engine/events/eventEffects.js",
  "engine/events/eventWeights.js",
  "engine/events/eventEngine.js",
  "storage/saveLoad.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Игров", country: "ru", city: "kazan", ...options }));
  return GameState.state;
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

test("checkConditions validates min/max stats and flags", () => {
  const st = fresh();
  st.stress = 55;
  st.health = 80;
  st.flags = ["seen"];
  assert.equal(GameEventEngine.checkConditions(st, {
    minStats: { stress: 50 },
    maxStats: { health: 90 },
    requiredFlags: ["seen"],
    blockedFlags: ["blocked"],
  }), true);
  assert.equal(GameEventEngine.checkConditions(st, { minStats: { stress: 90 } }), false);
});

test("applyEffects clamps bounded stats and changes money safely", () => {
  const st = fresh();
  st.health = 98;
  st.personalMoney = 50;
  st.skills.finance = 0; // pin baseline: starting skills are randomized at creation
  GameEventEngine.applyEffects(st, { health: 10, stress: -50, money: -100, finance: 4 });
  assert.equal(st.health, 100);
  assert.equal(st.stress, 0);
  assert.equal(st.personalMoney, 0);
  assert.equal(st.skills.finance, 4);
});

test("available events are selected by age", () => {
  const st = fresh();
  st.age = 8;
  const ids = GameEventEngine.getAvailableEvents(st).map((event) => event.id);
  assert(ids.includes("school_class_conflict"));
});

test("events outside age range are blocked", () => {
  const st = fresh();
  st.age = 30;
  const ids = GameEventEngine.getAvailableEvents(st).map((event) => event.id);
  assert(!ids.includes("childhood_lost_toy"));
});

test("applyEventOption applies option effects and logs result", () => {
  const st = fresh();
  st.age = 18;
  st.personalMoney = 500;
  const before = st.log.length;
  const result = GameEventEngine.applyEventOption(st, "money_subscription_leak", "audit", () => 0.9);
  assert.equal(result.ok, true);
  assert(st.personalMoney > 500);
  assert(st.skills.finance > 0);
  assert.equal(st.event, null);
  assert.equal(st.log.length, before + 1);
});

test("risk effects apply with fixed rng", () => {
  const st = fresh();
  st.age = 16;
  st.criminalRecord = 0;
  GameEventEngine.applyEventOption(st, "teen_bad_company", "go", () => 0.1);
  assert.equal(st.criminalRecord, 1);
  assert(st.reputation < 0 || st.stress > 4);
});

test("event weight supports weight as fallback for baseWeight and can be picked", () => {
  const st = fresh();
  const onlyWeight = { id: "wonly", category: "adult", weight: 7 };
  const bothFields = { id: "wboth", category: "adult", baseWeight: 3, weight: 99 };
  assert.equal(GameEventEngine.eventWeight(st, onlyWeight), 7);
  assert.equal(GameEventEngine.eventWeight(st, bothFields), 3); // baseWeight wins over weight
  const picked = GameEventWeights.pickWeighted([onlyWeight], (event) => GameEventEngine.eventWeight(st, event), () => 0.5);
  assert.equal(picked?.id, "wonly");
});

test("active event saves and loads", () => {
  const st = fresh();
  st.age = 8;
  const event = GameEventEngine.getEventById("school_class_conflict");
  st.event = GameEventEngine.toActiveEvent(event);
  GameStorage.saveGame();
  st.event = null;
  GameStorage.loadGame();
  assert.equal(GameState.state.event.id, "school_class_conflict");
  assert.equal(GameState.state.version, 9);
});
