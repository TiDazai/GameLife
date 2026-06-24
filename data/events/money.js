(() => {
  const events = [
    {
      id: "money_subscription_leak",
      category: "money",
      title: "Незаметные списания",
      description: "Вы замечаете несколько подписок, которыми почти не пользуетесь.",
      minAge: 18,
      maxAge: 90,
      baseWeight: 7,
      conditions: {},
      weightModifiers: [{ stat: "finance", lte: 35, add: 5 }],
      options: [
        { id: "audit", label: "Проверить расходы", description: "Разобрать списания.", effects: { money: 180, finance: 2, discipline: 2, stress: -1 }, resultText: "Лишние траты удалось остановить." },
        { id: "ignore", label: "Не трогать", description: "Потом разберетесь.", effects: { money: -160, stress: 1 }, resultText: "Маленькие списания продолжили утекать." },
      ],
    },
    {
      id: "money_quick_profit_offer",
      category: "money",
      title: "Слишком быстрый доход",
      description: "Знакомый предлагает вложиться в схему с красивыми обещаниями.",
      minAge: 18,
      maxAge: 80,
      baseWeight: 6,
      conditions: { minStats: { personalMoney: 250 } },
      weightModifiers: [{ stat: "risk", gte: 65, add: 6 }],
      options: [
        { id: "decline", label: "Отказаться", description: "Не верить обещаниям без деталей.", effects: { finance: 2, stress: -2, karma: 1 }, resultText: "Вы избежали мутной истории." },
        { id: "invest", label: "Вложиться", description: "Рискнуть небольшой суммой.", effects: { money: -300, stress: 3, danger: 3 }, resultText: "Деньги ушли в ожидание результата.", risk: { chance: 0.35, effects: { money: -600, reputation: -3, stress: 6 }, resultText: "Предложение оказалось финансовой ошибкой." } },
      ],
    },
    {
      id: "money_unexpected_gig",
      category: "money",
      title: "Случайный заказ",
      description: "Появляется разовая возможность заработать на знакомом навыке.",
      minAge: 16,
      maxAge: 75,
      baseWeight: 8,
      conditions: {},
      weightModifiers: [{ stat: "knowledge", gte: 45, add: 4 }, { stat: "network", gte: 40, add: 4 }],
      options: [
        { id: "take", label: "Взять заказ", description: "Поработать сверх обычного.", effects: { money: 520, portfolio: 2, reputation: 1, stress: 4 }, resultText: "Заказ принес деньги и новый опыт." },
        { id: "pass", label: "Отказаться", description: "Не перегружать себя.", effects: { stress: -3, mental: 2 }, resultText: "Вы сохранили силы." },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
