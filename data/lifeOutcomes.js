(() => {
  const deathRiskConfig = {
    ageBands: [
      { min: 0, max: 2, risk: 0.002 },
      { min: 3, max: 17, risk: 0.0008 },
      { min: 18, max: 39, risk: 0.0015 },
      { min: 40, max: 54, risk: 0.004 },
      { min: 55, max: 64, risk: 0.012 },
      { min: 65, max: 74, risk: 0.032 },
      { min: 75, max: 84, risk: 0.075 },
      { min: 85, max: 94, risk: 0.16 },
      { min: 95, max: 120, risk: 0.3 },
    ],
    factors: {
      lowHealth: 0.0036,
      lowMental: 0.002,
      stress: 0.0024,
      danger: 0.018,
      criminalRecord: 0.012,
      extremeAge: 0.018,
    },
    maxRisk: 0.86,
  };

  const lifeTypes = [
    { id: "magnate", name: "Строитель капитала", test: { netWorth: 60000 } },
    { id: "family", name: "Хранитель семьи", test: { children: 2, happiness: 58 } },
    { id: "scholar", name: "Искатель знаний", test: { knowledge: 82, education: "Высшее образование" } },
    { id: "star", name: "Голос эпохи", test: { fame: 70 } },
    { id: "criminal", name: "Темная дорожка", test: { criminalRecord: 4 } },
    { id: "hermit", name: "Тихая комната", test: { socialMax: 24, relationship: false, childrenMax: 0 } },
    { id: "longLived", name: "Долгая дуга", test: { age: 90 } },
    { id: "bankrupt", name: "Жизнь в минусе", test: { netWorthMax: -1500 } },
    { id: "balance", name: "Ровное пламя", test: { fallback: true } },
  ];

  window.GameData = { ...(window.GameData || {}), deathRiskConfig, lifeTypes };
})();
