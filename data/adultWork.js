(() => {
  // Adult work / risky branch (18+ only). This is an ABSTRACT game career/social
  // route, modeled purely through numbers and consequences: income, safety,
  // discretion, and legal/reputation/health/stress risk. There is NO explicit,
  // pornographic, or instructional content anywhere — only game effects. The
  // whole branch is hidden from and unavailable to anyone under 18.

  const type = (id, title, incomeRange, baseSafety, baseDiscretion, reputationRisk, legalRisk, healthRisk, stressPerYear, placeTypes, tags, description) => ({
    id, title, incomeRange, baseSafety, baseDiscretion, reputationRisk, legalRisk, healthRisk, stressPerYear, placeTypes, tags, description, minAge: 18,
  });

  const types = {
    club_host: type(
      "club_host", "Хостес / промоутер 18+", [600, 1600], 70, 65, 3, 1, 2, 5,
      ["bar", "nightclub"], ["взрослая ветка", "ночная жизнь"],
      "Работа в ночном заведении: общение с гостями, продвижение. Наименее рискованная ветка."
    ),
    dancer_18_plus: type(
      "dancer_18_plus", "Танцовщица / танцор 18+", [900, 2400], 60, 55, 6, 2, 4, 8,
      ["nightclub", "strip_club_18_plus"], ["взрослая ветка", "18+"],
      "Сценические выступления для взрослой аудитории. Без откровенного контента в игре."
    ),
    adult_performer_abstract: type(
      "adult_performer_abstract", "Взрослый контент онлайн (абстрактно)", [800, 3500], 75, 40, 12, 3, 4, 9,
      ["online_platform"], ["взрослая ветка", "18+", "онлайн"],
      "Абстрактная онлайн-ветка для взрослых. Высокий риск для репутации, контент в игре не показывается."
    ),
    escort_18_plus: type(
      "escort_18_plus", "Эскорт-сопровождение 18+", [1500, 5000], 45, 50, 14, 8, 9, 12,
      ["dating_venue_18_plus", "bar"], ["взрослая ветка", "18+", "риск"],
      "Платное сопровождение. Высокий доход и высокий правовой/репутационный/медицинский риск."
    ),
    sex_worker_18_plus: type(
      "sex_worker_18_plus", "Секс-работа 18+", [1800, 6000], 35, 45, 18, 12, 12, 16,
      ["dating_venue_18_plus"], ["взрослая ветка", "18+", "риск"],
      "Самая рискованная взрослая ветка: максимальный доход и максимальные правовые и медицинские риски."
    ),
  };

  const stageLabels = ["новичок", "освоился", "устойчиво", "опытный"];

  // Abstract incidents the engine may roll each year while active. Each carries
  // only numeric/relationship game effects — never explicit content.
  const incidents = [
    { id: "good_week", title: "Удачный период", weight: 24, effect: { incomeMult: 1.25, network: 4 } },
    { id: "regular_client", title: "Постоянный клиент", weight: 18, effect: { incomeMult: 1.15, network: 6, addClient: true } },
    { id: "burnout_spell", title: "Сильная усталость", weight: 16, effect: { stress: 10, health: -4 } },
    { id: "reputation_leak", title: "Слух разошёлся", weight: 12, effect: { reputationHit: 8, exposed: true } },
    { id: "health_scare", title: "Проблема со здоровьем", weight: 10, effect: { health: -8, stress: 6 } },
    { id: "legal_trouble", title: "Внимание со стороны закона", weight: 9, effect: { legalCase: true, stress: 10 } },
    { id: "unsafe_situation", title: "Небезопасная ситуация", weight: 8, effect: { health: -6, stress: 12, safety: -6 } },
    { id: "savings_jump", title: "Хорошие накопления", weight: 8, effect: { incomeMult: 1.4 } },
    { id: "supportive_contact", title: "Полезное знакомство", weight: 7, effect: { network: 8, discretion: 4 } },
    { id: "partner_suspicion", title: "Подозрения партнёра", weight: 6, effect: { partnerConflict: true } },
    { id: "exit_offer", title: "Шанс выйти из ветки", weight: 5, effect: { exitOffer: true } },
  ];

  window.GameAdultWorkData = { types, stageLabels, incidents };
})();
