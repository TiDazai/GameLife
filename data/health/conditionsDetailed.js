(() => {
  // Detailed health conditions catalog. These are GAME STATES, not medical
  // reference or advice: every field is a game lever. Categories group them for
  // UI and events. The objects are shaped to be drop-in compatible with the
  // existing GameHealthEngine catalog (effectsPerYear/treatmentOptions/bucket)
  // while carrying richer descriptive fields. The reproductive_18_plus category
  // is abstract, non-graphic, and gated to adults via minAge.

  // category -> engine bucket
  const bucketFor = (category) => {
    if (category === "injury") return "injury";
    if (["chronic", "mental", "lifestyle", "aging"].includes(category)) return "chronic";
    return "active";
  };

  const t = (id, title, baseCost, effects, successChance) => ({ id, title, baseCost, effects, successChance });

  const dc = (spec) => ({
    // engine-required shape
    id: spec.id,
    title: spec.title,
    severity: spec.severity,
    minAge: spec.minAge || 0,
    riskFactors: spec.riskFactors || {},
    effectsPerYear: spec.yearlyEffects || {},
    treatmentOptions: spec.treatmentOptions || [],
    deathRiskModifier: spec.deathRiskModifier || 0,
    costModifier: spec.costModifier || 1,
    eventTags: spec.eventTags || [],
    bucket: bucketFor(spec.category),
    // richer descriptive fields (read by UI / events)
    category: spec.category,
    maxAge: spec.maxAge || null,
    symptomsText: spec.symptomsText || "",
    treatmentCost: spec.treatmentCost || 0,
    duration: spec.duration || 1,
    chronicChance: spec.chronicChance || 0,
    contagious: Boolean(spec.contagious),
    workImpact: spec.workImpact || 0,
    relationshipImpact: spec.relationshipImpact || 0,
  });

  const detailed = [
    // ---- common ----
    dc({ id: "seasonal_flu", title: "Сезонный грипп", category: "infectious", severity: 2, minAge: 0,
      riskFactors: { maxImmunity: 60 }, yearlyEffects: { health: -3, energy: -6, stress: 2 },
      deathRiskModifier: 0.0004, costModifier: 1.1, contagious: true, duration: 1, chronicChance: 0,
      symptomsText: "Высокая утомляемость и слабость в течение сезона.", treatmentCost: 260, workImpact: 4,
      eventTags: ["infection", "common"],
      treatmentOptions: [ t("rest", "Постельный режим", 60, { health: 3, energy: 5 }, 0.7), t("clinic_visit", "Визит в клинику", 280, { health: 7, energy: 4 }, 0.88) ] }),
    dc({ id: "stomach_infection", title: "Кишечная инфекция", category: "infectious", severity: 2, minAge: 0,
      riskFactors: { maxImmunity: 55 }, yearlyEffects: { health: -4, energy: -5, stress: 2 },
      deathRiskModifier: 0.0005, costModifier: 1.1, contagious: true, duration: 1,
      symptomsText: "Несколько тяжёлых дней, обезвоживание.", treatmentCost: 320, workImpact: 5,
      eventTags: ["infection"],
      treatmentOptions: [ t("rest", "Покой и питьё", 80, { health: 4, energy: 4 }, 0.65), t("clinic_visit", "Клиника", 340, { health: 8 }, 0.9) ] }),
    // ---- injury ----
    dc({ id: "fracture", title: "Перелом", category: "injury", severity: 3, minAge: 4,
      riskFactors: { minRisk: 40 }, yearlyEffects: { health: -5, energy: -6, fitness: -4, stress: 3 },
      deathRiskModifier: 0.0008, costModifier: 1.4, duration: 1, chronicChance: 0.1,
      symptomsText: "Ограничение подвижности, долгое заживление.", treatmentCost: 900, workImpact: 8,
      eventTags: ["injury"],
      treatmentOptions: [ t("clinic_visit", "Травмпункт", 700, { health: 6 }, 0.8), t("rehabilitation", "Реабилитация", 850, { fitness: 6, health: 4 }, 0.85) ] }),
    dc({ id: "sports_trauma", title: "Спортивная травма", category: "injury", severity: 2, minAge: 10,
      riskFactors: { highActivity: true }, yearlyEffects: { fitness: -5, energy: -4, stress: 2 },
      deathRiskModifier: 0.0002, costModifier: 1.2, duration: 1, chronicChance: 0.15,
      symptomsText: "Боль при нагрузке, риск рецидива.", treatmentCost: 520, workImpact: 4,
      eventTags: ["injury", "sport"],
      treatmentOptions: [ t("rest", "Покой", 60, { fitness: 3 }, 0.55), t("rehabilitation", "Восстановление", 600, { fitness: 7 }, 0.85) ] }),
    // ---- chronic ----
    dc({ id: "hypertension", title: "Гипертония", category: "chronic", severity: 3, minAge: 35,
      riskFactors: { minStress: 50 }, yearlyEffects: { health: -4, energy: -2, stress: 2 },
      deathRiskModifier: 0.004, costModifier: 1.5, duration: 99, chronicChance: 0.9,
      symptomsText: "Хроническое состояние, требует постоянного контроля.", treatmentCost: 1100, workImpact: 3,
      eventTags: ["chronic", "heart"],
      treatmentOptions: [ t("medication_abstract", "Поддерживающая терапия", 900, { health: 6, stress: -2 }, 0.8), t("lifestyle_change", "Изменение образа жизни", 300, { health: 5, fitness: 4, stress: -3 }, 0.6) ] }),
    dc({ id: "type2_diabetes", title: "Диабет 2 типа", category: "chronic", severity: 4, minAge: 38,
      riskFactors: { poorNutrition: true }, yearlyEffects: { health: -5, energy: -3, fitness: -2 },
      deathRiskModifier: 0.006, costModifier: 1.7, duration: 99, chronicChance: 0.95,
      symptomsText: "Хроническое нарушение обмена, влияет на энергию.", treatmentCost: 1500, workImpact: 4,
      eventTags: ["chronic", "metabolic"],
      treatmentOptions: [ t("medication_abstract", "Медикаментозный план", 1300, { health: 7 }, 0.8), t("lifestyle_change", "Питание и активность", 400, { health: 6, fitness: 5 }, 0.6) ] }),
    dc({ id: "asthma", title: "Астма", category: "chronic", severity: 3, minAge: 6,
      riskFactors: { maxImmunity: 50 }, yearlyEffects: { energy: -3, fitness: -2, stress: 2 },
      deathRiskModifier: 0.002, costModifier: 1.3, duration: 99, chronicChance: 0.9,
      symptomsText: "Эпизоды затруднённого дыхания при нагрузке.", treatmentCost: 800, workImpact: 2,
      eventTags: ["chronic", "respiratory"],
      treatmentOptions: [ t("medication_abstract", "Базисная терапия", 700, { health: 5, energy: 3 }, 0.82), t("specialist_visit", "Пульмонолог", 900, { health: 6 }, 0.85) ] }),
    // ---- mental ----
    dc({ id: "clinical_depression", title: "Клиническая депрессия", category: "mental", severity: 4, minAge: 14,
      riskFactors: { maxMental: 38, minStress: 50 }, yearlyEffects: { mental: -7, happiness: -6, energy: -5, social: -2 },
      deathRiskModifier: 0.002, costModifier: 1.4, duration: 3, chronicChance: 0.5,
      symptomsText: "Длительное снижение настроения и энергии.", treatmentCost: 1200, workImpact: 6, relationshipImpact: -4,
      eventTags: ["mental"],
      treatmentOptions: [ t("therapy", "Психотерапия", 900, { mental: 10, happiness: 4, stress: -5 }, 0.78), t("medication_abstract", "Назначенная терапия", 700, { mental: 8, stress: -4 }, 0.75) ] }),
    dc({ id: "anxiety_disorder", title: "Тревожное расстройство", category: "mental", severity: 3, minAge: 12,
      riskFactors: { minStress: 55, maxMental: 60 }, yearlyEffects: { mental: -5, stress: 6, energy: -3, social: -2 },
      deathRiskModifier: 0.0005, costModifier: 1.3, duration: 2, chronicChance: 0.4,
      symptomsText: "Постоянное напряжение и беспокойство.", treatmentCost: 900, workImpact: 4, relationshipImpact: -3,
      eventTags: ["mental"],
      treatmentOptions: [ t("therapy", "Психолог", 800, { mental: 8, stress: -8 }, 0.78), t("lifestyle_change", "Режим и практики", 200, { mental: 4, stress: -5 }, 0.5) ] }),
    // ---- reproductive (18+) — abstract, non-graphic ----
    dc({ id: "reproductive_health_check_18_plus", title: "Репродуктивное здоровье (18+)", category: "reproductive_18_plus", severity: 2, minAge: 18,
      riskFactors: {}, yearlyEffects: { health: -2, stress: 2 },
      deathRiskModifier: 0.0003, costModifier: 1.2, duration: 1, chronicChance: 0.2,
      symptomsText: "Абстрактное состояние взрослого репродуктивного здоровья.", treatmentCost: 700, workImpact: 1,
      eventTags: ["18+", "reproductive"],
      treatmentOptions: [ t("specialist_visit", "Профильный специалист", 700, { health: 5, stress: -2 }, 0.85), t("medication_abstract", "Назначенный курс", 500, { health: 4 }, 0.75) ] }),
    dc({ id: "sti_abstract_18_plus", title: "Инфекция, передающаяся при контакте (18+, абстрактно)", category: "reproductive_18_plus", severity: 3, minAge: 18,
      riskFactors: {}, yearlyEffects: { health: -4, stress: 4, social: -1 },
      deathRiskModifier: 0.0008, costModifier: 1.3, duration: 1, chronicChance: 0.3, contagious: true,
      symptomsText: "Абстрактная игровая инфекция взрослой ветки. Без медицинских деталей.", treatmentCost: 800, workImpact: 2, relationshipImpact: -4,
      eventTags: ["18+", "reproductive", "infection"],
      treatmentOptions: [ t("clinic_visit", "Обследование и лечение", 800, { health: 7, stress: -3 }, 0.85), t("medication_abstract", "Назначенный курс", 600, { health: 6 }, 0.8) ] }),
    // ---- lifestyle ----
    dc({ id: "smoking_dependency", title: "Никотиновая зависимость", category: "lifestyle", severity: 3, minAge: 16,
      riskFactors: {}, yearlyEffects: { health: -3, fitness: -2, energy: -2 },
      deathRiskModifier: 0.003, costModifier: 1.2, duration: 99, chronicChance: 0.85,
      symptomsText: "Привычка, постепенно подтачивающая здоровье.", treatmentCost: 400, workImpact: 1,
      eventTags: ["lifestyle"],
      treatmentOptions: [ t("lifestyle_change", "Программа отказа", 300, { health: 4, fitness: 3 }, 0.5), t("therapy", "Поддержка специалиста", 600, { health: 5, stress: -3 }, 0.7) ] }),
    dc({ id: "alcohol_overuse", title: "Злоупотребление алкоголем", category: "lifestyle", severity: 4, minAge: 18,
      riskFactors: { minStress: 55 }, yearlyEffects: { health: -5, mental: -3, energy: -3, social: -2 },
      deathRiskModifier: 0.004, costModifier: 1.4, duration: 3, chronicChance: 0.6,
      symptomsText: "Игровое состояние зависимости с социальными последствиями.", treatmentCost: 1100, workImpact: 5, relationshipImpact: -5,
      eventTags: ["lifestyle", "18+"],
      treatmentOptions: [ t("rehabilitation", "Программа восстановления", 1200, { health: 8, mental: 5, stress: -5 }, 0.7), t("therapy", "Терапия и поддержка", 800, { mental: 6, stress: -4 }, 0.65) ] }),
    // ---- aging ----
    dc({ id: "joint_degeneration", title: "Возрастные изменения суставов", category: "aging", severity: 3, minAge: 55,
      riskFactors: {}, yearlyEffects: { fitness: -3, energy: -2, health: -2 },
      deathRiskModifier: 0.002, costModifier: 1.3, duration: 99, chronicChance: 0.9,
      symptomsText: "Снижение подвижности с возрастом.", treatmentCost: 1000, workImpact: 3,
      eventTags: ["aging", "chronic"],
      treatmentOptions: [ t("rehabilitation", "Лечебная физкультура", 600, { fitness: 5, health: 3 }, 0.7), t("surgery_abstract", "Плановое вмешательство", 2400, { fitness: 8, health: 5 }, 0.8) ] }),
    dc({ id: "cardiovascular_aging", title: "Возрастные риски сердца", category: "aging", severity: 4, minAge: 60,
      riskFactors: { maxFitness: 50 }, yearlyEffects: { health: -5, energy: -3, stress: 2 },
      deathRiskModifier: 0.008, costModifier: 1.6, duration: 99, chronicChance: 0.95,
      symptomsText: "Возрастная нагрузка на сердечно-сосудистую систему.", treatmentCost: 2000, workImpact: 4,
      eventTags: ["aging", "heart", "chronic"],
      treatmentOptions: [ t("specialist_visit", "Кардиолог", 1400, { health: 7, stress: -3 }, 0.7), t("surgery_abstract", "Плановое вмешательство", 3200, { health: 12 }, 0.82) ] }),
  ];

  // Append to the shared catalog (health.js loads first and creates it).
  const existing = (window.GameData && window.GameData.healthConditionCatalog) || [];
  const existingIds = new Set(existing.map((c) => c.id));
  const merged = existing.concat(detailed.filter((c) => !existingIds.has(c.id)));
  window.GameData = { ...(window.GameData || {}), healthConditionCatalog: merged };
  // Also expose the detailed list + treatment vocabulary for UI/events.
  window.GameHealthDetailed = {
    conditions: detailed,
    categories: ["common", "injury", "chronic", "mental", "reproductive_18_plus", "infectious", "lifestyle", "aging"],
    treatmentKinds: ["rest", "clinic_visit", "specialist_visit", "therapy", "medication_abstract", "surgery_abstract", "lifestyle_change", "rehabilitation", "insurance_claim"],
  };
})();
