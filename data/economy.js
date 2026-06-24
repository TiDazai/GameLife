(() => {
  const taxRates = {
    ru: { income: 0.13, penalty: 0.06 },
    de: { income: 0.24, penalty: 0.05 },
    jp: { income: 0.19, penalty: 0.05 },
    us: { income: 0.22, penalty: 0.07 },
    se: { income: 0.27, penalty: 0.04 },
  };

  const loanTypes = {
    consumer: { name: "Потребительский кредит", annualRate: 0.18, termYears: 4, minCreditScore: 25, creditImpact: -4 },
    education: { name: "Образовательный кредит", annualRate: 0.08, termYears: 8, minCreditScore: 20, creditImpact: -2 },
    mortgage: { name: "Ипотека", annualRate: 0.105, termYears: 15, minCreditScore: 45, creditImpact: -6 },
    business: { name: "Бизнес-кредит", annualRate: 0.14, termYears: 6, minCreditScore: 35, creditImpact: -5 },
  };

  const assetRules = {
    deposits: { name: "Вклад", annualRate: 0.045, risk: 0 },
    stocks: { name: "Акции", minReturn: -0.12, maxReturn: 0.16, skillBonus: "finance" },
    pension: { name: "Пенсионный капитал", annualRate: 0.035, liquidity: 0.65 },
    property: { name: "Недвижимость", annualGrowthMin: -0.04, annualGrowthMax: 0.08 },
    business: { name: "Бизнес-активы" },
  };

  const realEstateTypes = {
    studio: { name: "Студия", baseValue: 14500, maintenanceRate: 0.025, rentRate: 0.075, minAge: 22 },
    apartment: { name: "Квартира", baseValue: 23000, maintenanceRate: 0.03, rentRate: 0.068, minAge: 24 },
    house: { name: "Дом", baseValue: 36000, maintenanceRate: 0.038, rentRate: 0.055, minAge: 28 },
  };

  const expenseRules = {
    baseLiving: 420,
    foodHousehold: 340,
    child: 250,
    partner: 140,
    familySupportAdultShare: 0.35,
    medicalBase: 120,
    transportCar: 520,
    insurance: { none: 0, basic: 360, premium: 900, family: 0 },
    lifestyleMultiplierFloor: 0.7,
  };

  window.GameData = { ...(window.GameData || {}), taxRates, loanTypes, assetRules, realEstateTypes, expenseRules };
})();
