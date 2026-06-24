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
  "data/relationshipActions.js",
  "engine/npcFactory.js",
  "engine/careerEngine.js",
  "engine/economyEngine.js",
  "engine/healthEngine.js",
  "engine/legalEngine.js",
  "engine/lifeSummaryEngine.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Карьерин", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
  return GameState.state;
}

function readyAdult(jobId = "frontend_dev") {
  const st = fresh();
  st.age = 24;
  st.actions = 8;
  st.maxActions = 8;
  st.personalMoney = 10000;
  st.knowledge = 90;
  st.reputation = 70;
  st.network = 70;
  st.portfolio = 70;
  st.discipline = 80;
  Object.keys(st.skills).forEach((skill) => {
    st.skills[skill] = 80;
  });
  st.education.levelId = "university";
  st.education.completed.push("secondary", "college", "university", "courses");
  GameCareerEngine.syncLegacy(st);
  assert(GameCareerEngine.meetsJobRequirements(st, jobId));
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

test("education action changes level, knowledge and skills", () => {
  const st = fresh();
  st.age = 17;
  st.actions = 3;
  st.personalMoney = 5000;
  const beforeKnowledge = st.knowledge;
  const beforeLogic = st.skills.logic;
  const result = GameCareerEngine.study(st, "university");
  assert.equal(result.ok, true);
  assert.equal(st.education.levelId, "university");
  assert(st.knowledge > beforeKnowledge);
  assert(st.skills.logic > beforeLogic);
});

test("job requirements block underqualified character", () => {
  const st = fresh();
  st.age = 18;
  st.education.levelId = "secondary";
  st.knowledge = 20;
  const job = GameCareerEngine.jobById("doctor");
  const missing = GameCareerEngine.missingRequirements(st, job);
  assert(missing.length > 0);
  assert.equal(GameCareerEngine.meetsJobRequirements(st, job), false);
});

test("interview hires qualified character", () => {
  const st = readyAdult("frontend_dev");
  const result = GameCareerEngine.interview(st, "frontend_dev", () => 0);
  assert.equal(result.ok, true);
  assert.equal(st.career.jobId, "frontend_dev");
  assert.equal(st.career.status, "employed");
  assert.equal(st.profession, "it");
});

test("salary depends on city, education, experience, skills and level", () => {
  const st = readyAdult("data_analyst");
  GameCareerEngine.hire(st, "data_analyst");
  const base = GameCareerEngine.calculateSalary(st);
  st.career.experience += 4;
  st.career.level += 2;
  st.skills.logic = 100;
  st.reputation = 95;
  const grown = GameCareerEngine.calculateSalary(st);
  assert(grown > base);
});

test("promotion increases career level when requirements are met", () => {
  const st = readyAdult("frontend_dev");
  GameCareerEngine.hire(st, "frontend_dev");
  st.career.experience = 8;
  st.reputation = 90;
  const before = st.career.level;
  const result = GameCareerEngine.promote(st);
  assert.equal(result.ok, true);
  assert.equal(st.career.level, before + 1);
  assert.equal(st.careerLevel, st.career.level);
});

test("fire clears current job and keeps migration-safe legacy fields", () => {
  const st = readyAdult("qa_engineer");
  GameCareerEngine.hire(st, "qa_engineer");
  const result = GameCareerEngine.fire(st, "Тестовое увольнение.");
  assert.equal(result.ok, true);
  assert.equal(st.career.jobId, null);
  assert.equal(st.job, null);
  assert.equal(st.profession, "none");
});

test("normalizeState migrates old education and career fields", () => {
  const migrated = GameState.normalizeState({
    version: 3,
    age: 29,
    firstName: "Ирина",
    lastName: "Старая",
    gender: "female",
    country: "ru",
    city: "kazan",
    educationLevel: "Высшее образование",
    profession: "it",
    careerLevel: 2,
    experience: 5,
    certificates: ["digital"],
  });
  assert.equal(migrated.version, 8);
  assert.equal(migrated.education.levelId, "university");
  assert.equal(migrated.career.level, 2);
  assert.equal(migrated.career.experience, 5);
});

test("career catalog has at least 60 jobs with required fields", () => {
  assert(GameCareerEngine.jobs().length >= 60);
  GameCareerEngine.jobs().forEach((job) => {
    ["id", "title", "industry", "minAge", "requirements", "baseSalary", "salaryGrowth", "stress", "prestige", "burnoutRisk", "promotionRequirements", "firingRisk", "skillGrowth", "eventTags"].forEach((key) => {
      assert(key in job, `${job.id}.${key}`);
    });
  });
});
