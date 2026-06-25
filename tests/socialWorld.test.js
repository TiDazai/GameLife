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
  "data/namesByCountry.js",
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
  "data/lifeGoals.js",
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
  "engine/lifeGoalsEngine.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
  "engine/socialWorldEngine.js",
  "engine/events/eventConditions.js",
  "engine/events/eventEffects.js",
  "engine/events/eventWeights.js",
  "engine/events/eventEngine.js",
  "storage/saveLoad.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  const st = GameState.createNewLife({ firstName: "Тест", lastName: "Игров", country: "ru", city: "kazan", ...options });
  GameState.setState(st);
  return GameState.state;
}

function test(name, run) {
  try {
    store.clear();
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

// 1. Parents (and grandparents) are concrete NPCs.
test("createNewLife makes parents concrete NPCs", () => {
  const st = fresh();
  const parents = st.npcs.filter((n) => n.relationType === "parent");
  assert(parents.length >= 2, "expected mother and father as NPCs");
  parents.forEach((p) => {
    assert(p.name && p.lastName, "parent has a real name");
    assert.equal(p.country, "ru");
  });
});

// 2. Childhood/neighborhood circles populate once, no duplicates on repeated ticks.
test("childhood + neighborhood circles generate once without duplicates", () => {
  const st = fresh();
  st.age = 6;
  GameSocialWorld.tick(st);
  const after1 = st.npcs.length;
  GameSocialWorld.tick(st);
  GameSocialWorld.tick(st);
  assert.equal(st.npcs.length, after1, "ticking again must not add more people");
  assert(st.socialWorld.childhoodGenerated);
  assert(st.socialWorld.neighborhoodGenerated);
});

// 3. School age creates classmates + teachers exactly once.
test("school age creates classmates and teachers once", () => {
  const st = fresh();
  st.age = 10;
  GameSocialWorld.tick(st);
  const classmates = st.npcs.filter((n) => n.relationType === "classmate" && n.metContext === "school");
  const teachers = st.npcs.filter((n) => n.relationType === "teacher" && n.metContext === "school");
  assert(classmates.length >= 4 && classmates.length <= 8, `classmates ${classmates.length}`);
  assert(teachers.length >= 1 && teachers.length <= 3, `teachers ${teachers.length}`);
  classmates.forEach((c) => assert(c.schoolId, "classmate has schoolId"));
  const count = st.npcs.length;
  st.age = 11;
  GameSocialWorld.tick(st);
  assert.equal(st.npcs.length, count, "no new school cohort the next year");
  assert(st.socialWorld.schoolGenerated);
});

// 4. University enroll creates classmates/teachers with schoolId + metContext.
test("university enroll tags cohort with schoolId and metContext", () => {
  const st = fresh();
  st.age = 19;
  const specs = GameEducationPath.listSpecialties("university");
  GameEducationPath.enroll(st, { institutionType: "university", specialtyId: specs[0].id });
  const institutionId = st.educationPath.institutionId;
  const cohort = st.npcs.filter((n) => n.schoolId === institutionId);
  assert(cohort.length > 0, "cohort created");
  cohort.forEach((n) => {
    assert.equal(n.metContext, "university");
    assert(["classmate", "teacher", "professor"].includes(n.relationType));
  });
});

// 5. Hiring creates a boss + coworkers with workplaceId + metContext "work".
test("hiring creates boss and coworkers tagged to the workplace", () => {
  const st = fresh();
  st.age = 30;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  const wId = st.workplace.workplaceId;
  const boss = st.npcs.filter((n) => n.relationType === "boss" && n.workplaceId === wId);
  const coworkers = st.npcs.filter((n) => n.relationType === "coworker" && n.workplaceId === wId);
  assert.equal(boss.length, 1, "one boss");
  assert(coworkers.length >= 2 && coworkers.length <= 6, `coworkers ${coworkers.length}`);
  [...boss, ...coworkers].forEach((n) => assert.equal(n.metContext, "work"));
});

// 6. Changing job keeps old coworkers (retagged) and builds a new team.
test("changing job preserves old colleagues and builds a new team", () => {
  const st = fresh();
  st.age = 30;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  const firstTeamIds = [st.workplace.bossId, ...st.workplace.coworkerIds];
  GameWorkplace.leave(st, "Смена работы");
  GameWorkplace.onHire(st, { id: "mgr", title: "Менеджер", field: "service", industry: "service" });
  // old colleagues still exist, retagged as ex-coworkers
  firstTeamIds.forEach((id) => {
    const npc = st.npcs.find((n) => n.id === id);
    assert(npc, "old colleague still in world");
    assert(npc.tags.includes("ex_coworker"), "old colleague retagged ex_coworker");
  });
  // new team exists and is distinct
  const newWid = st.workplace.workplaceId;
  const newTeam = st.npcs.filter((n) => n.workplaceId === newWid && ["boss", "coworker"].includes(n.relationType));
  assert(newTeam.length >= 3, "new team created");
});

// 7. "Find a friend" social helper creates a concrete friend NPC.
test("createRandomFriend adds a concrete friend NPC", () => {
  const st = fresh();
  st.age = 20;
  const before = st.npcs.length;
  const friend = GameSocialWorld.createRandomFriend(st, {});
  assert(friend && friend.id, "friend created");
  assert.equal(friend.relationType, "friend");
  assert.equal(st.npcs.length, before + 1);
});

// 8. Dating helper creates a country-aware date NPC (18+ only).
test("createDatingNpc creates a country-aware date NPC at 18+", () => {
  const usCity = Object.keys(window.GameData.countries.us.cities)[0];
  const st = fresh({ country: "us", city: usCity });
  st.age = 25;
  const date = GameSocialWorld.createDatingNpc(st, {});
  assert(date, "date created at 18+");
  assert.equal(date.relationType, "date");
  assert.equal(date.country, "us", "date inherits player's country for naming");
  assert.equal(date.metContext, "dating");
});

// 9. Nightlife encounter only happens at 18+.
test("createNightlifeEncounter is gated to adults", () => {
  const minor = fresh();
  minor.age = 16;
  assert.equal(GameSocialWorld.createNightlifeEncounter(minor, {}), null);
  const adult = fresh();
  adult.age = 22;
  const enc = GameSocialWorld.createNightlifeEncounter(adult, { relationType: "friend" });
  assert(enc && enc.metContext === "nightlife");
});

// 10. Doctor visit creates (and reuses) a concrete doctor NPC.
test("createDoctorNpc creates one doctor and reuses it", () => {
  const st = fresh();
  st.age = 30;
  const doc1 = GameSocialWorld.createDoctorNpc(st, {});
  const doc2 = GameSocialWorld.createDoctorNpc(st, {});
  assert(doc1 && doc1.relationType === "doctor");
  assert.equal(doc1.id, doc2.id, "second visit reuses the same doctor");
  assert.equal(st.npcs.filter((n) => n.relationType === "doctor").length, 1);
});

// 11. Save/load preserves NPC metContext, history, workplaceId and schoolId.
test("save/load preserves NPC context, history, workplaceId and schoolId", () => {
  GameStorage.startGame({ firstName: "Вера", lastName: "Дуб", country: "ru", city: "kazan" });
  const st = GameState.state;
  st.age = 30;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  const specs = GameEducationPath.listSpecialties("university");
  GameEducationPath.enroll(st, { institutionType: "university", specialtyId: specs[0].id });
  const boss = st.npcs.find((n) => n.relationType === "boss");
  const classmate = st.npcs.find((n) => n.relationType === "classmate");
  assert(boss && classmate);
  const bossId = boss.id;
  const classmateId = classmate.id;
  const wId = boss.workplaceId;
  const schoolId = classmate.schoolId;

  GameStorage.saveCurrentGame(st);
  GameState.setState(GameState.createNewLife({ firstName: "Сброс", lastName: "Сброс", country: "ru", city: "moscow" }));
  GameStorage.loadCurrentGame();
  const loaded = GameState.state;

  const loadedBoss = loaded.npcs.find((n) => n.id === bossId);
  const loadedClassmate = loaded.npcs.find((n) => n.id === classmateId);
  assert(loadedBoss, "boss survived reload");
  assert.equal(loadedBoss.metContext, "work");
  assert.equal(loadedBoss.workplaceId, wId);
  assert(loadedBoss.history.length > 0, "boss history preserved");
  assert(loadedClassmate, "classmate survived reload");
  assert.equal(loadedClassmate.metContext, "university");
  assert.equal(loadedClassmate.schoolId, schoolId);
});

// 12. Repeated yearly ticks never duplicate the school or work groups.
test("repeated ticks never duplicate school or work cohorts", () => {
  const st = fresh();
  st.age = 30;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  // simulate being a schoolchild earlier is impossible at 30; instead test work + a manual school flag path
  st.age = 12;
  GameSocialWorld.tick(st);
  const snapshot = st.npcs.length;
  for (let i = 0; i < 5; i++) GameSocialWorld.tick(st);
  assert.equal(st.npcs.length, snapshot, "no duplicate cohorts after many ticks");
});
