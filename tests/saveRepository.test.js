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

function reset() {
  store.clear();
}

function newLife(options = {}) {
  return GameState.createNewLife({ firstName: "Тест", lastName: "Игров", country: "ru", city: "kazan", ...options });
}

function test(name, run) {
  try {
    reset();
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

// 1. Creating a new life produces an autosave immediately.
test("new life creates an autosave that is discoverable", () => {
  assert.equal(GameStorage.hasAnySave(), false);
  GameStorage.startGame({ firstName: "Аня", lastName: "Орлова", country: "ru", city: "kazan" });
  assert.equal(GameStorage.hasAnySave(), true);
  const current = GameStorage.getCurrentSave();
  assert(current && current.state);
  assert.equal(current.state.firstName, "Аня");
});

// 2. After a "reload" the same character returns via loadCurrentGame.
test("loadCurrentGame restores the same character after a reload", () => {
  GameStorage.startGame({ firstName: "Борис", lastName: "Ким", country: "ru", city: "kazan" });
  GameState.state.age = 41;
  GameStorage.saveCurrentGame(GameState.state);
  // simulate a page reload: throw away the in-memory life
  GameState.setState(newLife({ firstName: "Чужой", lastName: "Левый" }));
  const loaded = GameStorage.loadCurrentGame();
  assert(loaded);
  assert.equal(GameState.state.firstName, "Борис");
  assert.equal(GameState.state.age, 41);
});

// 3. Save/load preserves the deepened world model.
test("save/load preserves age, country, city, npcs, places, workplace, education, pregnancy", () => {
  GameStorage.startGame({ firstName: "Вера", lastName: "Дуб", country: "ru", city: "kazan" });
  const st = GameState.state;
  st.age = 28;
  GameWorkplace.onHire(st, { id: "dev", title: "Разработчик", field: "tech", industry: "tech" });
  const specs = GameEducationPath.listSpecialties("university");
  GameEducationPath.enroll(st, { institutionType: "university", specialtyId: specs[0].id });
  GamePregnancy.start(st, { context: "planned_with_spouse" });
  const friend = GameNpcFactory.createFriendNpc(st, {});
  GameRelationshipEngine.addNpc(st, friend);

  const placeCount = st.places.length;
  const npcCount = st.npcs.length;
  const companyId = st.workplace.company.id;
  const institutionId = st.educationPath.institutionId;

  GameStorage.saveCurrentGame(st);
  GameState.setState(newLife({ firstName: "Сброс", lastName: "Сброс", city: "moscow" }));
  GameStorage.loadCurrentGame();
  const loaded = GameState.state;

  assert.equal(loaded.age, 28);
  assert.equal(loaded.country, "ru");
  assert.equal(loaded.city, "kazan");
  assert.equal(loaded.places.length, placeCount);
  assert.equal(loaded.npcs.length, npcCount);
  assert.equal(loaded.workplace.company.id, companyId);
  assert.equal(loaded.educationPath.institutionId, institutionId);
  assert.equal(loaded.pregnancy.active, true);
});

// 4. A previously saved slot is not lost when a new life is started.
test("starting a new life does not destroy an explicitly saved slot", () => {
  GameStorage.startGame({ firstName: "Глеб", lastName: "Старый", country: "ru", city: "kazan" });
  const slot = GameStorage.createNewSaveSlot("Глеб — слот", GameState.state);
  assert(slot && slot.id);

  // a brand new life replaces the live autosave...
  GameStorage.startGame({ firstName: "Новый", lastName: "Жилец", country: "ru", city: "kazan" });
  // ...but the named slot still loads the original character
  const loaded = GameStorage.loadSaveSlot(slot.id);
  assert(loaded);
  assert.equal(GameState.state.firstName, "Глеб");
});

// 5. Life goals are no longer auto-assigned on birth.
test("createNewLife does not auto-assign a life goal", () => {
  const st = newLife({ lifeGoal: "wealth" });
  assert.equal(st.lifeGoal, null);
});
