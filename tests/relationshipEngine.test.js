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
  "data/careers/positions.js",
  "data/careers/careerTracks.js",
  "data/careers/companies.js",
  "data/careers/workplaces.js",
  "data/nightlife.js",
  "data/adultWork.js",
  "data/relationshipActions.js",
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
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Игров", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
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

test("npcFactory creates full NPC objects", () => {
  const npc = GameNpcFactory.createNpc({ name: "Анна", gender: "female", relationType: "friend" });
  ["id", "name", "lastName", "gender", "age", "role", "alive", "health", "mental", "money", "occupation", "personality", "bond", "trust", "conflict", "romance", "respect", "relationType", "tags", "history"].forEach((key) => {
    assert(key in npc, key);
  });
  assert.equal(npc.relationType, "friend");
});

test("normalizeState migrates legacy family, partner and children to NPCs", () => {
  const legacy = {
    version: 2,
    age: 30,
    firstName: "Иван",
    lastName: "Тестов",
    gender: "male",
    country: "ru",
    city: "kazan",
    family: [
      { id: "player", name: "Иван", role: "Главный герой", gender: "male", age: 30, alive: true, job: "работает", bond: 100, health: 80 },
      { id: "mother", name: "Мария", role: "Мама", gender: "female", age: 55, alive: true, job: "учитель", bond: 70, health: 70 },
    ],
    relationship: { name: "Анна", gender: "female", age: 29, bond: 75, trust: 70, romance: 65, conflict: 5, married: true },
    children: [{ id: "child-1", name: "Лена", gender: "female", age: 2, bond: 80, health: 82 }],
  };
  const migrated = GameState.normalizeState(legacy);
  assert.equal(migrated.version, 9);
  assert(migrated.npcs.some((npc) => npc.relationType === "parent"));
  assert(migrated.npcs.some((npc) => npc.relationType === "spouse"));
  assert(migrated.npcs.some((npc) => npc.relationType === "child"));
  assert.equal(migrated.relationship.married, true);
  assert.equal(migrated.children.length, 1);
});

test("relationship actions create partner, improve trust and marry", () => {
  const st = fresh();
  st.age = 22;
  st.actions = 5;
  st.personalMoney = 5000;
  GameRelationshipActions.applyRelationshipAction(st, "start_relationship", null, () => 0.2);
  const partner = GameRelationshipEngine.activePartner(st);
  assert(partner);
  partner.bond = 80;
  partner.trust = 70;
  GameRelationshipActions.applyRelationshipAction(st, "talk", partner.id);
  assert(GameRelationshipEngine.findNpc(st, partner.id).trust > 70);
  GameRelationshipActions.applyRelationshipAction(st, "marriage", partner.id);
  assert.equal(GameRelationshipEngine.spouse(st).id, partner.id);
  assert.equal(st.relationship.married, true);
});

test("divorce moves spouse to ex_partner", () => {
  const st = fresh();
  st.age = 28;
  st.actions = 5;
  st.personalMoney = 5000;
  const partner = GameRelationshipEngine.startRelationship(st, { name: "Вера", gender: "female", bond: 90, trust: 90 });
  GameRelationshipEngine.marryNpc(st, partner.id);
  GameRelationshipActions.applyRelationshipAction(st, "divorce", partner.id);
  assert.equal(GameRelationshipEngine.findNpc(st, partner.id).relationType, "ex_partner");
  assert.equal(st.relationship, null);
});

test("child action adds child NPC and legacy child projection", () => {
  const st = fresh();
  st.age = 31;
  st.actions = 5;
  st.personalMoney = 5000;
  const partner = GameRelationshipEngine.startRelationship(st, { name: "Павел", gender: "male", bond: 90, trust: 90 });
  GameRelationshipEngine.marryNpc(st, partner.id);
  GameRelationshipActions.applyRelationshipAction(st, "have_child", partner.id, () => 0.1);
  assert.equal(GameRelationshipEngine.children(st).length, 1);
  assert.equal(st.children.length, 1);
  assert.equal(st.children[0].age, 0);
});

test("maybeNpcDeath marks NPC dead and sync keeps record", () => {
  const st = fresh();
  const parent = GameRelationshipEngine.parents(st)[0];
  parent.age = 102;
  parent.health = 1;
  const died = GameRelationshipEngine.maybeNpcDeath(st, parent, () => 0);
  GameRelationshipEngine.syncLegacy(st);
  assert.equal(died, true);
  assert.equal(GameRelationshipEngine.findNpc(st, parent.id).alive, false);
  assert(st.family.find((member) => member.id === parent.id && member.alive === false));
});

test("yearlyRelationships ages NPCs and affects state", () => {
  const st = fresh();
  const parent = GameRelationshipEngine.parents(st)[0];
  const beforeAge = parent.age;
  const beforeStress = st.stress;
  parent.bond = 10;
  parent.conflict = 90;
  GameRelationshipEngine.yearlyRelationships(st, () => 0.9);
  assert.equal(GameRelationshipEngine.findNpc(st, parent.id).age, beforeAge + 1);
  assert(st.stress >= beforeStress);
});
