(() => {
  // Long multi-year story arcs. Each arc starts when startConditions are met, then
  // advances one step at a time. A step resolves by branch: the first branch whose
  // `when(state)` passes (or the default) is chosen, applying effects and narration.
  const storyArcs = [
    {
      id: "startup_dream",
      title: "Своё дело",
      description: "Путь от идеи до собственного бизнеса.",
      category: "career",
      startConditions: { minAge: 22, minStats: { knowledge: 30 }, minMoney: 2000 },
      steps: [
        {
          id: "idea", text: "У вас появилась бизнес-идея.",
          branches: [
            { when: (s) => (s.skills?.leadership || 0) >= 20, text: "Вы собрали команду единомышленников.", effects: { network: 5, reputation: 3 }, next: "launch" },
            { text: "Вы начали в одиночку, на энтузиазме.", effects: { stress: 6, knowledge: 3 }, next: "launch" },
          ],
        },
        {
          id: "launch", text: "Запуск проекта.",
          branches: [
            { when: (s) => (s.personalMoney || 0) >= 5000, text: "Стартовый капитал помог быстро вырасти.", effects: { reputation: 6, money: -3000, portfolio: 8 }, next: "scale" },
            { text: "Денег не хватало, рост был медленным.", effects: { stress: 8, money: -1000 }, next: "scale" },
          ],
        },
        {
          id: "scale", text: "Момент истины для бизнеса.",
          branches: [
            { when: (s) => (s.reputation || 0) >= 60, text: "Бизнес взлетел — вы добились успеха!", effects: { money: 30000, fame: 12, reputation: 8 }, end: "success" },
            { text: "Проект пришлось закрыть, но опыт бесценен.", effects: { knowledge: 6, stress: 6, reputation: -3 }, end: "failure" },
          ],
        },
      ],
      completionReward: { success: { happiness: 10 }, failure: { discipline: 4 } },
    },
    {
      id: "great_romance",
      title: "Большая любовь",
      description: "История отношений, которая может изменить жизнь.",
      category: "relationship",
      startConditions: { minAge: 18, requiredState: { relationship: true } },
      steps: [
        {
          id: "spark", text: "Отношения становятся серьёзными.",
          branches: [
            { when: (s) => (s.relationship?.trust || 0) >= 55, text: "Между вами растёт доверие.", effects: { happiness: 5, relationshipBond: 6 }, next: "test" },
            { text: "Вас одолевают сомнения.", effects: { stress: 4 }, next: "test" },
          ],
        },
        {
          id: "test", text: "Отношения проходят проверку.",
          branches: [
            { when: (s) => (s.relationship?.conflict || 0) <= 25, text: "Вы преодолели трудности вместе.", effects: { relationshipBond: 8, happiness: 4 }, next: "future" },
            { text: "Ссоры дали о себе знать.", effects: { relationshipConflict: 6, stress: 5 }, next: "future" },
          ],
        },
        {
          id: "future", text: "Время решать общее будущее.",
          branches: [
            { when: (s) => (s.relationship?.bond || 0) >= 65, text: "Вы построили крепкий союз.", effects: { happiness: 10, mental: 5 }, end: "success" },
            { text: "Пути разошлись.", effects: { happiness: -8, mental: -5 }, end: "failure" },
          ],
        },
      ],
      completionReward: { success: { mental: 6 }, failure: { discipline: 3 } },
    },
    {
      id: "self_improvement",
      title: "Путь к себе",
      description: "Долгая работа над собой и своими привычками.",
      category: "health",
      startConditions: { minAge: 16 },
      steps: [
        {
          id: "decision", text: "Вы решили серьёзно заняться собой.",
          branches: [
            { when: (s) => (s.discipline || 0) >= 40, text: "Дисциплина помогает держать курс.", effects: { fitness: 6, mental: 3 }, next: "habit" },
            { text: "Начинать оказалось трудно.", effects: { stress: 3, discipline: 3 }, next: "habit" },
          ],
        },
        {
          id: "habit", text: "Новые привычки укрепляются.",
          branches: [
            { when: (s) => (s.skills?.fitness || 0) >= 40, text: "Образ жизни заметно улучшился.", effects: { health: 8, energy: 6 }, next: "result" },
            { text: "Срывы случались, но вы не сдались.", effects: { discipline: 4, stress: 3 }, next: "result" },
          ],
        },
        {
          id: "result", text: "Итог работы над собой.",
          branches: [
            { when: (s) => (s.mental || 0) >= 65, text: "Вы обрели гармонию и силу.", effects: { mental: 10, happiness: 8 }, end: "success" },
            { text: "Прогресс есть, но путь продолжается.", effects: { discipline: 5 }, end: "failure" },
          ],
        },
      ],
      completionReward: { success: { health: 6 }, failure: {} },
    },
  ];

  window.GameData = window.GameData || {};
  window.GameData.storyArcs = storyArcs;
})();
