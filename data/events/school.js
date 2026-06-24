(() => {
  const events = [
    {
      id: "school_class_conflict",
      category: "school",
      title: "Конфликт в классе",
      description: "Одноклассники спорят, кто виноват в сорванной подготовке к уроку.",
      minAge: 7,
      maxAge: 13,
      baseWeight: 11,
      conditions: {},
      weightModifiers: [{ stat: "social", lte: 35, add: 4 }, { stat: "stress", gte: 50, add: 5 }],
      options: [
        { id: "mediate", label: "Помирить", description: "Попробовать спокойно разобраться.", effects: { social: 3, empathy: 2, stress: 2, reputation: 1 }, resultText: "Вы помогли классу не разругаться окончательно." },
        { id: "stay_quiet", label: "Не вмешиваться", description: "Сохранить дистанцию.", effects: { stress: -1, social: -1 }, resultText: "Конфликт прошел мимо, но отношения стали холоднее." },
      ],
    },
    {
      id: "school_strong_club",
      category: "school",
      title: "Сильный кружок",
      description: "Учитель предлагает пройти отбор в кружок, где занимаются сложнее обычного.",
      minAge: 7,
      maxAge: 16,
      baseWeight: 10,
      conditions: { minStats: { knowledge: 10 } },
      weightModifiers: [{ stat: "curiosity", gte: 60, add: 6 }, { stat: "grades", gte: 45, add: 5 }],
      options: [
        { id: "try_join", label: "Пройти отбор", description: "Подготовиться и попробовать.", effects: { knowledge: 5, logic: 3, stress: 4, portfolio: 2 }, resultText: "Кружок расширил горизонты и добавил нагрузки.", risk: { chance: 0.18, effects: { stress: 4, happiness: -2 }, resultText: "Отбор оказался болезненно сложным." } },
        { id: "decline", label: "Отказаться", description: "Не брать лишнюю нагрузку.", effects: { stress: -2, happiness: 1 }, resultText: "Вы сохранили спокойный темп учебы." },
      ],
    },
    {
      id: "school_exam_fever",
      category: "school",
      title: "Температура перед контрольной",
      description: "Накануне важной контрольной поднялась температура.",
      minAge: 9,
      maxAge: 17,
      baseWeight: 8,
      conditions: { maxStats: { health: 90 } },
      weightModifiers: [{ stat: "stress", gte: 55, add: 6 }],
      options: [
        { id: "rest_home", label: "Остаться дома", description: "Восстановиться и написать позже.", effects: { health: 5, stress: -3, grades: -2 }, resultText: "Здоровье восстановилось, но учебный график съехал." },
        { id: "go_school", label: "Пойти все равно", description: "Не переносить контрольную.", effects: { grades: 4, discipline: 2, health: -4, stress: 4 }, resultText: "Вы справились, но организм заплатил усталостью." },
      ],
    },
    {
      id: "school_friend_needs_help",
      category: "school",
      title: "Друг просит помощи",
      description: "Друг не понимает тему и просит объяснить ее после уроков.",
      minAge: 8,
      maxAge: 17,
      baseWeight: 9,
      conditions: { minStats: { knowledge: 12 } },
      weightModifiers: [{ stat: "kindness", gte: 60, add: 5 }],
      options: [
        { id: "explain", label: "Объяснить", description: "Потратить время на помощь.", effects: { empathy: 3, social: 2, knowledge: 1, energy: -2, karma: 2 }, resultText: "Друг разобрался и стал доверять вам больше." },
        { id: "send_notes", label: "Дать конспект", description: "Помочь, но не тратить весь вечер.", effects: { social: 1, discipline: 1 }, resultText: "Конспект помог частично." },
      ],
    },
    {
      id: "school_teacher_praise",
      category: "school",
      title: "Похвала учителя",
      description: "Учитель отмечает вашу работу перед классом.",
      minAge: 7,
      maxAge: 17,
      baseWeight: 8,
      conditions: { minStats: { grades: 20 } },
      weightModifiers: [{ stat: "grades", gte: 60, add: 5 }],
      options: [
        { id: "accept", label: "Поблагодарить", description: "Спокойно принять признание.", effects: { happiness: 3, reputation: 2, discipline: 1 }, resultText: "Похвала укрепила уверенность." },
        { id: "joke", label: "Отшутиться", description: "Снять внимание шуткой.", effects: { social: 2, happiness: 1, reputation: -1 }, resultText: "Класс улыбнулся, но учитель ждал большей серьезности." },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
