(() => {
  // World/era events that affect everyone for several years. yearlyEffects are applied
  // to the player each year while active; modifiers describe macro effects shown in UI.
  const worldEvents = [
    {
      id: "economic_boom",
      title: "Экономический подъём",
      description: "Экономика растёт, зарплаты и возможности увеличиваются.",
      scope: "global",
      minDuration: 2, maxDuration: 5, weight: 3,
      modifiers: { salary: 1.12, prices: 1.04, opportunity: 1.1 },
      yearlyEffects: { reputation: 1, lifestyle: 1 },
      tags: ["economy", "positive"],
    },
    {
      id: "recession",
      title: "Экономический кризис",
      description: "Спад в экономике: растёт безработица, падают доходы.",
      scope: "global",
      minDuration: 2, maxDuration: 4, weight: 3,
      modifiers: { salary: 0.88, prices: 1.1, opportunity: 0.85 },
      yearlyEffects: { stress: 3, creditScore: -1 },
      tags: ["economy", "negative"],
    },
    {
      id: "tech_revolution",
      title: "Технологическая революция",
      description: "Новые технологии меняют рынок труда.",
      scope: "global",
      minDuration: 3, maxDuration: 6, weight: 2,
      modifiers: { salary: 1.08, opportunity: 1.15 },
      yearlyEffects: { knowledge: 1, network: 1 },
      tags: ["tech", "career"],
    },
    {
      id: "pandemic",
      title: "Пандемия",
      description: "Глобальная эпидемия меняет привычный уклад жизни.",
      scope: "global",
      minDuration: 1, maxDuration: 3, weight: 2,
      modifiers: { prices: 1.08, opportunity: 0.8 },
      yearlyEffects: { health: -2, mental: -2, social: -2, immunity: -3 },
      tags: ["health", "crisis"],
    },
    {
      id: "inflation_wave",
      title: "Высокая инфляция",
      description: "Цены растут быстрее доходов.",
      scope: "global",
      minDuration: 1, maxDuration: 3, weight: 3,
      modifiers: { prices: 1.18, salary: 1.03 },
      yearlyEffects: { stress: 2 },
      tags: ["economy", "money"],
    },
    {
      id: "cultural_renaissance",
      title: "Культурный расцвет",
      description: "Эпоха творчества и новых идей.",
      scope: "global",
      minDuration: 2, maxDuration: 5, weight: 2,
      modifiers: { opportunity: 1.05 },
      yearlyEffects: { happiness: 2, lifestyle: 1 },
      tags: ["culture", "positive"],
    },
    {
      id: "housing_bubble",
      title: "Бум недвижимости",
      description: "Цены на жильё стремительно растут.",
      scope: "global",
      minDuration: 2, maxDuration: 4, weight: 2,
      modifiers: { prices: 1.12, property: 1.2 },
      yearlyEffects: {},
      tags: ["economy", "housing"],
    },
    {
      id: "social_reform",
      title: "Социальные реформы",
      description: "Государство усиливает социальную поддержку.",
      scope: "global",
      minDuration: 2, maxDuration: 5, weight: 2,
      modifiers: { prices: 1.02 },
      yearlyEffects: { publicTrust: 2, mental: 1 },
      tags: ["society", "positive"],
    },
  ];

  window.GameData = window.GameData || {};
  window.GameData.worldEvents = worldEvents;
})();
