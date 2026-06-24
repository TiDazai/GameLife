(() => {
  // Adult (18+) relationship actions. Consensual adults only. NON-GRAPHIC, fade-to-black.
  // No explicit content. These deepen an existing romantic relationship between adults.
  const adultRelationshipActions = [
    {
      id: "deep_talk",
      title: "Откровенный разговор",
      description: "Честно обсудить чувства, границы и ожидания.",
      requiresPartner: true,
      effects: { trust: 6, intimacy: 4, boundariesDiscussed: 1 },
      stateEffects: { mental: 2 },
      resultText: "Вы стали ближе и лучше понимаете друг друга.",
    },
    {
      id: "romantic_evening",
      title: "Романтический вечер",
      description: "Провести особенный вечер вдвоём (без подробностей).",
      requiresPartner: true,
      cost: { money: 60 },
      effects: { romance: 8, passion: 6, intimacy: 5 },
      stateEffects: { happiness: 4, stress: -3 },
      resultText: "Тёплый вечер укрепил вашу близость.",
    },
    {
      id: "discuss_protection",
      title: "Обсудить контрацепцию",
      description: "Ответственно поговорить о предохранении и здоровье.",
      requiresPartner: true,
      effects: { trust: 4, contraceptionDiscussed: 1, pregnancyRisk: -20 },
      resultText: "Вы договорились о разумных мерах предосторожности.",
    },
    {
      id: "plan_future",
      title: "Поговорить о будущем",
      description: "Обсудить совместные планы и семью.",
      requiresPartner: true,
      effects: { commitment: 8, sharedFuture: 6, familyPlans: 5 },
      stateEffects: { mental: 2 },
      resultText: "У вас появилось общее видение будущего.",
    },
    {
      id: "rebuild_trust",
      title: "Восстановить доверие",
      description: "Поработать над проблемами в отношениях.",
      requiresPartner: true,
      conditions: { minConflict: 30 },
      effects: { trust: 7, conflict: -10, jealousy: -8 },
      stateEffects: { stress: -2 },
      resultText: "Напряжение спало, доверие постепенно возвращается.",
    },
    {
      id: "spice_relationship",
      title: "Внести разнообразие",
      description: "Освежить отношения и страсть (без подробностей).",
      requiresPartner: true,
      effects: { passion: 9, intimacy: 5, sexualCompatibility: 6 },
      stateEffects: { happiness: 3 },
      resultText: "Между вами вновь вспыхнула искра.",
    },
  ];

  window.GameData = window.GameData || {};
  window.GameData.adultRelationshipActions = adultRelationshipActions;
})();
