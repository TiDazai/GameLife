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
  "data/places.js",
  "data/education/specialties.js",
  "data/education/schools.js",
  "data/education/universities.js",
  "data/careers/positions.js",
  "data/careers/careerTracks.js",
  "data/careers/companies.js",
  "data/careers/workplaces.js",
  "data/nightlife.js",
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
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
  "engine/events/eventConditions.js",
  "engine/events/eventEffects.js",
  "engine/events/eventWeights.js",
  "engine/events/eventEngine.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Правов", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
  return GameState.state;
}

function adult() {
  const st = fresh();
  st.age = 30;
  st.actions = 6;
  st.personalMoney = 8000;
  st.familyMoney = 4000;
  st.economy.cash = 8000;
  GameEconomyEngine.syncLegacy(st);
  GameLegalEngine.normalizeLegalState(st, st);
  return st;
}

function qualifyFor(jobId, st) {
  const job = GameCareerEngine.jobById(jobId);
  st.age = Math.max(st.age, job.minAge + 1);
  st.education.levelId = job.requirements.education;
  st.education.completed.push(job.requirements.education);
  st.knowledge = Math.max(st.knowledge, job.requirements.knowledge + 20);
  Object.entries(job.requirements.skills || {}).forEach(([skill, value]) => {
    st.skills[skill] = value + 20;
  });
  st.reputation = 90;
  return job;
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

test("fine is added and changes legal status", () => {
  const st = adult();
  const fine = GameLegalEngine.addFine(st, 500, "Тестовый штраф");
  assert.equal(fine.amount, 500);
  assert.equal(GameLegalEngine.unpaidFines(st).length, 1);
  assert.equal(st.legalStatus, "fined");
});

test("payFine spends money and closes unpaid fine", () => {
  const st = adult();
  const fine = GameLegalEngine.addFine(st, 500, "Тестовый штраф");
  const before = st.personalMoney;
  const result = GameLegalEngine.payFine(st, fine.id);
  assert.equal(result.ok, true);
  assert(st.personalMoney < before);
  assert.equal(GameLegalEngine.unpaidFines(st).length, 0);
});

test("criminalRecord blocks sensitive career and lowers salary", () => {
  const st = adult();
  const job = qualifyFor("auditor", st);
  assert.equal(GameCareerEngine.meetsJobRequirements(st, job), true);
  const cleanSalary = GameCareerEngine.calculateSalary(st, job.id);
  st.criminalRecord = 2;
  GameLegalEngine.syncLegalStatus(st);
  assert.equal(GameCareerEngine.meetsJobRequirements(st, job), false);
  st.criminalRecord = 1;
  GameLegalEngine.syncLegalStatus(st);
  assert(GameCareerEngine.calculateSalary(st, job.id) < cleanSalary);
});

test("reputation action restores trust and standing", () => {
  const st = adult();
  st.reputation = 20;
  st.publicTrust = 25;
  st.socialStanding = 30;
  const result = GameLegalEngine.restoreReputation(st, "restore_reputation");
  assert.equal(result.ok, true);
  assert(st.reputation > 20);
  assert(st.publicTrust > 25);
});

test("legal event can add a fine through event engine", () => {
  const st = adult();
  const before = GameLegalEngine.unpaidFines(st).length;
  const result = GameEventEngine.applyEventOption(st, "legal_transport_fine", "rush", () => 0);
  assert.equal(result.ok, true);
  assert(GameLegalEngine.unpaidFines(st).length > before);
});

test("normalizeState migrates legacy legal fields", () => {
  const migrated = GameState.normalizeState({
    version: 6,
    age: 40,
    country: "ru",
    city: "kazan",
    firstName: "Иван",
    lastName: "Сейвов",
    gender: "male",
    reputation: 35,
    karma: 42,
    criminalRecord: 1,
  });
  assert.equal(migrated.version, 9);
  assert.equal(migrated.criminalRecord, 1);
  assert(["restricted", "convicted"].includes(migrated.legalStatus));
  assert(Number.isFinite(migrated.publicTrust));
  assert(Array.isArray(migrated.fines));
  assert(Array.isArray(migrated.activeCases));
});
