(() => {
  // Company name pools and size bands per industry. The workplace engine uses
  // these to mint a concrete Company record when a character is hired.

  const sizes = [
    { id: "startup", label: "стартап", headcount: [4, 20], prestige: 44, salaryMult: 0.95 },
    { id: "smb", label: "небольшая компания", headcount: [20, 120], prestige: 50, salaryMult: 1.0 },
    { id: "midmarket", label: "средняя компания", headcount: [120, 800], prestige: 58, salaryMult: 1.08 },
    { id: "enterprise", label: "крупная компания", headcount: [800, 9000], prestige: 70, salaryMult: 1.18 },
  ];

  const namePoolsByIndustry = {
    it:               ["«Кодлайн»", "«Битфорж»", "«Нексус Софт»", "«Дата Лаб»", "«Стек Технологии»"],
    medicine:         ["Медцентр «Вита»", "Клиника «Аксон»", "«Здоровье Плюс»", "Госпиталь «Меридиан»"],
    engineering:      ["«ТехноПром»", "«ИнжСтрой»", "«Конструктор»", "«Энергомаш»"],
    finance:          ["«Капитал Групп»", "Банк «Опора»", "«ФинКонсалт»", "«Инвест Лайн»"],
    education:        ["Центр «Знание»", "Академия «Логос»", "«ЭдуЛаб»"],
    creativity:       ["Студия «Кадр»", "Агентство «Идея»", "«Медиаформат»", "«Артель»"],
    service:          ["Сеть «Сервис+»", "«ГородОк»", "«Комфорт»"],
    government:       ["Городская администрация", "Ведомство «Регион»", "Управление №{n}"],
    production:       ["Завод «Прогресс»", "Фабрика «Восток»", "«ПромЛиния»"],
    entrepreneurship: ["«Своё дело»", "«Старт Хаб»", "«Бизнес Лайн»"],
  };

  const defaultNames = ["«Компания»", "«Организация»", "«Группа»"];

  window.GameCareerData = { ...(window.GameCareerData || {}), companySizes: sizes, companyNamePools: namePoolsByIndustry, companyDefaultNames: defaultNames };
})();
