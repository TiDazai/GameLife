(() => {
  const { clamp } = window.GameRandom;

  function data() {
    return window.GameData;
  }

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function city(state) {
    return window.GameState?.cityData ? window.GameState.cityData(state) : data().countries[state.country].cities[state.city];
  }

  function housingItem(state) {
    return data().housingCatalog?.[state.housing] || data().housingCatalog?.parents || { annual: 0, buy: 0, quality: 50 };
  }

  function businessValue(state) {
    if (!state.company) return 0;
    return Math.max(0, Math.floor((state.company.cash || 0) + (state.company.level || 0) * 1800 + (state.company.reputation || 0) * 70));
  }

  function loanBalance(state) {
    return (state.economy?.loans || []).reduce((sum, loan) => sum + safeNumber(loan.principal), 0);
  }

  function realEstateValue(state) {
    return (state.economy?.realEstate || []).reduce((sum, item) => sum + safeNumber(item.value), 0);
  }

  function normalizeAssets(raw = {}) {
    return {
      deposits: Math.max(0, safeNumber(raw.deposits)),
      stocks: Math.max(0, safeNumber(raw.stocks)),
      pension: Math.max(0, safeNumber(raw.pension)),
      property: Math.max(0, safeNumber(raw.property)),
      business: Math.max(0, safeNumber(raw.business)),
    };
  }

  function migrateRealEstate(state, original) {
    const existing = Array.isArray(original.economy?.realEstate) ? original.economy.realEstate : [];
    if (existing.length) return existing.map(normalizeRealEstate);
    const list = [];
    const home = data().housingCatalog?.[original.housing];
    if (home?.buy) {
      list.push(normalizeRealEstate({
        id: `home-${original.housing}`,
        type: original.housing === "house" ? "house" : "apartment",
        name: home.name,
        value: Math.floor(home.buy * city(state).cost),
        purchasePrice: Math.floor(home.buy * city(state).cost),
        rented: false,
        primary: true,
        maintenanceDue: 0,
      }));
    } else if (safeNumber(original.assets?.property) > 0) {
      list.push(normalizeRealEstate({
        id: "legacy-property",
        type: "apartment",
        name: "Семейная недвижимость",
        value: safeNumber(original.assets.property),
        purchasePrice: safeNumber(original.assets.property),
        rented: true,
        primary: false,
      }));
    }
    return list;
  }

  function normalizeRealEstate(item = {}) {
    const type = data().realEstateTypes?.[item.type] ? item.type : "apartment";
    const rule = data().realEstateTypes[type];
    return {
      id: item.id || uid("real-estate"),
      type,
      name: item.name || rule.name,
      value: Math.max(0, Math.floor(safeNumber(item.value, rule.baseValue))),
      purchasePrice: Math.max(0, Math.floor(safeNumber(item.purchasePrice, item.value || rule.baseValue))),
      rented: Boolean(item.rented),
      primary: Boolean(item.primary),
      mortgageLoanId: item.mortgageLoanId || null,
      maintenanceDue: Math.max(0, Math.floor(safeNumber(item.maintenanceDue))),
      history: Array.isArray(item.history) ? item.history.slice(-12) : [],
    };
  }

  function normalizeLoan(item = {}) {
    const type = data().loanTypes?.[item.type] ? item.type : "consumer";
    const rule = data().loanTypes[type];
    return {
      id: item.id || uid("loan"),
      type,
      name: item.name || rule.name,
      principal: Math.max(0, Math.floor(safeNumber(item.principal, item.amount))),
      annualRate: Math.max(0, safeNumber(item.annualRate, rule.annualRate)),
      termYears: Math.max(1, Math.floor(safeNumber(item.termYears, rule.termYears))),
      yearsPaid: Math.max(0, Math.floor(safeNumber(item.yearsPaid))),
      overdue: Math.max(0, Math.floor(safeNumber(item.overdue))),
      collateralId: item.collateralId || null,
      history: Array.isArray(item.history) ? item.history.slice(-12) : [],
    };
  }

  function normalizeEconomyState(state, original = state) {
    const economy = original.economy || {};
    const assets = normalizeAssets(economy.assets || original.assets || {});
    const loans = Array.isArray(economy.loans) ? economy.loans.map(normalizeLoan) : [];
    const legacyDebt = Math.max(0, safeNumber(original.debt) - loans.reduce((sum, loan) => sum + loan.principal, 0));
    if (legacyDebt > 0) loans.push(normalizeLoan({ id: "legacy-debt", type: "consumer", principal: legacyDebt, name: "Старый долг" }));
    state.economy = {
      cash: Math.max(0, Math.floor(safeNumber(economy.cash, original.personalMoney))),
      bankBalance: Math.max(0, Math.floor(safeNumber(economy.bankBalance))),
      yearlyIncome: Math.max(0, Math.floor(safeNumber(economy.yearlyIncome))),
      yearlyExpenses: Math.max(0, Math.floor(safeNumber(economy.yearlyExpenses))),
      debt: Math.max(0, Math.floor(safeNumber(economy.debt, original.debt))),
      loans,
      creditScore: clamp(safeNumber(economy.creditScore, original.creditScore || 55), 0, 100),
      taxBase: Math.max(0, Math.floor(safeNumber(economy.taxBase, original.taxableIncome))),
      taxPaid: Math.max(0, Math.floor(safeNumber(economy.taxPaid, original.taxesPaid))),
      taxDebt: Math.max(0, Math.floor(safeNumber(economy.taxDebt, original.taxDebt))),
      netWorth: Math.floor(safeNumber(economy.netWorth)),
      assets,
      realEstate: migrateRealEstate(state, original),
      financialHistory: Array.isArray(economy.financialHistory) ? economy.financialHistory.slice(0, 36) : [],
      lastYearSummary: economy.lastYearSummary || null,
    };
    syncLegacy(state);
    return state.economy;
  }

  function reconcileLegacyCash(state) {
    if (!state.economy) return;
    if (Number.isFinite(state.personalMoney) && state.personalMoney !== state.economy.cash) {
      state.economy.cash = Math.max(0, Math.floor(state.personalMoney));
    }
  }

  function syncLegacy(state) {
    if (!state.economy) normalizeEconomyState(state, state);
    const economy = state.economy;
    economy.assets.property = realEstateValue(state);
    economy.assets.business = businessValue(state);
    economy.debt = loanBalance(state) + safeNumber(economy.taxDebt);
    economy.netWorth = calculateNetWorth(state);
    state.personalMoney = Math.max(0, Math.floor(economy.cash));
    state.assets = { ...state.assets, ...economy.assets };
    state.debt = economy.debt;
    state.creditScore = clamp(economy.creditScore, 0, 100);
    state.taxableIncome = economy.taxBase;
    state.taxesPaid = economy.taxPaid;
    state.taxDebt = economy.taxDebt;
    return economy;
  }

  function calculateNetWorth(state) {
    const economy = state.economy || normalizeEconomyState(state, state);
    const assets = economy.assets || {};
    const liquid =
      safeNumber(economy.cash) +
      safeNumber(economy.bankBalance) +
      safeNumber(assets.deposits) +
      safeNumber(assets.stocks) +
      safeNumber(assets.pension) * (data().assetRules?.pension?.liquidity || 0.65) +
      realEstateValue(state) +
      businessValue(state);
    return Math.floor(liquid - loanBalance(state) - safeNumber(economy.taxDebt));
  }

  function countryTaxRate(state) {
    // Priority: explicit per-country override -> country taxProfile -> safe default.
    const country = data().countries?.[state.country];
    const profileRule = country?.taxProfile ? data().taxProfiles?.[country.taxProfile] : null;
    const rule = data().taxRates?.[state.country] || profileRule || { income: 0.18, penalty: 0.06 };
    return rule.income + (state.documents?.taxId ? 0 : rule.penalty);
  }

  function calculateAnnualExpenses(state) {
    const c = city(state);
    const rules = data().expenseRules;
    const mode = window.GameState?.budgetModeData ? window.GameState.budgetModeData() : data().budgetModes[state.budgetMode] || data().budgetModes.balanced;
    const home = housingItem(state);
    const adult = state.age >= 18 && !state.livingWithParents;
    // World events can inflate/deflate consumer prices (not loans/taxes).
    const priceMod = window.GameWorldEvents?.combinedModifiers?.(state)?.prices || 1;
    const ownedMaintenance = (state.economy?.realEstate || []).filter((item) => item.primary || !item.rented).reduce((sum, item) => {
      const rule = data().realEstateTypes[item.type] || data().realEstateTypes.apartment;
      return sum + Math.floor(item.value * rule.maintenanceRate);
    }, 0);
    const housing = adult ? Math.floor(home.annual * c.cost * priceMod) + ownedMaintenance : Math.floor((window.GameState?.householdCost?.() || 0) * (state.age < 18 ? 1 : rules.familySupportAdultShare));
    const foodHousehold = adult ? Math.floor((rules.foodHousehold + rules.baseLiving * 0.35) * c.cost * mode.cost * priceMod) : 0;
    const children = adult ? Math.floor((state.children?.length || 0) * rules.child * c.cost * priceMod) : 0;
    const partnerFamily = adult ? Math.floor((state.relationship ? rules.partner : 0) * c.cost + (state.livingWithParents ? 120 * c.cost : 0)) : 0;
    const medical = adult ? Math.floor((rules.medicalBase + Math.max(0, 55 - state.health) * 5) * c.cost * priceMod) : 0;
    const transport = adult && window.GameState?.hasPossession?.("car") ? Math.floor(rules.transportCar * c.cost * priceMod) : 0;
    const lifestyle = adult ? Math.floor(Math.max(rules.lifestyleMultiplierFloor, (state.lifestyle || 50) / 70) * 240 * c.cost * mode.cost * priceMod) : 0;
    const insurance = adult ? Math.floor((rules.insurance[state.documents?.insurance] || 0) * c.cost) : 0;
    const loans = estimateLoanPayment(state);
    const taxes = estimateTaxDue(state);
    const total = housing + foodHousehold + children + partnerFamily + medical + transport + lifestyle + insurance + loans + taxes;
    return { housing, foodHousehold, children, partnerFamily, medical, transport, loans, taxes, lifestyle, insurance, total };
  }

  function estimateLoanPayment(state) {
    return (state.economy?.loans || []).reduce((sum, loan) => sum + Math.ceil(loan.principal * loan.annualRate + loan.principal / Math.max(1, loan.termYears - loan.yearsPaid)), 0);
  }

  function estimateTaxDue(state) {
    return Math.floor(safeNumber(state.economy?.taxBase, state.taxableIncome) * countryTaxRate(state));
  }

  function recordIncome(state, source, amount, taxable = true) {
    const value = Math.max(0, Math.floor(safeNumber(amount)));
    if (!state.economy) normalizeEconomyState(state, state);
    reconcileLegacyCash(state);
    state.economy.cash += value;
    state.economy.yearlyIncome += value;
    if (taxable && state.age >= 18) state.economy.taxBase += value;
    addHistory(state, `Доход: ${source} +${fmt(state, value)}.`);
    syncLegacy(state);
    return value;
  }

  function payExpense(state, category, amount, options = {}) {
    const value = Math.max(0, Math.floor(safeNumber(amount)));
    if (!state.economy) normalizeEconomyState(state, state);
    reconcileLegacyCash(state);
    const economy = state.economy;
    economy.yearlyExpenses += value;
    if (economy.cash >= value) {
      economy.cash -= value;
      addHistory(state, `Расход: ${category} -${fmt(state, value)}.`);
      syncLegacy(state);
      return { paid: value, debt: 0 };
    }
    if (options.allowDebt === false) return { paid: 0, debt: value };
    const paid = economy.cash;
    const gap = value - paid;
    economy.cash = 0;
    const loan = takeLoan(state, options.loanType || "consumer", gap, { disburse: false, reason: `Просрочка: ${category}`, skipReconcile: true, force: true });
    if (!loan.ok) {
      economy.taxDebt += gap;
      economy.creditScore = clamp(economy.creditScore - 4, 0, 100);
    }
    addHistory(state, `Расход: ${category} -${fmt(state, value)}, не хватило ${fmt(state, gap)}.`);
    syncLegacy(state);
    return { paid, debt: gap };
  }

  function takeLoan(state, type, amount, options = {}) {
    if (!state.economy) normalizeEconomyState(state, state);
    if (!options.skipReconcile) reconcileLegacyCash(state);
    const rule = data().loanTypes[type];
    const value = Math.max(0, Math.floor(safeNumber(amount)));
    if (!rule || value <= 0) return { ok: false, text: "Кредит недоступен." };
    if ((state.economy.creditScore || 0) < rule.minCreditScore && !options.force) return { ok: false, text: "Кредитный рейтинг слишком низкий." };
    const loan = normalizeLoan({
      id: options.id || uid(type),
      type,
      principal: value,
      annualRate: options.annualRate ?? rule.annualRate,
      termYears: options.termYears ?? rule.termYears,
      collateralId: options.collateralId || null,
      name: options.name || rule.name,
    });
    state.economy.loans.push(loan);
    if (options.disburse !== false) state.economy.cash += value;
    state.economy.creditScore = clamp(state.economy.creditScore + rule.creditImpact, 0, 100);
    addHistory(state, `${rule.name}: +${fmt(state, value)}.`);
    syncLegacy(state);
    return { ok: true, loan };
  }

  function repayLoan(state, loanId, amount) {
    const loan = (state.economy?.loans || []).find((item) => item.id === loanId) || state.economy?.loans?.[0];
    if (!loan) return { ok: false };
    const paid = Math.min(Math.floor(safeNumber(amount)), loan.principal, state.economy.cash);
    if (paid <= 0) return { ok: false };
    state.economy.cash -= paid;
    loan.principal -= paid;
    state.economy.creditScore = clamp(state.economy.creditScore + 2, 0, 100);
    state.economy.loans = state.economy.loans.filter((item) => item.principal > 0);
    addHistory(state, `Погашен кредит: ${fmt(state, paid)}.`);
    syncLegacy(state);
    return { ok: true, paid };
  }

  function accrueLoanInterest(state) {
    let total = 0;
    for (const loan of state.economy?.loans || []) {
      const interest = Math.ceil(loan.principal * loan.annualRate);
      const principalPayment = Math.ceil(loan.principal / Math.max(1, loan.termYears - loan.yearsPaid));
      const due = interest + principalPayment + loan.overdue;
      total += due;
      if (state.economy.cash >= due) {
        state.economy.cash -= due;
        loan.principal = Math.max(0, loan.principal - principalPayment);
        loan.overdue = 0;
        loan.yearsPaid += 1;
        state.economy.creditScore = clamp(state.economy.creditScore + 1, 0, 100);
      } else {
        const paid = state.economy.cash;
        state.economy.cash = 0;
        const missed = due - paid;
        const penalty = Math.ceil(missed * 0.04);
        loan.overdue += missed + penalty;
        loan.principal += interest;
        state.economy.creditScore = clamp(state.economy.creditScore - 7, 0, 100);
      }
    }
    state.economy.loans = (state.economy.loans || []).filter((loan) => loan.principal + loan.overdue > 0);
    syncLegacy(state);
    return total;
  }

  function investAsset(state, assetId, amount) {
    if (!state.economy) normalizeEconomyState(state, state);
    reconcileLegacyCash(state);
    const value = Math.max(0, Math.floor(safeNumber(amount)));
    if (!state.economy.assets[assetId] && state.economy.assets[assetId] !== 0) return { ok: false };
    if (state.economy.cash < value) return { ok: false };
    state.economy.cash -= value;
    state.economy.assets[assetId] += value;
    addHistory(state, `Вложение: ${data().assetRules?.[assetId]?.name || assetId} +${fmt(state, value)}.`);
    syncLegacy(state);
    return { ok: true };
  }

  function withdrawAsset(state, assetId, share = 0.25) {
    if (!state.economy?.assets || state.economy.assets[assetId] <= 0) return { ok: false };
    const amount = Math.floor(state.economy.assets[assetId] * share);
    state.economy.assets[assetId] -= amount;
    state.economy.cash += amount;
    addHistory(state, `Вывод из актива: ${fmt(state, amount)}.`);
    syncLegacy(state);
    return { ok: true, amount };
  }

  function applyAssetReturns(state, rng = Math.random) {
    const assets = state.economy.assets;
    const notes = [];
    if (assets.deposits > 0) {
      const income = Math.floor(assets.deposits * data().assetRules.deposits.annualRate);
      assets.deposits += income;
      state.economy.yearlyIncome += income;
      notes.push(`вклад +${fmt(state, income)}`);
    }
    if (assets.stocks > 0) {
      const rule = data().assetRules.stocks;
      const rate = rule.minReturn + rng() * (rule.maxReturn - rule.minReturn) + (state.skills?.finance || 0) / 900;
      const result = Math.floor(assets.stocks * rate);
      assets.stocks = Math.max(0, assets.stocks + result);
      if (result > 0) state.economy.yearlyIncome += result;
      else state.economy.yearlyExpenses += Math.abs(result);
      notes.push(`акции ${result >= 0 ? "+" : "-"}${fmt(state, Math.abs(result))}`);
    }
    if (assets.pension > 0) {
      const income = Math.floor(assets.pension * data().assetRules.pension.annualRate);
      assets.pension += income;
      state.economy.yearlyIncome += income;
      notes.push(`пенсия +${fmt(state, income)}`);
    }
    const propertyMod = window.GameWorldEvents?.combinedModifiers?.(state)?.property || 1;
    for (const property of state.economy.realEstate) {
      const rule = data().realEstateTypes[property.type] || data().realEstateTypes.apartment;
      const growth = rule.annualGrowthMin + rng() * (rule.annualGrowthMax - rule.annualGrowthMin);
      property.value = Math.max(0, Math.floor(property.value * (1 + growth) * propertyMod));
      if (property.rented) {
        const rent = Math.floor(property.value * rule.rentRate);
        state.economy.cash += rent;
        state.economy.yearlyIncome += rent;
        notes.push(`аренда недвижимости +${fmt(state, rent)}`);
      }
      const maintenance = Math.floor(property.value * rule.maintenanceRate);
      property.maintenanceDue += maintenance;
    }
    return notes;
  }

  function buyRealEstate(state, type, options = {}) {
    if (!state.economy) normalizeEconomyState(state, state);
    reconcileLegacyCash(state);
    const rule = data().realEstateTypes[type];
    if (!rule || state.age < rule.minAge) return { ok: false };
    const price = Math.floor(rule.baseValue * city(state).cost * (0.9 + (city(state).opportunity || 70) / 700));
    const downPayment = options.mortgage ? Math.ceil(price * 0.2) : price;
    if (state.economy.cash < downPayment) return { ok: false, text: "Не хватает первого взноса." };
    state.economy.cash -= downPayment;
    const property = normalizeRealEstate({ type, value: price, purchasePrice: price, primary: Boolean(options.primary), rented: Boolean(options.rented) });
    if (options.mortgage) {
      const loan = takeLoan(state, "mortgage", price - downPayment, { disburse: false, collateralId: property.id });
      if (!loan.ok) {
        state.economy.cash += downPayment;
        return loan;
      }
      property.mortgageLoanId = loan.loan.id;
    }
    state.economy.realEstate.push(property);
    if (options.primary) {
      state.housing = type === "house" ? "house" : "ownedFlat";
      state.livingWithParents = false;
    }
    addHistory(state, `Покупка недвижимости: ${property.name} за ${fmt(state, price)}.`);
    syncLegacy(state);
    return { ok: true, property };
  }

  function sellRealEstate(state, propertyId) {
    const property = (state.economy?.realEstate || []).find((item) => item.id === propertyId);
    if (!property) return { ok: false };
    const salePrice = Math.floor(property.value * 0.96);
    const loan = property.mortgageLoanId ? state.economy.loans.find((item) => item.id === property.mortgageLoanId) : null;
    const payoff = loan ? loan.principal + loan.overdue : 0;
    state.economy.cash += Math.max(0, salePrice - payoff);
    if (loan) state.economy.loans = state.economy.loans.filter((item) => item.id !== loan.id);
    state.economy.realEstate = state.economy.realEstate.filter((item) => item.id !== property.id);
    if (property.primary) {
      state.housing = "room";
      state.livingWithParents = false;
    }
    addHistory(state, `Продажа недвижимости: ${property.name}, чистыми ${fmt(state, Math.max(0, salePrice - payoff))}.`);
    syncLegacy(state);
    return { ok: true, amount: Math.max(0, salePrice - payoff) };
  }

  function setRealEstateRent(state, propertyId, rented) {
    const property = (state.economy?.realEstate || []).find((item) => item.id === propertyId);
    if (!property) return { ok: false };
    property.rented = Boolean(rented);
    if (property.rented) property.primary = false;
    addHistory(state, `${property.name}: ${property.rented ? "сдается в аренду" : "снята с аренды"}.`);
    syncLegacy(state);
    return { ok: true };
  }

  function resolveTaxes(state) {
    if (!state.economy) normalizeEconomyState(state, state);
    reconcileLegacyCash(state);
    const due = estimateTaxDue(state);
    state.economy.taxBase = 0;
    if (due <= 0) return 0;
    if (state.economy.cash >= due) {
      state.economy.cash -= due;
      state.economy.taxPaid += due;
    } else {
      const paid = state.economy.cash;
      state.economy.cash = 0;
      state.economy.taxPaid += paid;
      state.economy.taxDebt += due - paid;
      state.economy.creditScore = clamp(state.economy.creditScore - 2, 0, 100);
    }
    return due;
  }

  function resolveEconomyYear(state, rng = Math.random) {
    if (!state.economy) normalizeEconomyState(state, state);
    state.economy.yearlyIncome = 0;
    state.economy.yearlyExpenses = 0;
    const notes = [];
    const assetsNotes = applyAssetReturns(state, rng);
    notes.push(...assetsNotes);
    const expenses = calculateAnnualExpenses(state);
    payExpense(state, "годовые расходы", expenses.total - expenses.loans - expenses.taxes, { loanType: "consumer" });
    const loanPaid = accrueLoanInterest(state);
    const taxPaid = resolveTaxes(state);
    if (loanPaid > 0) notes.push(`кредиты ${fmt(state, loanPaid)}`);
    if (taxPaid > 0) notes.push(`налоги ${fmt(state, taxPaid)}`);
    for (const property of state.economy.realEstate) {
      if (property.maintenanceDue > 0) {
        payExpense(state, `содержание ${property.name}`, property.maintenanceDue, { loanType: "consumer" });
        property.maintenanceDue = 0;
      }
    }
    state.economy.lastYearSummary = {
      age: state.age,
      year: state.year,
      income: state.economy.yearlyIncome,
      expenses: state.economy.yearlyExpenses,
      netWorth: calculateNetWorth(state),
      expenseBreakdown: expenses,
      notes,
    };
    addHistory(state, `Годовая сводка: доход ${fmt(state, state.economy.yearlyIncome)}, расходы ${fmt(state, state.economy.yearlyExpenses)}, капитал ${fmt(state, state.economy.lastYearSummary.netWorth)}.`);
    syncLegacy(state);
    return state.economy.lastYearSummary;
  }

  function addHistory(state, text) {
    if (!state.economy) return;
    state.economy.financialHistory.unshift(`${state.age ?? 0} лет: ${text}`);
    state.economy.financialHistory = state.economy.financialHistory.slice(0, 36);
  }

  function fmt(state, value) {
    return window.GameState?.fmt ? window.GameState.fmt(value) : `${Math.floor(value)}`;
  }

  window.GameEconomyEngine = {
    normalizeEconomyState,
    syncLegacy,
    calculateNetWorth,
    calculateAnnualExpenses,
    countryTaxRate,
    estimateTaxDue,
    recordIncome,
    payExpense,
    takeLoan,
    repayLoan,
    accrueLoanInterest,
    investAsset,
    withdrawAsset,
    applyAssetReturns,
    buyRealEstate,
    sellRealEstate,
    setRealEstateRent,
    resolveTaxes,
    resolveEconomyYear,
    reconcileLegacyCash,
    loanBalance,
    realEstateValue,
    businessValue,
  };
})();
