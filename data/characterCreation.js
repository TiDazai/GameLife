(() => {
  const socialClasses = {
    poor: {
      name: "Бедная",
      familyMoney: 650,
      moneyMultiplier: 0.55,
      parentBondBonus: -6,
      parentHealthBonus: -4,
      happiness: -8,
      stress: 13,
      districtQuality: 36,
      educationAccess: 42,
      parentJobs: ["кассир", "грузчик", "уборщик", "курьер", "вахтер", "помощник на кухне"],
      text: "Денег мало, зато ранняя устойчивость может стать сильной стороной.",
    },
    regular: {
      name: "Обычная",
      familyMoney: 1200,
      moneyMultiplier: 1,
      parentBondBonus: 0,
      parentHealthBonus: 0,
      happiness: 0,
      stress: 0,
      districtQuality: 58,
      educationAccess: 62,
      parentJobs: ["учитель", "водитель", "медсестра", "повар", "мастер", "бухгалтер", "менеджер"],
      text: "Семья держится на стабильности, привычном труде и умеренных возможностях.",
    },
    comfortable: {
      name: "Обеспеченная",
      familyMoney: 2600,
      moneyMultiplier: 1.55,
      parentBondBonus: 4,
      parentHealthBonus: 3,
      happiness: 6,
      stress: -5,
      districtQuality: 76,
      educationAccess: 78,
      parentJobs: ["инженер", "врач", "аналитик", "предприниматель", "архитектор", "руководитель отдела"],
      text: "Есть запас денег, спокойнее быт и больше образовательных вариантов.",
    },
    wealthy: {
      name: "Богатая",
      familyMoney: 6200,
      moneyMultiplier: 2.45,
      parentBondBonus: 2,
      parentHealthBonus: 5,
      happiness: 10,
      stress: -8,
      districtQuality: 92,
      educationAccess: 92,
      parentJobs: ["владелец компании", "топ-менеджер", "инвестор", "партнер фирмы", "главный врач", "IT-директор"],
      text: "Сильный старт дает доступ к лучшей среде, но не гарантирует хороший выбор.",
    },
  };

  const talents = [
    { id: "quick_learner", name: "Способный ученик", effects: { knowledge: 6 }, skills: { logic: 6 } },
    { id: "athletic", name: "Спортивный", effects: { health: 8, energy: 6 }, skills: { fitness: 8 } },
    { id: "charming", name: "Обаятельный", effects: { social: 8, looks: 6 }, skills: { empathy: 6 } },
    { id: "creative_mind", name: "Творческая натура", effects: { happiness: 4 }, skills: { creativity: 10 } },
    { id: "natural_leader", name: "Прирождённый лидер", effects: { reputation: 5 }, skills: { leadership: 8 } },
    { id: "money_sense", name: "Финансовое чутьё", skills: { finance: 10 } },
    { id: "resilient", name: "Стрессоустойчивый", effects: { mental: 8, stress: -6 } },
    { id: "handy", name: "Мастеровитый", skills: { craft: 10 } },
    { id: "polyglot", name: "Лингвист", skills: { language: 10 } },
    { id: "lucky", name: "Везунчик", effects: { karma: 6 } },
  ];

  const weaknesses = [
    { id: "frail", name: "Слабое здоровье", effects: { health: -8, immunity: -6 } },
    { id: "anxious", name: "Тревожность", effects: { mental: -8, stress: 8 } },
    { id: "shy", name: "Застенчивость", effects: { social: -8 } },
    { id: "impulsive", name: "Импульсивность", effects: { discipline: -8 } },
    { id: "spendthrift", name: "Транжира", skills: { finance: -6 } },
    { id: "lazy", name: "Лень", effects: { energy: -6, discipline: -6 } },
    { id: "hot_temper", name: "Вспыльчивость", effects: { reputation: -4, karma: -4 } },
    { id: "sickly_sleep", name: "Плохой сон", effects: { energy: -6 } },
  ];

  const personalityTraits = [
    { id: "introvert", name: "Интроверт" },
    { id: "extrovert", name: "Экстраверт" },
    { id: "optimist", name: "Оптимист" },
    { id: "pessimist", name: "Пессимист" },
    { id: "perfectionist", name: "Перфекционист" },
    { id: "free_spirit", name: "Свободолюбивый" },
    { id: "pragmatic", name: "Прагматик" },
    { id: "romantic", name: "Романтик" },
  ];

  // Hidden modifiers are rolled at birth and quietly shape outcomes/odds.
  const hiddenModifierPool = [
    { id: "metabolism", min: 80, max: 120 },
    { id: "luckFactor", min: 85, max: 115 },
    { id: "learningSpeed", min: 80, max: 125 },
    { id: "socialEase", min: 80, max: 120 },
    { id: "stressTolerance", min: 80, max: 125 },
    { id: "riskAffinity", min: 75, max: 125 },
    { id: "immuneStrength", min: 80, max: 120 },
    { id: "ambitionDrive", min: 80, max: 125 },
  ];

  const characterCreation = {
    defaultSocialClass: "regular",
    genders: {
      male: "Мужской",
      female: "Женский",
    },
    traitRanges: {
      curiosity: { name: "Любознательность", min: 20, max: 90, randomMin: 35, randomMax: 80 },
      risk: { name: "Риск", min: 10, max: 90, randomMin: 25, randomMax: 80 },
      kindness: { name: "Доброта", min: 20, max: 90, randomMin: 35, randomMax: 80 },
      ambition: { name: "Амбиции", min: 10, max: 90, randomMin: 25, randomMax: 80 },
    },
    talents,
    weaknesses,
    personalityTraits,
    hiddenModifierPool,
    socialClasses,
  };

  window.GameData = { ...(window.GameData || {}), characterCreation, socialClasses };
})();
