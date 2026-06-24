(() => {
  // Catalog of concrete place TYPES the world can contain. Each entry describes
  // how a place of that type behaves and reads. Adult-only venues are flagged
  // and are only ever surfaced to 18+ characters by the engines/UI.
  //
  // A live Place instance (created by placesEngine) is shaped:
  // { id, name, type, country, city, district, costLevel, prestige, safety,
  //   popularity, tags[], npcIds[], eventTags[] }

  const A18 = true; // readability flag for adult-only types

  const types = {
    school:            { label: "Школа",              category: "education", base: { costLevel: 0, prestige: 40, safety: 70, popularity: 55 }, tags: ["учёба"] },
    college:           { label: "Колледж",            category: "education", base: { costLevel: 2, prestige: 50, safety: 66, popularity: 50 }, tags: ["учёба"] },
    university:        { label: "Университет",         category: "education", base: { costLevel: 3, prestige: 70, safety: 68, popularity: 60 }, tags: ["учёба"] },
    workplace:         { label: "Рабочее место",       category: "work",      base: { costLevel: 0, prestige: 50, safety: 72, popularity: 40 }, tags: ["работа"] },
    companyOffice:     { label: "Офис компании",       category: "work",      base: { costLevel: 0, prestige: 58, safety: 74, popularity: 45 }, tags: ["работа"] },
    business_location: { label: "Своё дело",           category: "work",      base: { costLevel: 2, prestige: 52, safety: 66, popularity: 50 }, tags: ["бизнес"] },
    hospital:          { label: "Больница",            category: "health",    base: { costLevel: 1, prestige: 55, safety: 78, popularity: 50 }, tags: ["здоровье"] },
    clinic:            { label: "Клиника",             category: "health",    base: { costLevel: 2, prestige: 58, safety: 80, popularity: 45 }, tags: ["здоровье"] },
    gym:               { label: "Спортзал",            category: "leisure",   base: { costLevel: 2, prestige: 48, safety: 74, popularity: 60 }, tags: ["спорт"] },
    park:              { label: "Парк",                category: "leisure",   base: { costLevel: 0, prestige: 42, safety: 64, popularity: 70 }, tags: ["отдых"] },
    cafe:              { label: "Кафе",                category: "leisure",   base: { costLevel: 1, prestige: 46, safety: 70, popularity: 66 }, tags: ["встречи"] },
    mall:              { label: "Торговый центр",      category: "leisure",   base: { costLevel: 2, prestige: 50, safety: 68, popularity: 72 }, tags: ["покупки"] },
    bar:               { label: "Бар",                 category: "nightlife", base: { costLevel: 2, prestige: 48, safety: 56, popularity: 64 }, tags: ["ночная жизнь"], minAge: 18 },
    nightclub:         { label: "Ночной клуб",         category: "nightlife", base: { costLevel: 3, prestige: 54, safety: 48, popularity: 74 }, tags: ["ночная жизнь"], minAge: 18 },
    apartment_building:{ label: "Жилой дом",           category: "living",    base: { costLevel: 2, prestige: 50, safety: 66, popularity: 40 }, tags: ["жильё"] },
    police_station:    { label: "Полицейский участок", category: "civic",     base: { costLevel: 0, prestige: 50, safety: 88, popularity: 20 }, tags: ["право"] },
    courthouse:        { label: "Суд",                 category: "civic",     base: { costLevel: 0, prestige: 60, safety: 84, popularity: 18 }, tags: ["право"] },
    online_platform:   { label: "Онлайн-платформа",     category: "online",    base: { costLevel: 0, prestige: 45, safety: 60, popularity: 80 }, tags: ["онлайн"] },
    // ---- adult-only (18+) venues — surfaced only to adults ----
    casino_18_plus:        { label: "Казино 18+",            category: "nightlife", base: { costLevel: 3, prestige: 52, safety: 44, popularity: 60 }, tags: ["ночная жизнь", "риск", "18+"], minAge: 18, adultOnly: A18 },
    strip_club_18_plus:    { label: "Клуб 18+",              category: "nightlife", base: { costLevel: 3, prestige: 40, safety: 42, popularity: 56 }, tags: ["ночная жизнь", "18+", "взрослая ветка"], minAge: 18, adultOnly: A18 },
    dating_venue_18_plus:  { label: "Площадка для свиданий 18+", category: "nightlife", base: { costLevel: 2, prestige: 50, safety: 58, popularity: 62 }, tags: ["знакомства", "18+"], minAge: 18, adultOnly: A18 },
  };

  // Localized-ish name pools per type (self-authored, not from any other game).
  const namePools = {
    school:            ["Школа №{n}", "Гимназия «Восход»", "Лицей «Перспектива»", "Школа «Радуга»"],
    college:           ["Колледж «Профиль»", "Технический колледж", "Колледж «Старт»"],
    university:        ["Городской университет", "Политехнический университет", "Университет «Прогресс»", "Открытый университет"],
    workplace:         ["Отдел", "Производство", "Площадка", "Команда"],
    companyOffice:     ["Главный офис", "Бизнес-центр «Меридиан»", "Офис «Сфера»"],
    business_location: ["Своя точка", "Мастерская", "Студия", "Павильон"],
    hospital:          ["Городская больница №{n}", "Областная больница", "Клиническая больница"],
    clinic:            ["Клиника «Здоровье»", "Медцентр «Аврора»", "Поликлиника №{n}"],
    gym:               ["Фитнес-клуб «Энергия»", "Зал «Атлет»", "Студия «Тонус»"],
    park:              ["Центральный парк", "Парк «Тополя»", "Набережная", "Сквер «Ясный»"],
    cafe:              ["Кафе «Уют»", "Кофейня «Зерно»", "Бистро «Перерыв»", "Кафе «Окна»"],
    mall:              ["ТЦ «Галерея»", "ТЦ «Атриум»", "ТЦ «Орбита»"],
    bar:               ["Бар «Гавань»", "Паб «Якорь»", "Бар «Полночь»"],
    nightclub:         ["Клуб «Пульс»", "Клуб «Неон»", "Клуб «Вектор»"],
    apartment_building:["Дом на улице Светлой", "ЖК «Парус»", "Дом у реки"],
    police_station:    ["Отделение полиции №{n}", "Городской участок"],
    courthouse:        ["Городской суд", "Районный суд"],
    online_platform:   ["Онлайн-сервис «Связь»", "Платформа «Поток»", "Сеть «Контур»"],
    casino_18_plus:        ["Казино «Фортуна» 18+", "Зал «Джекпот» 18+"],
    strip_club_18_plus:    ["Клуб «Вечер» 18+", "Заведение «Бархат» 18+"],
    dating_venue_18_plus:  ["Вечер знакомств 18+", "Speed-dating «Искра» 18+"],
  };

  const districts = ["Центр", "Северный", "Южный", "Заречный", "Старый город", "Новый район", "Приморский"];

  // The default public venues every city is seeded with on life start.
  const defaultCityVenues = [
    "park", "mall", "cafe", "gym", "clinic", "hospital",
    "police_station", "courthouse", "online_platform",
    "bar", "nightclub",
  ];

  window.GamePlacesData = { types, namePools, districts, defaultCityVenues };
})();
