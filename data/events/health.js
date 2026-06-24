(() => {
  const events = [
    {
      id: "health_minor_injury",
      category: "health",
      title: "Неловкая травма",
      description: "Обычный день заканчивается ушибом и неприятной болью.",
      minAge: 8,
      maxAge: 85,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "health", lte: 50, add: 4 }, { stat: "stress", gte: 65, add: 3 }],
      options: [
        { id: "treat", label: "Заняться лечением", description: "Не запускать травму.", effects: { health: 4, money: -180, stress: -1 }, resultText: "Травма быстро пошла на спад." },
        { id: "ignore", label: "Перетерпеть", description: "Не тратить время и деньги.", effects: { health: -3, stress: 3 }, resultText: "Боль мешала дольше, чем хотелось.", risk: { chance: 0.2, effects: { health: -4, energy: -3 }, resultText: "Самочувствие ухудшилось." } },
      ],
    },
    {
      id: "health_anxiety_period",
      category: "health",
      title: "Тревожный период",
      description: "Несколько недель мысли крутятся вокруг будущего и ошибок.",
      minAge: 12,
      maxAge: 90,
      baseWeight: 8,
      conditions: { minStats: { stress: 35 } },
      weightModifiers: [{ stat: "mental", lte: 45, add: 8 }, { stat: "stress", gte: 70, add: 5 }],
      options: [
        { id: "talk", label: "Поговорить с кем-то", description: "Не оставаться одному с тревогой.", effects: { mental: 6, stress: -5, empathy: 1, social: 1, removeHealthCondition: "anxiety_period" }, resultText: "Разговор помог вернуть почву под ногами." },
        { id: "hide", label: "Скрывать", description: "Делать вид, что все нормально.", effects: { mental: -4, stress: 4, energy: -2, addHealthCondition: "anxiety_period" }, resultText: "Снаружи все выглядело спокойно, но внутри стало тяжелее." },
      ],
    },
    {
      id: "health_panic_attack_event",
      category: "health",
      title: "Резкая волна тревоги",
      description: "Внезапно становится трудно собраться: тело реагирует быстрее, чем мысли.",
      minAge: 12,
      maxAge: 90,
      baseWeight: 5,
      conditions: { minStats: { stress: 65 }, maxStats: { mental: 65 }, noHealthCondition: "panic_attack" },
      weightModifiers: [{ stat: "sleep", lte: 45, add: 5 }, { stat: "stress", gte: 80, add: 6 }],
      options: [
        { id: "ground", label: "Заземлиться", description: "Дыхание, вода, тихое место.", effects: { stress: -6, mental: 3, sleep: 2 }, resultText: "Волна постепенно прошла, день стал тише." },
        { id: "push", label: "Дожать дела", description: "Игнорировать сигнал.", effects: { addHealthCondition: "panic_attack", stress: 4, energy: -4, mental: -3 }, resultText: "Получилось продолжить, но состояние закрепилось." },
      ],
    },
    {
      id: "health_good_routine",
      category: "health",
      title: "Неделя здорового режима",
      description: "Появляется шанс наладить сон, еду и движение без резких перемен.",
      minAge: 10,
      maxAge: 90,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "discipline", gte: 55, add: 4 }, { stat: "health", lte: 60, add: 4 }],
      options: [
        { id: "build", label: "Встроить режим", description: "Пойти маленькими шагами.", effects: { health: 5, energy: 4, stress: -3, fitness: 2 }, resultText: "Режим оказался проще, чем казался." },
        { id: "later", label: "Отложить", description: "Вернуться, когда будет больше сил.", effects: { happiness: 1, discipline: -1 }, resultText: "Вы не стали менять привычки сейчас." },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
