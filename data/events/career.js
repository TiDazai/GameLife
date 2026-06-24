(() => {
  const events = [
    {
      id: "career_burnout_warning",
      category: "career",
      title: "Сигналы выгорания",
      description: "Работа стала занимать слишком много места, и тело просит паузу.",
      minAge: 18,
      maxAge: 70,
      baseWeight: 8,
      conditions: { minStats: { stress: 45 }, requiredState: { employed: true } },
      weightModifiers: [{ stat: "stress", gte: 70, add: 8 }],
      options: [
        { id: "slow_down", label: "Снизить темп", description: "Вернуть границы.", effects: { stress: -8, mental: 5, reputation: -1, careerBurnout: -12 }, resultText: "Темп стал здоровее, пусть и без рывка в карьере." },
        { id: "push", label: "Дожать проект", description: "Закрыть задачу любой ценой.", effects: { portfolio: 5, reputation: 3, stress: 8, health: -3, careerBurnout: 8 }, resultText: "Проект заметили, но усталость стала глубже.", risk: { chance: 0.25, effects: { mental: -6, danger: 4 }, resultText: "Перегрузка дала неприятный срыв." } },
      ],
    },
    {
      id: "career_promotion_offer",
      category: "career",
      title: "Предложение повышения",
      description: "Руководитель намекает на новую роль с большей ответственностью.",
      minAge: 20,
      maxAge: 68,
      baseWeight: 7,
      conditions: { minStats: { reputation: 10 }, requiredState: { employed: true }, blockedFlags: ["career_recent_promotion_refused"] },
      weightModifiers: [{ stat: "portfolio", gte: 45, add: 6 }, { stat: "network", gte: 45, add: 4 }],
      options: [
        { id: "accept", label: "Принять", description: "Взять больше ответственности.", effects: { careerPromotion: true, reputation: 4, stress: 6, creditScore: 1 }, resultText: "Карьерный уровень вырос, а календарь стал плотнее." },
        { id: "ask_time", label: "Попросить время", description: "Обсудить условия.", effects: { stress: -1, network: 2, flags: ["career_recent_promotion_refused"] }, resultText: "Вы не отказались, но взяли паузу на переговоры." },
      ],
    },
    {
      id: "career_public_mistake",
      category: "career",
      title: "Заметная ошибка",
      description: "На работе всплыла ошибка, которую видит команда.",
      minAge: 18,
      maxAge: 70,
      baseWeight: 6,
      conditions: { minStats: { stress: 25 }, requiredState: { employed: true } },
      weightModifiers: [{ stat: "stress", gte: 65, add: 6 }],
      options: [
        { id: "own", label: "Признать", description: "Исправить и объяснить.", effects: { reputation: 1, stress: 2, discipline: 2 }, resultText: "Ответственный подход снизил ущерб." },
        { id: "hide", label: "Скрыть", description: "Попробовать замять.", effects: { stress: 5, karma: -3 }, resultText: "Скрывать оказалось тяжелее, чем исправлять.", risk: { chance: 0.3, effects: { reputation: -6, stress: 6 }, resultText: "Ошибка все равно раскрылась." } },
      ],
    },
    {
      id: "career_mentor_invite",
      category: "career",
      title: "Разговор с ментором",
      description: "Опытный специалист готов разобрать вашу траекторию.",
      minAge: 18,
      maxAge: 65,
      baseWeight: 7,
      conditions: { minStats: { knowledge: 20 }, requiredState: { employed: true } },
      weightModifiers: [{ stat: "ambition", gte: 65, add: 5 }],
      options: [
        { id: "prepare", label: "Подготовиться", description: "Принести вопросы и цели.", effects: { knowledge: 4, network: 4, portfolio: 2, stress: 1 }, resultText: "Ментор помог увидеть следующий шаг." },
        { id: "casual", label: "Поговорить свободно", description: "Без плана и напряжения.", effects: { social: 2, stress: -1, knowledge: 1 }, resultText: "Встреча была приятной, но менее предметной." },
      ],
    },
    {
      id: "career_market_shift",
      category: "career",
      title: "Рынок меняется",
      description: "В вашей сфере появляются новые требования.",
      minAge: 18,
      maxAge: 70,
      baseWeight: 6,
      conditions: {},
      weightModifiers: [{ stat: "knowledge", lte: 45, add: 5 }],
      options: [
        { id: "learn", label: "Учиться", description: "Освоить новый инструмент.", effects: { knowledge: 5, logic: 2, stress: 3, portfolio: 2 }, resultText: "Вы обновили профессиональный профиль." },
        { id: "wait", label: "Подождать", description: "Не дергаться раньше времени.", effects: { stress: -1, reputation: -1 }, resultText: "Пока все спокойно, но требования никуда не исчезли." },
      ],
    },
  ];

  window.GameEventData = [...(window.GameEventData || []), ...events];
})();
