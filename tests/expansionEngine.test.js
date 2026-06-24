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
  "data/legal.js",
  "data/relationshipActions.js",
  "data/adultRelationships.js",
  "data/lifeGoals.js",
  "data/worldEvents.js",
  "data/storyArcs.js",
  "data/actions/childhood.js",
  "data/actions/teen.js",
  "data/actions/adultLife.js",
  "data/actions/careerActions.js",
  "data/actions/moneyActions.js",
  "data/actions/healthActions.js",
  "engine/npcFactory.js",
  "engine/careerEngine.js",
  "engine/economyEngine.js",
  "engine/healthEngine.js",
  "engine/legalEngine.js",
  "engine/lifeSummaryEngine.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
  "engine/events/eventConditions.js",
  "engine/events/eventEffects.js",
  "engine/events/eventWeights.js",
  "engine/events/eventEngine.js",
  "engine/actionLoad.js",
  "engine/actionEngine.js",
  "engine/lifeGoalsEngine.js",
  "engine/worldEventsEngine.js",
  "engine/storyArcsEngine.js",
  "engine/adultRelationships.js",
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

test("countries dataset has 40+ countries and full city fields", () => {
  assert(Object.keys(GameData.countries).length >= 40);
  assert(GameData.countries.ru.cities.kazan);
  const fields = Object.keys(GameData.countries.ru.cities.kazan);
  ["cost", "salary", "education", "safety", "opportunity", "housing", "culture", "nightlife", "romance"].forEach((f) => assert(fields.includes(f), `missing city field ${f}`));
});

test("action database loaded with 150+ unique actions", () => {
  const ids = GameActionData.map((a) => a.id);
  assert(GameActionData.length >= 150);
  assert.equal(new Set(ids).size, ids.length, "duplicate action ids");
});

test("new life gets goal, talents, hidden modifiers", () => {
  const st = fresh({ lifeGoal: "wealth" });
  assert.equal(st.lifeGoal, "wealth");
  assert(Array.isArray(st.talents));
  assert(Object.keys(st.hiddenModifiers).length > 0);
  assert.equal(st.version, 9);
});

test("data-driven action applies effects and records fatigue", () => {
  const st = fresh();
  st.age = 20;
  st.personalMoney = 1000;
  const action = GameActionEngine.getAvailableActions(st).find((a) => !a.cost?.money && a.effects && Object.keys(a.effects).length);
  assert(action, "expected an available free action");
  const beforeCount = st.yearlyActionCount || 0;
  const result = GameActionEngine.performAction(st, action.id, () => 0.99);
  assert.equal(result.ok, true);
  assert(st.yearlyActionCount > beforeCount);
});

test("repeated actions diminish efficiency", () => {
  const st = fresh();
  st.age = 25;
  const eff1 = GameActionLoad.getActionEfficiency(st, "studyKey");
  st.repeatedActions = { studyKey: 4 };
  const eff2 = GameActionLoad.getActionEfficiency(st, "studyKey");
  assert(eff2 < eff1);
});

test("yearly fatigue resets and heavy load builds fatigue", () => {
  const st = fresh();
  st.age = 22;
  for (let i = 0; i < 14; i += 1) GameActionLoad.recordActionUse(st, "x" + (i % 3), 1);
  assert(st.actionFatigue > 0);
  const consequences = GameActionLoad.applyYearlyFatigueConsequences(st);
  assert(Array.isArray(consequences));
  GameActionLoad.resetYearlyActionLoad(st);
  assert.equal(st.yearlyActionCount, 0);
});

test("adult relationships locked under 18 and require adult partner", () => {
  const st = fresh();
  st.age = 16;
  st.relationship = { name: "Партнёр", age: 16 };
  assert.equal(GameAdultRelationships.isUnlocked(st), false);
  st.age = 22;
  st.relationship = { name: "Партнёр", age: 23, trust: 50, romance: 50, conflict: 10, bond: 50 };
  assert.equal(GameAdultRelationships.isUnlocked(st), true);
  const acts = GameAdultRelationships.getActions(st);
  assert(acts.length > 0);
  const before = st.adultStats?.trust;
  GameAdultRelationships.performAction(st, "deep_talk");
  assert(st.adultStats.trust >= (before || 0));
});

test("life goal progress evaluates milestones", () => {
  const st = fresh({ lifeGoal: "wealth" });
  st.personalMoney = 6000;
  GameLifeGoals.evaluate(st);
  const desc = GameLifeGoals.describe(st);
  assert(desc.progress > 0);
});

test("world events start and apply over time", () => {
  const st = fresh();
  st.age = 30;
  let started = null;
  for (let i = 0; i < 50 && !started; i += 1) started = GameWorldEvents.maybeStart(st, () => 0.05);
  assert(started, "world event should eventually start");
  assert(GameWorldEvents.describe(st).length >= 1);
  const mods = GameWorldEvents.combinedModifiers(st);
  assert(typeof mods.salary === "number");
});

test("story arcs start and advance", () => {
  const st = fresh();
  st.age = 25;
  st.knowledge = 50;
  st.personalMoney = 6000;
  let arc = null;
  for (let i = 0; i < 50 && !arc; i += 1) arc = GameStoryArcs.maybeStart(st, () => 0.05);
  assert(arc, "a story arc should start");
  const instance = st.storyArcs[0];
  GameStoryArcs.advance(st, instance, () => 0.5);
  assert(instance.step || instance.status !== "active");
});

test("save/load round trip preserves new fields at version 9", () => {
  const st = fresh({ lifeGoal: "career" });
  st.actionFatigue = 33;
  st.worldEvents = [{ id: "recession", title: "Кризис", remaining: 2 }];
  GameStorage.saveGame();
  GameStorage.loadGame();
  assert.equal(GameState.state.version, 9);
  assert.equal(GameState.state.lifeGoal, "career");
  assert.equal(GameState.state.actionFatigue, 33);
  assert.equal(GameState.state.worldEvents.length, 1);
});
