(() => {
  // Life goals chosen at character creation (or assigned randomly). Each goal has
  // milestones evaluated against state, progress 0..100, and a final score modifier.
  const lifeGoals = [
    {
      id: "wealth",
      title: "Финансовая свобода",
      description: "Сколотить состояние и обеспечить себя на всю жизнь.",
      category: "money",
      milestones: [
        { id: "first_savings", text: "Накопить первые сбережения", check: (s) => (s.personalMoney || 0) >= 5000 },
        { id: "investor", text: "Стать инвестором", check: (s) => (s.assets?.stocks || 0) + (s.assets?.deposits || 0) >= 20000 },
        { id: "millionaire", text: "Чистый капитал 1 000 000", check: (s) => (window.GameState?.netWorthFor?.(s) || 0) >= 1000000 },
      ],
      finalScoreModifier: 1.2,
    },
    {
      id: "family",
      title: "Крепкая семья",
      description: "Построить большую и дружную семью.",
      category: "family",
      milestones: [
        { id: "partner", text: "Найти партнёра", check: (s) => Boolean(s.relationship) },
        { id: "married", text: "Создать брак", check: (s) => Boolean(s.relationship?.married) },
        { id: "children", text: "Воспитать детей", check: (s) => (s.children || []).length >= 2 },
      ],
      finalScoreModifier: 1.15,
    },
    {
      id: "career",
      title: "Вершина карьеры",
      description: "Дорасти до самой верхушки профессии.",
      category: "career",
      milestones: [
        { id: "employed", text: "Устроиться на работу", check: (s) => s.career?.status === "employed" },
        { id: "senior", text: "Достичь высокого уровня", check: (s) => (s.careerLevel || 0) >= 4 },
        { id: "top", text: "Стать руководителем", check: (s) => (s.careerLevel || 0) >= 7 },
      ],
      finalScoreModifier: 1.15,
    },
    {
      id: "knowledge",
      title: "Большой учёный",
      description: "Посвятить жизнь знаниям и образованию.",
      category: "education",
      milestones: [
        { id: "school", text: "Хорошо учиться", check: (s) => (s.grades || 0) >= 70 },
        { id: "higher", text: "Получить высшее образование", check: (s) => s.educationLevel === "Высшее образование" },
        { id: "expert", text: "Стать экспертом", check: (s) => (s.knowledge || 0) >= 85 },
      ],
      finalScoreModifier: 1.1,
    },
    {
      id: "fame",
      title: "Слава и признание",
      description: "Стать известным на всю страну.",
      category: "lifestyle",
      milestones: [
        { id: "local", text: "Заявить о себе", check: (s) => (s.fame || 0) >= 30 },
        { id: "known", text: "Стать узнаваемым", check: (s) => (s.fame || 0) >= 60 },
        { id: "star", text: "Настоящая звезда", check: (s) => (s.fame || 0) >= 90 },
      ],
      finalScoreModifier: 1.1,
    },
    {
      id: "health",
      title: "Долгая здоровая жизнь",
      description: "Сохранить здоровье и дожить до глубокой старости.",
      category: "health",
      milestones: [
        { id: "fit", text: "Держать форму", check: (s) => (s.skills?.fitness || 0) >= 50 },
        { id: "balanced", text: "Душевное равновесие", check: (s) => (s.mental || 0) >= 70 && (s.stress || 100) <= 30 },
        { id: "longevity", text: "Дожить до 80 лет", check: (s) => (s.age || 0) >= 80 },
      ],
      finalScoreModifier: 1.1,
    },
    {
      id: "adventure",
      title: "Жизнь на полную",
      description: "Попробовать всё и нигде не задерживаться.",
      category: "lifestyle",
      milestones: [
        { id: "lively", text: "Высокий уровень жизни", check: (s) => (s.lifestyle || 0) >= 60 },
        { id: "social", text: "Большой круг общения", check: (s) => (s.network || 0) >= 50 },
        { id: "happy", text: "Прожить счастливо", check: (s) => (s.happiness || 0) >= 80 },
      ],
      finalScoreModifier: 1.05,
    },
    {
      id: "good",
      title: "Сделать мир добрее",
      description: "Прожить честную жизнь, помогая другим.",
      category: "civic",
      milestones: [
        { id: "kind", text: "Высокая карма", check: (s) => (s.karma || 0) >= 70 },
        { id: "trusted", text: "Доверие общества", check: (s) => (s.publicTrust || 0) >= 70 },
        { id: "clean", text: "Чистая репутация", check: (s) => (s.criminalRecord || 0) === 0 && (s.reputation || 0) >= 60 },
      ],
      finalScoreModifier: 1.1,
    },
  ];

  window.GameData = window.GameData || {};
  window.GameData.lifeGoals = lifeGoals;
})();
