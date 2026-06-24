(() => {
  const events = [
    {
      id: "adult_neighbor_repair_noise",
      category: "adult",
      title: "Ремонт за стеной",
      description: "Соседи начинают долгий ремонт, а вам нужно сохранить быт и нервы.",
      minAge: 18,
      maxAge: 80,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "stress", gte: 55, add: 4 }],
      options: [
        { id: "talk", label: "Поговорить", description: "Спокойно договориться о времени.", effects: { stress: -2, social: 1, empathy: 1 }, resultText: "Разговор помог найти приемлемый режим." },
        { id: "endure", label: "Терпеть", description: "Не вступать в конфликт.", effects: { stress: 4, mental: -2 }, resultText: "Ремонт продолжился, а раздражение накопилось." },
      ],
    },
    {
      id: "adult_friend_move_help",
      category: "adult",
      title: "Переезд друга",
      description: "Друг просит помочь с переездом в выходной.",
      minAge: 18,
      maxAge: 65,
      baseWeight: 8,
      conditions: {},
      weightModifiers: [{ stat: "kindness", gte: 60, add: 5 }],
      options: [
        { id: "help", label: "Помочь", description: "Потратить выходной на поддержку.", effects: { social: 3, karma: 3, energy: -5, health: -1 }, resultText: "Друг оценил помощь, хотя день вышел тяжелым." },
        { id: "decline", label: "Отказать", description: "Сохранить силы.", effects: { energy: 3, social: -1, stress: -1 }, resultText: "Вы отдохнули, но друг немного расстроился." },
      ],
    },
    {
      id: "adult_document_deadline",
      category: "adult",
      title: "Срок по документам",
      description: "Важная бумага требует внимания до конца месяца.",
      minAge: 18,
      maxAge: 90,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "discipline", lte: 40, add: 4 }, { stat: "taxDebt", gte: 1, add: 6 }],
      options: [
        { id: "handle", label: "Разобраться сразу", description: "Потратить вечер на порядок.", effects: { stress: -2, discipline: 2, reputation: 1, money: -120 }, resultText: "Документы закрыты без лишней драмы." },
        { id: "postpone", label: "Отложить", description: "Вернуться позже.", effects: { stress: 4, creditScore: -1 }, resultText: "Дело осталось давить фоном.", risk: { chance: 0.25, effects: { debt: 180, reputation: -2 }, resultText: "Просрочка привела к штрафу." } },
      ],
    },
    {
      id: "adult_unexpected_free_day",
      category: "adult",
      title: "Свободный день",
      description: "Планы внезапно отменились, и день можно потратить на себя.",
      minAge: 18,
      maxAge: 85,
      baseWeight: 8,
      conditions: {},
      weightModifiers: [{ stat: "stress", gte: 65, add: 5 }],
      options: [
        { id: "rest", label: "Отдохнуть", description: "Восстановить силы.", effects: { stress: -7, mental: 4, energy: 5, happiness: 2 }, resultText: "Пауза вернула ясность." },
        { id: "side_project", label: "Личный проект", description: "Сделать что-то для будущего.", effects: { knowledge: 3, portfolio: 3, stress: 2 }, resultText: "День превратился в маленький шаг вперед." },
      ],
    },
    {
      id: "adult_old_friend_meeting",
      category: "adult",
      title: "Встреча со старым знакомым",
      description: "В городе оказывается человек из прошлого.",
      minAge: 20,
      maxAge: 75,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "social", gte: 50, add: 4 }],
      options: [
        { id: "meet", label: "Встретиться", description: "Обновить связь.", effects: { social: 3, network: 2, happiness: 2, stress: -1 }, resultText: "Разговор напомнил, как меняется жизнь." },
        { id: "skip", label: "Не встречаться", description: "Оставить прошлое в прошлом.", effects: { stress: -1, social: -1 }, resultText: "Вы сохранили дистанцию." },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
