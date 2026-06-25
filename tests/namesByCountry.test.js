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
  "data/legal.js",
  "data/relationshipActions.js",
  "engine/npcFactory.js",
  "engine/careerEngine.js",
  "engine/economyEngine.js",
  "engine/healthEngine.js",
  "engine/legalEngine.js",
  "engine/lifeSummaryEngine.js",
  "data/lifeGoals.js",
  "engine/careerActions.js",
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
  "engine/socialWorldEngine.js",
].forEach((file) => {
  if (fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
});

GameState.setRenderCallback(() => {});

function test(name, run) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("GameNames exposes helpers and culture pools", () => {
  assert(window.GameNames, "GameNames missing");
  ["firstName", "lastName", "placeholderFor", "poolFor"].forEach((fn) => {
    assert.strictEqual(typeof window.GameNames[fn], "function", `missing ${fn}`);
  });
  assert(window.GameNames.pools.jp && window.GameNames.pools.us && window.GameNames.pools.ru);
});

test("Japan produces Japanese names from the Japanese pool", () => {
  const jp = window.GameNames.pools.jp;
  for (let i = 0; i < 30; i += 1) {
    const first = window.GameNames.firstName("jp", i % 2 ? "female" : "male");
    const last = window.GameNames.lastName("jp");
    assert(jp.male.includes(first) || jp.female.includes(first), `unexpected jp first: ${first}`);
    assert(jp.last.includes(last), `unexpected jp last: ${last}`);
  }
});

test("US produces English names from the US pool", () => {
  const us = window.GameNames.pools.us;
  for (let i = 0; i < 30; i += 1) {
    const last = window.GameNames.lastName("us");
    assert(us.last.includes(last), `unexpected us last: ${last}`);
  }
});

test("Chile falls back to a Latin American pool, never Russian surnames", () => {
  const ru = window.GameNames.pools.ru;
  // Chile has its own explicit pool; confirm it is not the Russian one.
  for (let i = 0; i < 40; i += 1) {
    const last = window.GameNames.lastName("cl");
    assert(!ru.last.includes(last), `Chilean surname leaked from Russian pool: ${last}`);
  }
});

test("unknown country falls back via region, otherwise international", () => {
  // A made-up country id with no meta resolves to the international pool.
  const pool = window.GameNames.poolFor("zz_nowhere");
  assert.strictEqual(pool, window.GameNames.international);
  const last = window.GameNames.lastName("zz_nowhere");
  assert(window.GameNames.international.last.includes(last));
});

test("createNewLife(country=jp) gives the player a Japanese name", () => {
  const jp = window.GameNames.pools.jp;
  for (let i = 0; i < 12; i += 1) {
    const st = GameState.createNewLife({ country: "jp" });
    assert.strictEqual(st.country, "jp");
    assert(
      jp.male.includes(st.firstName) || jp.female.includes(st.firstName),
      `player first not Japanese: ${st.firstName}`
    );
    assert(jp.last.includes(st.lastName), `player last not Japanese: ${st.lastName}`);
  }
});

test("createNewLife(country=us) gives the player a US name", () => {
  const us = window.GameNames.pools.us;
  for (let i = 0; i < 12; i += 1) {
    const st = GameState.createNewLife({ country: "us" });
    assert.strictEqual(st.country, "us");
    assert(us.last.includes(st.lastName), `player last not US: ${st.lastName}`);
  }
});

test("NPC family uses the same country pool as the player", () => {
  const jp = window.GameNames.pools.jp;
  const st = GameState.createNewLife({ country: "jp" });
  const relatives = st.family.filter((m) => m.id !== "player");
  relatives.forEach((member) => {
    assert(
      jp.male.includes(member.name) || jp.female.includes(member.name),
      `family member not Japanese: ${member.name}`
    );
  });
});

test("placeholderFor returns a friendly localized sample", () => {
  assert.strictEqual(window.GameNames.placeholderFor("ru"), "Анна Соколова");
  assert.strictEqual(window.GameNames.placeholderFor("us"), "Emily Carter");
  assert.strictEqual(window.GameNames.placeholderFor("jp"), "Haruka Sato");
  assert.strictEqual(window.GameNames.placeholderFor("de"), "Lukas Schneider");
});
