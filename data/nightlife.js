(() => {
  // Nightlife outings (18+ only). Each is a self-contained game activity that
  // maps to a Place type and carries cost/energy and an abstract risk profile.
  // Nothing here is graphic: "encounters" are social, consent-based, and the
  // engine only ever produces relationship/financial/health/reputation effects.

  const A = (id, title, placeType, cost, energy, fun, risk, tags = [], opts = {}) => ({
    id, title, placeType, cost, energy, fun,
    risk: { conflict: 0, health: 0, reputation: 0, legal: 0, pregnancy: 0, ...risk },
    tags: ["ночная жизнь", ...tags],
    minAge: 18,
    canMeet: opts.canMeet !== false, // whether a social encounter can occur
    encounterType: opts.encounterType || "acquaintance",
    adultOnly: Boolean(opts.adultOnly),
    description: opts.description || "",
  });

  const activities = {
    go_to_bar:            A("go_to_bar", "Сходить в бар", "bar", 25, 12, 10, { conflict: 6, health: 4 }, ["напитки"], { encounterType: "acquaintance" }),
    go_to_nightclub:      A("go_to_nightclub", "Сходить в ночной клуб", "nightclub", 45, 18, 14, { conflict: 10, health: 6, reputation: 4 }, ["танцы"], { encounterType: "date" }),
    go_to_lounge:         A("go_to_lounge", "Вечер в лаундже", "bar", 35, 10, 11, { conflict: 4, health: 2 }, ["отдых"], { encounterType: "acquaintance" }),
    go_to_concert:        A("go_to_concert", "Пойти на концерт", "nightclub", 55, 16, 16, { conflict: 3, health: 3 }, ["музыка"], { encounterType: "acquaintance" }),
    go_to_festival:       A("go_to_festival", "Городской фестиваль", "park", 40, 20, 17, { conflict: 4, health: 5, reputation: 2 }, ["музыка"], { encounterType: "acquaintance" }),
    go_to_karaoke:        A("go_to_karaoke", "Караоке с компанией", "bar", 30, 12, 13, { conflict: 3, health: 2 }, ["вечеринка"], { encounterType: "friend" }),
    go_to_casino:         A("go_to_casino", "Вечер в казино 18+", "casino_18_plus", 80, 10, 9, { conflict: 6, health: 2, reputation: 6, legal: 2 }, ["риск", "18+"], { encounterType: "acquaintance", adultOnly: true, description: "Азартная и затратная ночная ветка." }),
    go_to_strip_club_18_plus: A("go_to_strip_club_18_plus", "Заведение 18+", "strip_club_18_plus", 70, 12, 8, { conflict: 8, health: 3, reputation: 8 }, ["18+", "взрослая ветка"], { encounterType: "acquaintance", adultOnly: true, canMeet: false, description: "Взрослая ночная ветка без откровенного контента." }),
    go_to_adult_party_18_plus: A("go_to_adult_party_18_plus", "Взрослая вечеринка 18+", "nightclub", 50, 18, 12, { conflict: 12, health: 8, reputation: 8, pregnancy: 4 }, ["18+", "взрослая ветка"], { encounterType: "hookup_18_plus", adultOnly: true, description: "Рискованная взрослая ночная ветка." }),
    go_to_dating_event:   A("go_to_dating_event", "Вечер знакомств 18+", "dating_venue_18_plus", 35, 10, 11, { conflict: 4, health: 1 }, ["знакомства", "18+"], { encounterType: "date", adultOnly: true, description: "Площадка для знакомств для взрослых." }),
  };

  window.GameNightlifeData = { activities };
})();
