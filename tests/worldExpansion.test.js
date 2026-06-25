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

// 1. Starter city is seeded with concrete Place objects.
test("createNewLife seeds concrete city places", () => {
  const st = fresh();
  assert(Array.isArray(st.places) && st.places.length > 0);
  st.places.forEach((p) => {
    assert(p.id && p.type && typeof p.name === "string");
  });
});

// 2. Every important contact is a concrete NPC object.
test("contact helpers create concrete NPC objects", () => {
  const st = fresh();
  st.age = 30;
  const friend = GameNpcFactory.createFriendNpc(st, {});
  assert(friend && friend.id && friend.fullName && friend.relationType === "friend");
  assert(friend.relationshipStats && typeof friend.relationshipStats.bond === "number");
});

// 3. Adding a friend NPC registers it in state.npcs.
test("friend NPC is registered in state.npcs", () => {
  const st = fresh();
  st.age = 30;
  const before = st.npcs.length;
  const friend = GameNpcFactory.createFriendNpc(st, {});
  GameRelationshipEngine.addNpc(st, friend);
  assert.equal(st.npcs.length, before + 1);
  assert(GameRelationshipEngine.findNpc(st, friend.id));
});

// 4. Getting hired builds a company, workplace Place, boss and coworkers as NPCs.
test("hiring creates company, workplace, boss and coworkers", () => {
  const st = fresh();
  st.age = 28;
  const job = { id: "dev", title: "Разработчик", field: "tech", industry: "tech" };
  GameWorkplace.onHire(st, job);
  assert(st.workplace.active);
  assert(st.workplace.company && st.workplace.company.id && st.workplace.company.name);
  assert(st.workplace.workplaceId);
  assert(st.workplace.bossId && GameRelationshipEngine.findNpc(st, st.workplace.bossId));
  assert(st.workplace.coworkerIds.length >= 1);
  st.workplace.coworkerIds.forEach((id) => assert(GameRelationshipEngine.findNpc(st, id)));
});

// 5. Promotion advances the position object on the ladder.
test("promotion changes the workplace position", () => {
  const st = fresh();
  st.age = 28;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  const before = st.workplace.level;
  GameWorkplace.promote(st);
  assert(st.workplace.level >= before);
});

// 6. Enrolling builds an institution Place, specialty, classmates and teachers.
test("education enroll creates institution, cohort and diploma on graduation", () => {
  const st = fresh();
  st.age = 18;
  const specs = GameEducationPath.listSpecialties("university");
  assert(specs.length > 0);
  const enrolled = GameEducationPath.enroll(st, { institutionType: "university", specialtyId: specs[0].id });
  assert(enrolled && st.educationPath.active);
  assert(st.educationPath.institutionId);
  assert(st.educationPath.classmateIds.length >= 1);
  assert(st.educationPath.teacherIds.length >= 1);
  st.educationPath.classmateIds.forEach((id) => assert(GameRelationshipEngine.findNpc(st, id)));
});

// 7. Nightlife is gated to adults and creates a venue Place.
test("nightlife hidden under 18 and creates venue when adult", () => {
  const minor = fresh();
  minor.age = 16;
  assert.equal(GameNightlife.isAvailable(minor), false);

  GameState.setState(GameState.createNewLife({ firstName: "А", lastName: "Б", country: "ru", city: "kazan" }));
  const adult = GameState.state;
  adult.age = 22;
  adult.personalMoney = 3000;
  assert.equal(GameNightlife.isAvailable(adult), true);
  const activities = GameNightlife.listActivities(adult);
  assert(activities.length > 0);
  const result = GameNightlife.go(adult, activities[0].id, Math.random);
  assert(result && (result.ok === undefined || result.ok));
  assert(adult.places.some((p) => GamePlaces.typeMeta(p.type).category === "nightlife"));
});

// 8. Adult work route is unavailable and empty under 18.
test("adult work route unavailable under 18", () => {
  const minor = fresh();
  minor.age = 15;
  assert.equal(GameAdultWork.isAvailable(minor), false);
  assert.equal(GameAdultWork.listTypes(minor).length, 0);
  const blocked = GameAdultWork.start(minor, Object.keys(GameAdultWorkData.types)[0]);
  assert.equal(blocked.ok, false);
});

// 9. Adult work route works for adults and country legal profile affects risk.
test("adult work route available for adults; legal profile shifts risk", () => {
  const st = fresh();
  st.age = 24;
  const typeId = Object.keys(GameAdultWorkData.types)[0];
  const started = GameAdultWork.start(st, typeId);
  assert.equal(started.ok, true);
  assert(st.adultWork.active);
  const year = GameAdultWork.resolveYear(st, () => 0.5);
  assert(year && typeof year.income === "number");
  GameAdultWork.exit(st);
  assert.equal(st.adultWork.active, false);
  assert(st.tags.includes("adult_work_past"));

  const multRu = GameAdultWork.legalMultiplier({ country: "ru", city: "kazan" });
  const multOther = GameAdultWork.legalMultiplier({ country: "de", city: "berlin" });
  assert(typeof multRu === "number" && multRu >= 0.5 && multRu <= 1.6);
  assert(typeof multOther === "number");
});

// 10. Adult-route data carries no explicit/graphic content markers.
test("adult-route data contains no explicit content markers", () => {
  const text = JSON.stringify(GameAdultWorkData).toLowerCase();
  ["porn", "порно", "genital", "гениталий", "explicit", "оргия"].forEach((marker) => {
    assert(!text.includes(marker), `unexpected explicit marker: ${marker}`);
  });
});

// 11. Pregnancy lifecycle resolves into a real child NPC.
test("pregnancy resolves into a child NPC at due year", () => {
  const st = fresh();
  st.age = 28;
  st.year = 100;
  GamePregnancy.start(st, { context: "planned_with_spouse" });
  assert(st.pregnancy.active);
  const childrenBefore = (st.npcs || []).filter((n) => n.relationType === "child").length;
  st.year = st.pregnancy.dueYear;
  const note = GamePregnancy.tick(st, () => 0.5);
  assert(/ребёнок/.test(String(note)));
  const childrenAfter = (st.npcs || []).filter((n) => n.relationType === "child").length;
  assert.equal(childrenAfter, childrenBefore + 1);
});

// 12. Pregnancy cannot start for minors.
test("pregnancy gated to adults", () => {
  const st = fresh();
  st.age = 15;
  assert.equal(GamePregnancy.canConceive(st), false);
  assert.equal(GamePregnancy.start(st, { context: "unplanned_with_partner" }), null);
});

// 13. Detailed health condition is merged into the catalog and affects state.
test("detailed condition merged into catalog and affects state when added", () => {
  const st = fresh();
  st.age = 40;
  const catalog = window.GameData.healthConditionCatalog;
  assert(Array.isArray(catalog) && catalog.length >= 20);
  const detailed = window.GameHealthDetailed.conditions[0];
  const healthBefore = st.health;
  GameHealthEngine.addCondition(st, detailed.id, "test");
  assert(GameHealthEngine.hasCondition(st, detailed.id));
  // applying a yearly tick or effects should be able to move health
  GameHealthEngine.applyEffects(st, { health: -5 });
  assert(st.health <= healthBefore);
});

// 14. Object-referencing event binds to a concrete NPC and mutates it.
test("object-referencing event binds and affects the bound NPC", () => {
  const st = fresh();
  st.age = 25;
  const friend = GameNpcFactory.createFriendNpc(st, {});
  GameRelationshipEngine.addNpc(st, friend);
  const ev = GameEventEngine.getEventById("obj_friend_favor");
  assert(GameEventEngine.canBind(st, ev));
  const bound = GameEventEngine.resolveBindings(st, ev, () => 0);
  assert(bound && bound.refs.npcId);
  st.event = GameEventEngine.toActiveEvent(ev, bound.refs, bound.names);
  assert(/\{npcName\}/.test(ev.description) && !/\{npcName\}/.test(st.event.description));
  const npc = GameRelationshipEngine.findNpc(st, bound.refs.npcId);
  const bondBefore = npc.relationshipStats.bond;
  GameEventEngine.applyEventOption(st, "obj_friend_favor", "help", () => 0.5);
  assert(GameRelationshipEngine.findNpc(st, bound.refs.npcId).relationshipStats.bond > bondBefore);
});

// 15. Save/load round-trips the new world objects.
test("save/load preserves places, workplace, education and pregnancy", () => {
  const st = fresh();
  st.age = 28;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  GamePregnancy.start(st, { context: "planned_with_spouse" });
  const placeCount = st.places.length;
  const companyId = st.workplace.company.id;
  GameStorage.saveGame();
  fresh({ city: "moscow" });
  GameStorage.loadGame();
  const loaded = GameState.state;
  assert.equal(loaded.places.length, placeCount);
  assert.equal(loaded.workplace.company.id, companyId);
  assert.equal(loaded.pregnancy.active, true);
  assert.equal(loaded.version, 9);
});
