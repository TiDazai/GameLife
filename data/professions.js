(() => {
const professions = {
  none: { name: "Нет профессии", salary: 0, knowledge: 0, social: 0, stress: 0 },
  service: { name: "Сервис и продажи", salary: 900, knowledge: 18, social: 20, stress: 12 },
  trade: { name: "Ремесло", salary: 1050, knowledge: 24, social: 12, stress: 10 },
  it: { name: "IT-специалист", salary: 1850, knowledge: 56, social: 12, stress: 18 },
  medicine: { name: "Медицина", salary: 1650, knowledge: 70, social: 22, stress: 28 },
  engineering: { name: "Инженерия", salary: 1700, knowledge: 62, social: 10, stress: 18 },
  education: { name: "Образование", salary: 1100, knowledge: 48, social: 26, stress: 15 },
  art: { name: "Творчество", salary: 950, knowledge: 30, social: 32, stress: 16 },
  finance: { name: "Финансы", salary: 1800, knowledge: 58, social: 25, stress: 25 },
};

const certificateCatalog = {
  language: { name: "Международный язык", cost: 900, knowledge: 30, social: 12, skill: "language", reputation: 3 },
  digital: { name: "Цифровая профессия", cost: 1300, knowledge: 44, social: 8, skill: "logic", reputation: 4 },
  management: { name: "Управление", cost: 1600, knowledge: 38, social: 34, skill: "leadership", reputation: 5 },
  finance: { name: "Финансовая грамотность", cost: 1100, knowledge: 36, social: 10, skill: "finance", reputation: 4 },
  craft: { name: "Практическая квалификация", cost: 950, knowledge: 26, social: 8, skill: "craft", reputation: 3 },
};

const companySectors = {
  cafe: { name: "Кафе у дома", cost: 1600, knowledge: 18, social: 18, baseRevenue: 520, stress: 10 },
  studio: { name: "Дизайн-студия", cost: 2200, knowledge: 35, social: 26, baseRevenue: 760, stress: 12 },
  software: { name: "IT-продукт", cost: 3200, knowledge: 58, social: 18, baseRevenue: 1050, stress: 16 },
  workshop: { name: "Мастерская", cost: 1800, knowledge: 28, social: 14, baseRevenue: 620, stress: 11 },
  consulting: { name: "Консалтинг", cost: 2600, knowledge: 46, social: 42, baseRevenue: 900, stress: 14 },
};

  window.GameData = { ...(window.GameData || {}), professions, certificateCatalog, companySectors };
})();
