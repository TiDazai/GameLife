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

test("action with cost.money charges the price once (no double deduction)", () => {
  const st = fresh();
  st.age = 18;
  st.grades = 60;
  st.personalMoney = 1000;
  // career_enroll_university: cost.money 500 and a mirrored effects.money -500
  const before = st.personalMoney;
  const result = GameActionEngine.performAction(st, "career_enroll_university", () => 0.99);
  assert.equal(result.ok, true);
  assert.equal(before - st.personalMoney, 500); // single charge, not 1000
});

test("action flags add and removeFlags remove via performAction", () => {
  const st = fresh();
  st.age = 25;
  st.social = 60;
  st.personalMoney = 5000;
  GameActionEngine.performAction(st, "adult_serious_relationship", () => 0.99);
  assert(st.flags.includes("in_relationship"));
  const before = st.personalMoney;
  const married = GameActionEngine.performAction(st, "adult_marry", () => 0.99);
  assert.equal(married.ok, true);
  assert(st.flags.includes("married"));
  assert(!st.flags.includes("in_relationship")); // removeFlags applied
  assert.equal(before - st.personalMoney, 1500); // adult_marry charged once
});

test("active world event modifier changes annual expenses", () => {
  const st = fresh();
  st.age = 30;
  st.livingWithParents = false;
  st.worldEvents = [];
  const before = GameEconomyEngine.calculateAnnualExpenses(st).total;
  const inflation = GameData.worldEvents.find((w) => w.modifiers && w.modifiers.prices > 1);
  assert(inflation, "expected a world event with a prices modifier");
  st.worldEvents = [{ id: inflation.id, title: inflation.title, remaining: 3 }];
  const after = GameEconomyEngine.calculateAnnualExpenses(st).total;
  assert(after > before, "inflation world event should raise expenses");
});

test("adult relationship action syncs partner and pregnancy risk works", () => {
  const st = fresh();
  st.age = 24;
  st.personalMoney = 1000;
  st.relationship = { name: "Партнёр", age: 25, trust: 50, romance: 50, conflict: 10, bond: 50 };
  GameAdultRelationships.performAction(st, "romantic_evening");
  assert(st.relationship.romance > 50, "romance should sync onto partner");
  assert(st.relationship.bond > 50, "intimacy should raise partner bond");
  // pregnancy is an abstract risk gated to applicable adult relationships
  st.adultStats.pregnancyRisk = 100;
  st.adultStats.contraceptionDiscussed = 0;
  st.expectingChild = false;
  assert.equal(GameAdultRelationships.pregnancyChance(st), 1);
  assert.equal(GameAdultRelationships.maybePregnancy(st, () => 0), true);
  assert.equal(st.expectingChild, true);
  // discussing contraception lowers the risk
  st.expectingChild = false;
  st.adultStats.contraceptionDiscussed = 1;
  assert(GameAdultRelationships.pregnancyChance(st) < 1);
});

test("life stage context maps age to a stage and adulthood flag", () => {
  const child = GameActionLoad.getLifeStageContext({ age: 5 });
  assert.equal(child.stage, "child");
  assert.equal(child.isAdult, false);
  assert.equal(child.isMinor, true);
  const adult = GameActionLoad.getLifeStageContext({ age: 30 });
  assert.equal(adult.stage, "adult");
  assert.equal(adult.isAdult, true);
});

test("ordinary actions stay available across childhood, teen and adult ages", () => {
  const st = fresh();
  [5, 15, 30, 70].forEach((age) => {
    st.age = age;
    const list = GameActionEngine.getAvailableActions(st);
    assert(list.length > 0, `no actions available at age ${age}`);
  });
});

test("soft minAge lets actions start a little early as a child version", () => {
  const st = fresh();
  const has = (age) => {
    st.age = age;
    return GameActionEngine.getAvailableActions(st).some((a) => a.id === "teen_study_hard");
  };
  assert.equal(has(13), true); // natural age
  assert.equal(has(10), true); // 3 years early, within grace -> adapted
  assert.equal(has(8), false); // 5 years early, beyond grace -> hidden
  // adapted run scales effect down
  const action = GameActionData.find((a) => a.id === "teen_study_hard");
  const early = GameActionLoad.getAgeAdjustedEffects({ age: 10 }, action);
  assert(early.ageFactor < 1, "early action should fade");
  assert.equal(early.adapted, true);
  const onTime = GameActionLoad.getAgeAdjustedEffects({ age: 13 }, action);
  assert.equal(onTime.ageFactor, 1);
});

test("adultOnly actions are hidden before 18 and unlocked at 18+", () => {
  const st = fresh();
  const visible = (age) => {
    st.age = age;
    return GameActionEngine.getAvailableActions(st).some((a) => a.id === "adult_dating_app");
  };
  assert.equal(visible(17), false);
  assert.equal(visible(18), true);
  // adaptForAge marks the reason for minors
  const action = GameActionData.find((a) => a.id === "adult_dating_app");
  const blocked = GameActionLoad.adaptActionForAge({ age: 16 }, action);
  assert.equal(blocked.available, false);
  assert.equal(blocked.hardBlocked, true);
});

test("teen social actions stay non-explicit and never touch adultStats", () => {
  const st = fresh();
  st.age = 15;
  const teenSocial = GameActionEngine.getAvailableActions(st).find((a) => a.category === "social" && !a.adultOnly);
  assert(teenSocial, "expected a teen social action");
  GameActionEngine.performAction(st, teenSocial.id, () => 0.99);
  assert(!st.adultStats || Object.keys(st.adultStats).length === 0, "adultStats must not appear for minors");
  assert.equal(GameAdultRelationships.isUnlocked(st), false);
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
