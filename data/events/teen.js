(() => {
  const events = [
    {
      id: "teen_first_part_time_offer",
      category: "teen",
      title: "Первая подработка рядом с домом",
      description: "Знакомые предлагают несколько смен после учебы.",
      minAge: 14,
      maxAge: 18,
      baseWeight: 11,
      conditions: {},
      weightModifiers: [{ stat: "discipline", gte: 55, add: 4 }, { stat: "familyMoney", lte: 900, add: 5 }],
      options: [
        { id: "take_shifts", label: "Взять смены", description: "Получить первые деньги.", effects: { money: 260, stress: 4, finance: 2, discipline: 1 }, resultText: "Подработка дала деньги и взрослое ощущение ответственности." },
        { id: "focus_school", label: "Остаться на учебе", description: "Не распыляться.", effects: { grades: 4, stress: -1, money: 0 }, resultText: "Вы сохранили силы для учебы." },
      ],
    },
    {
      id: "teen_bad_company",
      category: "teen",
      title: "Сомнительная компания",
      description: "Новая компания зовет на вечер, где легко попасть в неприятности.",
      minAge: 13,
      maxAge: 18,
      baseWeight: 9,
      conditions: {},
      weightModifiers: [{ stat: "risk", gte: 60, add: 7 }, { stat: "social", lte: 30, add: 4 }],
      options: [
        { id: "go", label: "Пойти", description: "Посмотреть, что там происходит.", effects: { social: 4, stress: 3, karma: -2, danger: 10 }, resultText: "Вечер был шумным и не самым спокойным.", risk: { chance: 0.22, effects: { criminalRecord: 1, reputation: -5, stress: 8 }, resultText: "Вмешались взрослые, и история оставила юридический след." } },
        { id: "refuse", label: "Отказаться", description: "Выбрать безопасный вечер.", effects: { discipline: 3, stress: -2, social: -1 }, resultText: "Вы избежали сомнительного приключения." },
      ],
    },
    {
      id: "teen_parent_talk_future",
      category: "teen",
      title: "Разговор о будущем",
      description: "Родители спрашивают, что вы хотите делать после школы.",
      minAge: 15,
      maxAge: 18,
      baseWeight: 10,
      conditions: {},
      weightModifiers: [{ stat: "ambition", gte: 60, add: 4 }],
      options: [
        { id: "honest_plan", label: "Обсудить честно", description: "Назвать свои страхи и цели.", effects: { stress: -3, discipline: 2, knowledge: 2, empathy: 1 }, resultText: "Разговор сделал планы реалистичнее." },
        { id: "avoid", label: "Уйти от темы", description: "Не хочется решать сейчас.", effects: { stress: 2, happiness: 1, discipline: -2 }, resultText: "Тема осталась висеть в воздухе." },
      ],
    },
    {
      id: "teen_online_argument",
      category: "teen",
      title: "Спор в сети",
      description: "Ваш комментарий неожиданно вызывает жаркую перепалку.",
      minAge: 13,
      maxAge: 19,
      baseWeight: 8,
      conditions: {},
      weightModifiers: [{ stat: "fame", gte: 8, add: 5 }, { stat: "stress", gte: 50, add: 3 }],
      options: [
        { id: "answer_calm", label: "Ответить спокойно", description: "Не поднимать градус.", effects: { reputation: 2, stress: -1, empathy: 1 }, resultText: "Спор постепенно сошел на нет." },
        { id: "fire_back", label: "Ответить резко", description: "Поставить всех на место.", effects: { fame: 2, stress: 4, reputation: -3 }, resultText: "Внимания стало больше, но осадок тоже.", risk: { chance: 0.18, effects: { stress: 5, fame: 3, karma: -2 }, resultText: "Спор разошелся дальше, чем хотелось." } },
      ],
    },
    {
      id: "teen_exam_choice",
      category: "teen",
      title: "Выбор подготовки к экзаменам",
      description: "До экзаменов остается немного времени, и надо выбрать стратегию.",
      minAge: 16,
      maxAge: 18,
      baseWeight: 10,
      conditions: {},
      weightModifiers: [{ stat: "grades", lte: 45, add: 5 }, { stat: "stress", gte: 60, add: 4 }],
      options: [
        { id: "schedule", label: "Составить график", description: "Учиться регулярно.", effects: { grades: 6, discipline: 3, stress: 3, logic: 1 }, resultText: "График дал ощущение контроля." },
        { id: "cram", label: "Учить рывками", description: "Собраться в последний момент.", effects: { grades: 3, stress: 7, energy: -4 }, resultText: "Рывок помог, но дался тяжело.", risk: { chance: 0.2, effects: { mental: -4, health: -2 }, resultText: "Перегрузка ударила по самочувствию." } },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
