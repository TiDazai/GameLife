(() => {
  const lifeScoreCategories = [
    "money",
    "family",
    "career",
    "education",
    "health",
    "happiness",
    "reputation",
    "karma",
    "legal",
    "fame",
    "business",
    "relationships",
  ];

  const lifeTypeRules = [
    type("empire_builder", "Строитель империи", "Жизнь, в которой капитал, бизнес и влияние складывались в большую систему.", { money: 2.4, business: 2.2, career: 0.8, reputation: 0.8 }, { money: 60, business: 45 }),
    type("quiet_harbor", "Тихая гавань", "Спокойная, устойчивая жизнь с низким шумом и крепким внутренним балансом.", { happiness: 1.8, health: 1.4, legal: 1.2, family: 0.8 }, { happiness: 55, legal: 60, fameMax: 45 }),
    type("eternal_student", "Вечный студент", "Путь через знания, курсы и постоянное развитие.", { education: 2.6, career: 0.6, reputation: 0.5 }, { education: 65 }),
    type("family_center", "Семейный центр", "Вокруг этой жизни держалась семья и несколько поколений.", { family: 2.6, relationships: 1.4, happiness: 0.8, karma: 0.5 }, { family: 60 }),
    type("risky_player", "Рискованный игрок", "Жизнь на границе решений, где ставки часто были выше спокойствия.", { legal: -1.0, money: 0.6, fame: 0.8 }, { risk: 65 }),
    type("iron_discipline", "Железная дисциплина", "Путь собранности, образования, карьеры и долговременной формы.", { career: 1.3, education: 1.1, health: 1.0, legal: 0.8 }, { discipline: 70 }),
    type("broken_path", "Разбитая траектория", "Слишком много долгов, конфликтов и просадок собралось в одну линию.", { money: -1.6, health: -0.8, happiness: -1.0, legal: -1.2, relationships: -0.5 }, { hardship: 60 }),
    type("people_favorite", "Народный любимец", "Репутация, известность и доверие сделали эту жизнь заметной для других.", { reputation: 1.8, fame: 1.5, karma: 1.0, relationships: 0.6 }, { reputation: 65, fame: 35 }),
    type("lone_capitalist", "Одинокий капиталист", "Деньги были сильнее связей, а капитал рос почти отдельно от близости.", { money: 2.2, family: -1.0, relationships: -1.0, business: 0.8 }, { money: 55, familyMax: 35 }),
    type("chaotic_life", "Хаотичная жизнь", "Много поворотов, риска и противоречий без единого центра тяжести.", { legal: -0.8, happiness: -0.4, money: 0.4, fame: 0.5 }, { chaos: 55 }),
    type("late_bloom", "Поздний расцвет", "Главные результаты пришли поздно, но жизнь успела развернуться.", { career: 1.2, reputation: 1.0, money: 0.9, happiness: 0.6 }, { age: 55, lateSuccess: 55 }),
    type("heir", "Наследник", "История началась не с нуля: прошлое семьи стало стартовой силой.", { money: 1.2, family: 1.2, reputation: 0.6 }, { inherited: true }),
    type("self_made_magnate", "Самодельный магнат", "Капитал был собран собственными решениями, работой и деловой хваткой.", { money: 2.3, career: 1.1, business: 1.1, education: 0.5 }, { money: 65, inheritedMax: 0 }),
    type("tired_genius", "Уставший гений", "Большие знания и результат пришли вместе с усталостью.", { education: 1.8, career: 1.0, health: -0.8, happiness: -0.6 }, { education: 70, stress: 65 }),
    type("scandal_figure", "Скандальная фигура", "Известность и правовой след сделали жизнь спорной и шумной.", { fame: 1.8, reputation: -1.0, legal: -1.5, karma: -0.5 }, { fame: 45, legalMax: 45 }),
  ];

  const achievementRules = [
    achievement("first_million", "Первый миллион", "Капитал достиг миллиона.", { netWorth: 1000000 }),
    achievement("long_lived", "Долгожитель", "Прожить 90 лет или больше.", { age: 90 }),
    achievement("big_family", "Большая семья", "Воспитать большую семью.", { children: 4 }),
    achievement("successful_business", "Успешный бизнес", "Построить заметную компанию.", { businessScore: 70 }),
    achievement("perfect_health", "Идеальное здоровье", "Завершить жизнь с очень крепким здоровьем.", { health: 95 }),
    achievement("career_peak", "Карьерная вершина", "Дойти до высокого карьерного уровня.", { careerLevel: 7 }),
    achievement("financial_freedom", "Полная финансовая свобода", "Иметь большой капитал без долгов.", { netWorth: 250000, debtMax: 0 }),
    achievement("debt_free_life", "Жизнь без долгов", "Завершить жизнь без долгов и налоговой просадки.", { debtMax: 0, taxDebtMax: 0 }),
    achievement("strong_education", "Сильное образование", "Получить серьезную образовательную базу.", { educationScore: 75 }),
    achievement("reputation_100", "Репутация 100", "Добиться безупречной репутации.", { reputation: 100 }),
    achievement("trusted_person", "Человек доверия", "Сохранить высокий общественный кредит доверия.", { publicTrust: 90 }),
    achievement("clean_record", "Чистый путь", "Пройти жизнь без судимости и открытых дел.", { criminalRecordMax: 0, activeCasesMax: 0 }),
    achievement("famous_name", "Громкое имя", "Стать широко известным.", { fame: 80 }),
    achievement("family_continues", "Семейная нить", "Оставить наследника для следующего поколения.", { children: 1, generation: 1 }),
    achievement("balanced_finish", "Сильный баланс", "Сохранить высокие здоровье, счастье и репутацию одновременно.", { health: 75, happiness: 75, reputation: 75 }),
    achievement("late_power", "Поздняя сила", "После 55 лет иметь карьеру, капитал или репутацию выше среднего.", { age: 55, lateSuccess: 65 }),
  ];

  function type(id, name, description, weights, thresholds = {}) {
    return { id, name, description, weights, thresholds };
  }

  function achievement(id, name, description, test) {
    return { id, name, description, test };
  }

  window.GameData = { ...(window.GameData || {}), lifeScoreCategories, lifeTypeRules, achievementRules };
})();
