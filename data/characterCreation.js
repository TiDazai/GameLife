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
    socialClasses,
  };

  window.GameData = { ...(window.GameData || {}), characterCreation, socialClasses };
})();
