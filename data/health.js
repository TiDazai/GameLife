(() => {
  const healthConditionCatalog = [
    condition("common_cold", "Простуда", 1, 0, { maxImmunity: 55, minStress: 20 }, { health: -2, energy: -4, stress: 1 }, 0.0001, 1.0, ["infection"], [
      treatment("rest", "Отдых и теплый режим", 80, { health: 3, energy: 5, immunity: 2 }, 0.7),
      treatment("clinic", "Врач и лекарства", 220, { health: 6, energy: 4, stress: -1 }, 0.9),
    ]),
    condition("leg_injury", "Травма ноги", 2, 6, { minRisk: 45, minFitness: 10 }, { health: -3, energy: -5, fitness: -2, stress: 2 }, 0.0004, 1.25, ["injury"], [
      treatment("trauma_care", "Травмпункт", 420, { health: 5, energy: 3 }, 0.75),
      treatment("rehab", "Реабилитация", 650, { health: 4, fitness: 5, stress: -2 }, 0.85),
    ], "injury"),
    condition("back_pain", "Боль в спине", 2, 16, { minStress: 35, maxFitness: 45 }, { health: -2, energy: -3, stress: 2 }, 0.0003, 1.15, ["pain"], [
      treatment("physio", "Физиотерапия", 480, { health: 4, fitness: 3, stress: -2 }, 0.75),
      treatment("movement", "Мягкая гимнастика", 120, { fitness: 4, energy: 2 }, 0.45),
    ]),
    condition("anxiety_period", "Тревожный период", 2, 12, { minStress: 45, maxMental: 65 }, { mental: -4, stress: 5, energy: -2, social: -1 }, 0.0002, 1.1, ["mental", "stress"], [
      treatment("talk_support", "Разговор с близким", 0, { mental: 4, stress: -4, social: 1 }, 0.45),
      treatment("therapy", "Психолог", 520, { mental: 8, stress: -8 }, 0.8),
    ]),
    condition("burnout", "Выгорание", 3, 16, { minStress: 65, maxEnergy: 45 }, { mental: -5, stress: 6, energy: -6, reputation: -1 }, 0.0006, 1.25, ["mental", "career"], [
      treatment("career_pause", "Снизить нагрузку", 0, { mental: 5, stress: -10, energy: 5, careerBurnout: -12 }, 0.55),
      treatment("therapy_plan", "Психолог и план восстановления", 760, { mental: 10, stress: -12, energy: 4 }, 0.85),
    ], "chronic"),
    condition("insomnia", "Бессонница", 2, 10, { minStress: 50, maxSleep: 55 }, { sleep: -7, energy: -5, mental: -3, stress: 3 }, 0.0002, 1.1, ["sleep"], [
      treatment("sleep_hygiene", "Режим сна", 80, { sleep: 10, energy: 4, stress: -3 }, 0.55),
      treatment("sleep_specialist", "Консультация по сну", 500, { sleep: 14, mental: 4, stress: -5 }, 0.8),
    ]),
    condition("chronic_fatigue", "Хроническая усталость", 3, 16, { maxEnergy: 35, maxSleep: 55 }, { health: -3, mental: -3, energy: -6, stress: 2 }, 0.0005, 1.3, ["fatigue"], [
      treatment("full_checkup", "Полный чекап", 900, { health: 5, energy: 5, immunity: 3 }, 0.55),
      treatment("recovery_plan", "План восстановления", 500, { sleep: 8, energy: 8, stress: -5 }, 0.75),
    ], "chronic"),
    condition("low_energy", "Низкая энергия", 1, 7, { maxEnergy: 45 }, { energy: -4, discipline: -1 }, 0.0001, 1.0, ["fatigue"], [
      treatment("routine", "Наладить режим", 60, { energy: 7, sleep: 5 }, 0.5),
      treatment("nutrition", "Питание и прогулки", 180, { energy: 6, health: 3, immunity: 2 }, 0.6),
    ]),
    condition("heart_issues", "Проблемы с сердцем", 4, 45, { minAge: 45, minStress: 55, maxFitness: 45 }, { health: -6, energy: -4, stress: 3 }, 0.006, 1.7, ["heart", "chronic"], [
      treatment("cardio_check", "Кардиолог", 1200, { health: 8, stress: -3 }, 0.65),
      treatment("long_plan", "Долгий план лечения", 2200, { health: 12, fitness: 4, stress: -5 }, 0.85),
    ], "chronic"),
    condition("depressive_period", "Депрессивный период", 3, 14, { maxMental: 40, minStress: 45 }, { mental: -6, happiness: -5, energy: -5, social: -2 }, 0.001, 1.35, ["mental"], [
      treatment("therapy", "Психотерапия", 700, { mental: 10, happiness: 3, stress: -5 }, 0.75),
      treatment("support_network", "Поддержка окружения", 0, { mental: 4, social: 2, stress: -2 }, 0.4),
    ], "chronic"),
    condition("panic_attack", "Паническая атака", 2, 12, { minStress: 70, maxMental: 55 }, { mental: -4, stress: 6, energy: -3 }, 0.0002, 1.15, ["mental", "event"], [
      treatment("breathing", "Техники заземления", 0, { mental: 3, stress: -5 }, 0.45),
      treatment("specialist", "Специалист", 600, { mental: 7, stress: -8 }, 0.75),
    ]),
    condition("injury_recovery", "Восстановление после травмы", 1, 6, { hasInjury: true }, { fitness: 1, energy: -2, stress: 1 }, 0, 0.9, ["recovery"], [
      treatment("rehab", "Продолжать восстановление", 300, { fitness: 6, health: 3 }, 0.85),
    ]),
    condition("obesity", "Ожирение", 3, 12, { lowActivity: true, poorNutrition: true }, { health: -4, energy: -3, fitness: -4, stress: 1 }, 0.002, 1.45, ["metabolic", "chronic"], [
      treatment("coach", "План питания и движения", 700, { health: 5, fitness: 6, energy: 4 }, 0.65),
      treatment("doctor_plan", "Медицинский план", 1100, { health: 8, fitness: 5, stress: -2 }, 0.8),
    ], "chronic"),
    condition("weak_immunity", "Слабый иммунитет", 2, 0, { maxImmunity: 40 }, { immunity: -3, health: -2, energy: -2 }, 0.0003, 1.2, ["immunity"], [
      treatment("rest_nutrition", "Сон и питание", 220, { immunity: 8, health: 3 }, 0.6),
      treatment("checkup", "Чекап", 650, { immunity: 10, health: 4 }, 0.75),
    ], "chronic"),
    condition("migraine", "Мигрень", 2, 12, { minStress: 45, maxSleep: 60 }, { energy: -5, mental: -2, stress: 3 }, 0.0003, 1.25, ["pain"], [
      treatment("quiet_rest", "Тихий отдых", 80, { energy: 4, stress: -4 }, 0.45),
      treatment("neurologist", "Невролог", 850, { health: 4, energy: 4, stress: -3 }, 0.7),
    ]),
    condition("allergy_season", "Сезонная аллергия", 1, 4, { maxImmunity: 65 }, { health: -1, energy: -2, stress: 1 }, 0.0001, 1.05, ["immunity"], [
      treatment("medicine", "Лекарства", 260, { health: 3, energy: 2 }, 0.7),
    ]),
    condition("stomach_trouble", "Проблемы с желудком", 2, 8, { poorNutrition: true, minStress: 35 }, { health: -3, energy: -3, stress: 2 }, 0.0004, 1.2, ["digestion"], [
      treatment("diet", "Щадящее питание", 180, { health: 4, energy: 2 }, 0.55),
      treatment("gastro", "Гастроэнтеролог", 760, { health: 7, stress: -2 }, 0.75),
    ]),
    condition("vision_strain", "Усталость глаз", 1, 7, { highScreenTime: true }, { energy: -2, stress: 1 }, 0, 1.0, ["vision"], [
      treatment("breaks", "Перерывы от экрана", 0, { energy: 3, stress: -2 }, 0.55),
      treatment("optometrist", "Проверка зрения", 420, { health: 2, energy: 2 }, 0.7),
    ]),
    condition("dental_problem", "Проблемы с зубами", 2, 6, { maxHealth: 65 }, { health: -2, stress: 2, happiness: -1 }, 0.0001, 1.2, ["dental"], [
      treatment("dentist", "Стоматолог", 680, { health: 5, stress: -2 }, 0.85),
    ]),
    condition("skin_issue", "Проблемы с кожей", 1, 10, { minStress: 45 }, { happiness: -2, stress: 1 }, 0, 1.0, ["skin"], [
      treatment("dermatologist", "Дерматолог", 520, { health: 3, happiness: 2 }, 0.7),
      treatment("routine", "Уход и режим", 160, { happiness: 2, stress: -1 }, 0.45),
    ]),
    condition("sprained_wrist", "Растяжение запястья", 1, 8, { minRisk: 40 }, { health: -1, energy: -2, craft: -1 }, 0.0001, 1.05, ["injury"], [
      treatment("bandage", "Фиксация и отдых", 180, { health: 3, energy: 2 }, 0.7),
    ], "injury"),
    condition("high_pressure", "Повышенное давление", 3, 35, { minAge: 35, minStress: 60 }, { health: -4, energy: -2, stress: 2 }, 0.003, 1.45, ["heart", "chronic"], [
      treatment("doctor", "Врач и наблюдение", 900, { health: 7, stress: -4 }, 0.75),
      treatment("routine", "Режим и прогулки", 240, { health: 4, fitness: 3, stress: -3 }, 0.55),
    ], "chronic"),
    condition("overtraining", "Перетренированность", 2, 12, { highActivity: true, maxEnergy: 60 }, { health: -2, energy: -4, fitness: -1, stress: 2 }, 0.0001, 1.05, ["fitness"], [
      treatment("deload", "Снизить нагрузку", 0, { energy: 5, fitness: 2, stress: -2 }, 0.6),
    ]),
    condition("social_exhaustion", "Социальное истощение", 2, 14, { minStress: 50, maxMental: 65 }, { mental: -3, energy: -4, social: -1 }, 0.0001, 1.05, ["mental", "social"], [
      treatment("quiet_week", "Тихая неделя", 0, { mental: 4, energy: 5, stress: -4 }, 0.55),
    ]),
    condition("hearing_strain", "Перегрузка слуха", 1, 14, { minStress: 35 }, { energy: -1, stress: 2 }, 0, 1.0, ["sensory"], [
      treatment("rest", "Тишина и отдых", 0, { energy: 2, stress: -3 }, 0.55),
      treatment("doctor", "Проверка слуха", 380, { health: 2, stress: -1 }, 0.65),
    ]),
    condition("joint_pain", "Боль в суставах", 2, 35, { minAge: 35, maxFitness: 55 }, { health: -2, energy: -3, fitness: -2 }, 0.0005, 1.2, ["pain"], [
      treatment("physio", "ЛФК", 420, { health: 4, fitness: 4 }, 0.65),
      treatment("doctor", "Врач", 700, { health: 5, stress: -1 }, 0.75),
    ], "chronic"),
  ];

  function condition(id, title, severity, minAge, riskFactors, effectsPerYear, deathRiskModifier, costModifier, eventTags, treatmentOptions, bucket = "active") {
    return { id, title, severity, minAge, riskFactors, effectsPerYear, treatmentOptions, deathRiskModifier, costModifier, eventTags, bucket };
  }

  function treatment(id, title, baseCost, effects, successChance) {
    return { id, title, baseCost, effects, successChance };
  }

  window.GameData = { ...(window.GameData || {}), healthConditionCatalog };
})();
