(() => {
  // Concrete fields of study a character can enroll in. Each Specialty is a real
  // object the education engine attaches to a diploma and that career uses to
  // bias job fit. `level` maps to data/careerEducation.js educationLevels.
  // `field` maps to an industry id; `skills` are yearly skill nudges; `jobTags`
  // are matched against job.eventTags / job.industry for specialty bonuses.

  const sp = (id, title, level, field, knowledge, prestige, skills, jobTags, minAge = 17) => ({
    id, title, level, field, knowledge, prestige, skills, jobTags, minAge,
  });

  const specialties = {
    // ---- IT ----
    computer_science:        sp("computer_science", "Информатика", "university", "it", 16, 60, { logic: 4, language: 1 }, ["it"]),
    software_engineering:    sp("software_engineering", "Программная инженерия", "university", "it", 16, 62, { logic: 4, craft: 1 }, ["it"]),
    data_science:            sp("data_science", "Анализ данных", "master", "it", 18, 66, { logic: 5, finance: 1 }, ["it", "finance"], 21),
    cybersecurity:           sp("cybersecurity", "Кибербезопасность", "university", "it", 16, 64, { logic: 4, craft: 1 }, ["it"]),
    // ---- Medicine ----
    medicine:                sp("medicine", "Лечебное дело", "university", "medicine", 18, 72, { empathy: 3, logic: 3 }, ["medicine"], 18),
    nursing:                 sp("nursing", "Сестринское дело", "college", "medicine", 12, 50, { empathy: 4, fitness: 1 }, ["medicine"], 16),
    pharmacy:                sp("pharmacy", "Фармация", "university", "medicine", 15, 60, { logic: 3, empathy: 2 }, ["medicine"]),
    psychology:              sp("psychology", "Психология", "university", "education", 14, 58, { empathy: 5, language: 2 }, ["medicine", "education"]),
    // ---- Engineering ----
    mechanical_engineering:  sp("mechanical_engineering", "Машиностроение", "university", "engineering", 15, 58, { craft: 4, logic: 2 }, ["engineering", "production"]),
    civil_engineering:       sp("civil_engineering", "Строительство", "university", "engineering", 15, 58, { craft: 3, logic: 3 }, ["engineering", "production"]),
    electrical_engineering:  sp("electrical_engineering", "Электроника", "university", "engineering", 15, 60, { logic: 4, craft: 2 }, ["engineering", "it"]),
    architecture:            sp("architecture", "Архитектура", "university", "engineering", 15, 62, { creativity: 4, craft: 2 }, ["engineering", "creativity"]),
    // ---- Finance / Business ----
    economics:               sp("economics", "Экономика", "university", "finance", 15, 60, { finance: 4, logic: 2 }, ["finance"]),
    finance_banking:         sp("finance_banking", "Финансы и банки", "university", "finance", 15, 62, { finance: 5, leadership: 1 }, ["finance"]),
    accounting:              sp("accounting", "Бухгалтерия", "college", "finance", 11, 48, { finance: 4, logic: 1 }, ["finance"], 16),
    business_administration: sp("business_administration", "Управление бизнесом", "university", "entrepreneurship", 14, 60, { leadership: 4, finance: 2 }, ["entrepreneurship", "finance"]),
    marketing:               sp("marketing", "Маркетинг", "university", "creativity", 13, 56, { language: 3, creativity: 2, finance: 1 }, ["creativity", "finance"]),
    // ---- Law / Government ----
    law:                     sp("law", "Юриспруденция", "university", "government", 16, 68, { language: 4, logic: 2 }, ["government"]),
    political_science:       sp("political_science", "Политология", "university", "government", 14, 58, { language: 3, leadership: 2 }, ["government"]),
    public_administration:   sp("public_administration", "Госуправление", "university", "government", 13, 56, { leadership: 3, language: 2 }, ["government"]),
    // ---- Education / Humanities ----
    pedagogy:                sp("pedagogy", "Педагогика", "university", "education", 13, 52, { empathy: 4, language: 3 }, ["education"]),
    linguistics:             sp("linguistics", "Лингвистика", "university", "education", 13, 54, { language: 5, logic: 1 }, ["education", "creativity"]),
    journalism:              sp("journalism", "Журналистика", "university", "creativity", 13, 54, { language: 4, creativity: 2 }, ["creativity"]),
    // ---- Creative ----
    graphic_design:          sp("graphic_design", "Графический дизайн", "college", "creativity", 10, 50, { creativity: 5, craft: 1 }, ["creativity"], 16),
    fine_arts:               sp("fine_arts", "Изобразительное искусство", "university", "creativity", 11, 52, { creativity: 5, language: 1 }, ["creativity"]),
    music:                   sp("music", "Музыка", "university", "creativity", 11, 54, { creativity: 5, empathy: 1 }, ["creativity"]),
    // ---- Service / Trade ----
    culinary_school:         sp("culinary_school", "Кулинарное дело", "college", "service", 9, 46, { craft: 4, creativity: 1 }, ["service"], 16),
    sport_science:           sp("sport_science", "Спорт и здоровье", "college", "sport", 10, 48, { fitness: 5, leadership: 1 }, ["sport", "service"], 16),
  };

  window.GameEducationData = { ...(window.GameEducationData || {}), specialties };
})();
