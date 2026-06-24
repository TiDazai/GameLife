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
  "state.js",
  "engine/relationshipEngine.js",
  "engine/relationshipActions.js",
].forEach((file) => vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file }));

GameState.setRenderCallback(() => {});

function fresh(options = {}) {
  GameState.setState(GameState.createNewLife({ firstName: "Тест", lastName: "Финансов", country: "ru", city: "kazan", gender: "male", socialClass: "regular", ...options }));
  return GameState.state;
}

function adult() {
  const st = fresh();
  st.age = 30;
  st.actions = 5;
  st.livingWithParents = false;
  st.housing = "room";
  st.economy.cash = 10000;
  GameEconomyEngine.syncLegacy(st);
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

test("netWorth includes cash, assets, real estate, business and loans", () => {
  const st = adult();
  st.economy.assets.deposits = 1000;
  st.economy.assets.stocks = 2000;
  st.economy.assets.pension = 3000;
  st.economy.realEstate.push({ id: "flat", type: "apartment", name: "Квартира", value: 20000, purchasePrice: 18000, rented: false, primary: false, mortgageLoanId: null, maintenanceDue: 0, history: [] });
  st.company = { cash: 5000, level: 2, reputation: 10 };
  GameEconomyEngine.takeLoan(st, "consumer", 4000, { disburse: false, force: true });
  const total = GameEconomyEngine.calculateNetWorth(st);
  assert(total > 30000);
  assert(total < 42000);
});

test("annual expenses include expected categories", () => {
  const st = adult();
  st.children = [{ id: "child", name: "Лена", age: 3 }];
  st.relationship = { married: true, bond: 70, trust: 70 };
  st.possessions.push("car");
  st.documents.insurance = "premium";
  GameEconomyEngine.takeLoan(st, "consumer", 1200, { disburse: false, force: true });
  const expenses = GameEconomyEngine.calculateAnnualExpenses(st);
  ["housing", "foodHousehold", "children", "partnerFamily", "medical", "transport", "loans", "taxes", "lifestyle", "insurance"].forEach((key) => {
    assert(key in expenses);
  });
  assert(expenses.total > expenses.housing);
});

test("loan creation changes cash, debt and credit score", () => {
  const st = adult();
  const beforeCash = st.economy.cash;
  const beforeScore = st.creditScore;
  const result = GameEconomyEngine.takeLoan(st, "consumer", 1500);
  assert.equal(result.ok, true);
  assert.equal(st.economy.cash, beforeCash + 1500);
  assert(st.debt >= 1500);
  assert(st.creditScore < beforeScore);
});

test("loan interest and overdue affect credit score", () => {
  const st = adult();
  st.economy.cash = 10;
  st.personalMoney = 10;
  GameEconomyEngine.takeLoan(st, "consumer", 2000, { disburse: false, force: true });
  const beforeScore = st.creditScore;
  GameEconomyEngine.accrueLoanInterest(st);
  assert(st.economy.loans[0].overdue > 0);
  assert(st.creditScore < beforeScore);
});

test("tax calculation pays or creates tax debt", () => {
  const st = adult();
  st.economy.cash = 100;
  st.personalMoney = 100;
  st.economy.taxBase = 5000;
  const due = GameEconomyEngine.resolveTaxes(st);
  GameEconomyEngine.syncLegacy(st);
  assert(due > 100);
  assert(st.taxDebt > 0);
});

test("country tax rate resolves from taxProfile with legacy override and fallback", () => {
  const rate = (country) => GameEconomyEngine.countryTaxRate({ country, documents: { taxId: true } });
  assert.equal(rate("fr"), GameData.taxProfiles.high.income); // taxProfile high, no legacy override
  assert.equal(rate("br"), GameData.taxProfiles.high.income);
  assert.equal(rate("in"), GameData.taxProfiles.medium.income); // medium
  assert.equal(rate("ae"), GameData.taxProfiles.no_income_tax.income); // 0, tax-free
  assert.equal(rate("de"), GameData.taxRates.de.income); // legacy per-country override wins
  assert.equal(rate("unknown_country"), 0.18); // safe default
  // missing tax id adds the penalty surcharge
  const withoutId = GameEconomyEngine.countryTaxRate({ country: "fr", documents: {} });
  assert.equal(withoutId, GameData.taxProfiles.high.income + GameData.taxProfiles.high.penalty);
});

test("stocks return is deterministic with fixed rng", () => {
  const st = adult();
  st.economy.assets.stocks = 1000;
  st.skills.finance = 0;
  GameEconomyEngine.applyAssetReturns(st, () => 0.5);
  assert.equal(st.economy.assets.stocks, 1020);
});

test("real estate can be bought, rented and sold", () => {
  const st = adult();
  st.economy.cash = 50000;
  GameEconomyEngine.syncLegacy(st);
  const buy = GameEconomyEngine.buyRealEstate(st, "studio", { primary: false });
  assert.equal(buy.ok, true);
  assert.equal(st.economy.realEstate.length, 1);
  assert.equal(GameEconomyEngine.setRealEstateRent(st, buy.property.id, true).ok, true);
  assert.equal(st.economy.realEstate[0].rented, true);
  const sale = GameEconomyEngine.sellRealEstate(st, buy.property.id);
  assert.equal(sale.ok, true);
  assert.equal(st.economy.realEstate.length, 0);
});

test("normalizeState migrates legacy money fields", () => {
  const migrated = GameState.normalizeState({
    version: 4,
    age: 35,
    country: "ru",
    city: "kazan",
    firstName: "Иван",
    lastName: "Сейвов",
    gender: "male",
    personalMoney: 700,
    debt: 300,
    taxableIncome: 1000,
    taxesPaid: 200,
    taxDebt: 50,
    assets: { deposits: 100, stocks: 200, pension: 300, property: 400 },
  });
  assert.equal(migrated.version, 9);
  assert.equal(migrated.economy.cash, 700);
  assert(migrated.economy.loans.some((loan) => loan.principal === 300));
  assert.equal(migrated.economy.taxBase, 1000);
  assert.equal(migrated.economy.taxPaid, 200);
  assert.equal(migrated.economy.taxDebt, 50);
});
