const rub = new Intl.NumberFormat("ru-RU");

const els = {
  subtitle: document.getElementById("subtitle"),
  stats: document.getElementById("stats"),
  tabs: document.getElementById("tabs"),
  notice: document.getElementById("notice"),
  content: document.getElementById("content"),
  endYear: document.getElementById("endDayButton"),
  save: document.getElementById("saveButton"),
  load: document.getElementById("loadButton"),
  reset: document.getElementById("resetButton"),
};

const tabs = [
  ["life", "Жизнь"],
  ["activities", "Активности"],
  ["family", "Семья"],
  ["world", "Мир"],
  ["education", "Учеба"],
  ["career", "Карьера"],
  ["health", "Здоровье"],
  ["skills", "Навыки"],
  ["money", "Деньги"],
  ["home", "Дом"],
  ["assets", "Активы"],
  ["business", "Компания"],
  ["relationships", "Отношения"],
  ["docs", "Документы"],
  ["report", "Сводка"],
];

const countries = {
  ru: {
    name: "Россия",
    currency: "₽",
    cities: {
      moscow: { name: "Москва", cost: 1.28, salary: 1.35, education: 78, safety: 64, opportunity: 86, housing: 1400 },
      kazan: { name: "Казань", cost: 0.88, salary: 0.92, education: 72, safety: 72, opportunity: 66, housing: 760 },
      novosibirsk: { name: "Новосибирск", cost: 0.82, salary: 0.86, education: 68, safety: 61, opportunity: 62, housing: 690 },
    },
  },
  de: {
    name: "Германия",
    currency: "€",
    cities: {
      berlin: { name: "Берлин", cost: 1.58, salary: 1.72, education: 88, safety: 82, opportunity: 84, housing: 2100 },
      munich: { name: "Мюнхен", cost: 1.9, salary: 1.95, education: 91, safety: 87, opportunity: 88, housing: 2800 },
    },
  },
  jp: {
    name: "Япония",
    currency: "¥",
    cities: {
      tokyo: { name: "Токио", cost: 1.74, salary: 1.82, education: 92, safety: 90, opportunity: 91, housing: 2500 },
      osaka: { name: "Осака", cost: 1.28, salary: 1.35, education: 86, safety: 86, opportunity: 74, housing: 1550 },
    },
  },
  us: {
    name: "США",
    currency: "$",
    cities: {
      nyc: { name: "Нью-Йорк", cost: 2.1, salary: 2.25, education: 90, safety: 67, opportunity: 96, housing: 3400 },
      austin: { name: "Остин", cost: 1.34, salary: 1.58, education: 82, safety: 72, opportunity: 88, housing: 1750 },
    },
  },
  se: {
    name: "Швеция",
    currency: "kr",
    cities: {
      stockholm: { name: "Стокгольм", cost: 1.72, salary: 1.82, education: 93, safety: 89, opportunity: 83, housing: 2400 },
      gothenburg: { name: "Гетеборг", cost: 1.38, salary: 1.48, education: 88, safety: 86, opportunity: 72, housing: 1700 },
    },
  },
};

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

const budgetModes = {
  strict: { name: "Жесткая экономия", cost: 0.78, happiness: -4, discipline: 4, stress: 2, credit: 2 },
  balanced: { name: "Баланс", cost: 1, happiness: 0, discipline: 1, stress: 0, credit: 1 },
  growth: { name: "Рост", cost: 1.12, happiness: 1, discipline: 2, stress: 2, credit: 0 },
  comfort: { name: "Комфорт", cost: 1.28, happiness: 5, discipline: -1, stress: -2, credit: -1 },
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

const skillCatalog = {
  logic: { name: "Логика", text: "Математика, системное мышление, сложные решения.", childhood: "Головоломки" },
  creativity: { name: "Творчество", text: "Идеи, дизайн, музыка, тексты, нестандартные ходы.", childhood: "Рисование" },
  empathy: { name: "Эмпатия", text: "Понимание людей, семья, переговоры, команда.", childhood: "Помощь" },
  fitness: { name: "Форма", text: "Тело, энергия, устойчивость к стрессу.", childhood: "Спорт" },
  finance: { name: "Финансы", text: "Бюджет, инвестиции, налоги, бизнес-модель.", childhood: "Копилка" },
  language: { name: "Языки", text: "Переезд, международная карьера, учеба за границей.", childhood: "Слова" },
  craft: { name: "Ремесло", text: "Практические навыки, производство, ремонт, мастерство.", childhood: "Конструктор" },
  leadership: { name: "Лидерство", text: "Команды, карьера, компания, публичность.", childhood: "Организовать" },
};

const housingCatalog = {
  parents: { name: "У родителей", annual: 0, buy: 0, quality: 55, happiness: 0, stress: 0, minAge: 0 },
  room: { name: "Комната", annual: 900, buy: 0, quality: 38, happiness: -1, stress: 3, minAge: 18 },
  studio: { name: "Студия", annual: 1700, buy: 0, quality: 56, happiness: 3, stress: 1, minAge: 18 },
  apartment: { name: "Квартира в аренду", annual: 2900, buy: 0, quality: 70, happiness: 5, stress: 0, minAge: 20 },
  ownedFlat: { name: "Своя квартира", annual: 900, buy: 14500, quality: 82, happiness: 8, stress: -3, minAge: 22 },
  house: { name: "Дом", annual: 1600, buy: 28000, quality: 94, happiness: 12, stress: -4, minAge: 28 },
};

const possessionCatalog = {
  books: { name: "Домашняя библиотека", cost: 450, text: "Знания растут быстрее каждый год.", bonus: "knowledge" },
  laptop: { name: "Хороший ноутбук", cost: 1200, text: "Фриланс, учеба и IT-навыки становятся сильнее.", bonus: "logic" },
  bike: { name: "Велосипед", cost: 600, text: "Здоровье и мобильность без больших расходов.", bonus: "fitness" },
  car: { name: "Автомобиль", cost: 4200, text: "Больше удобства, но выше годовые расходы.", bonus: "mobility" },
  tools: { name: "Набор инструментов", cost: 850, text: "Ремесло, ремонт и мастерская развиваются быстрее.", bonus: "craft" },
};

const names = {
  male: ["Алексей", "Иван", "Михаил", "Даниил", "Сергей", "Никита", "Артем", "Виктор"],
  female: ["Анна", "Мария", "Елена", "Ольга", "София", "Ирина", "Алиса", "Наталья"],
  last: ["Смирнов", "Иванов", "Кузнецов", "Попов", "Соколов", "Лебедев", "Новиков"],
};

const baseState = {
  age: 0,
  year: 2026,
  tab: "life",
  country: "ru",
  city: "kazan",
  livingWithParents: true,
  personalMoney: 0,
  familyMoney: 1800,
  debt: 0,
  actions: 3,
  maxActions: 3,
  health: 82,
  happiness: 76,
  knowledge: 0,
  social: 0,
  discipline: 6,
  stress: 4,
  mental: 78,
  energy: 72,
  looks: 55,
  fame: 0,
  karma: 50,
  criminalRecord: 0,
  lifestyle: 48,
  taxableIncome: 0,
  taxesPaid: 0,
  taxDebt: 0,
  grades: 0,
  educationLevel: "Детство",
  profession: "none",
  job: null,
  salary: 0,
  careerLevel: 0,
  experience: 0,
  reputation: 0,
  portfolio: 0,
  network: 0,
  certificates: [],
  budgetMode: "balanced",
  creditScore: 55,
  emergencyFundTarget: 3,
  relationship: null,
  children: [],
  company: null,
  housing: "parents",
  possessions: [],
  assets: {
    deposits: 0,
    stocks: 0,
    pension: 0,
    property: 0,
  },
  skills: {
    logic: 0,
    creativity: 0,
    empathy: 0,
    fitness: 0,
    finance: 0,
    language: 0,
    craft: 0,
    leadership: 0,
  },
  traits: {
    curiosity: 50,
    risk: 50,
    kindness: 50,
    ambition: 50,
  },
  documents: {
    birthCertificate: true,
    passport: false,
    taxId: false,
    driverLicense: false,
    workPermit: true,
    insurance: "family",
    visas: [],
  },
  event: null,
  message: "",
  family: [],
  log: [],
};

let state = createNewLife();

function createNewLife() {
  const st = JSON.parse(JSON.stringify(baseState));
  const countryKeys = Object.keys(countries);
  st.country = pick(countryKeys);
  st.city = pick(Object.keys(countries[st.country].cities));
  const last = pick(names.last);
  const playerGender = Math.random() > 0.5 ? "male" : "female";
  const fatherAge = 25 + roll(15);
  const motherAge = 23 + roll(13);
  st.family = [
    person("player", "Вы", "Главный герой", playerGender, 0, true, "Ребенок", 100),
    person("mother", pick(names.female), "Мама", "female", motherAge, true, randomParentJob(), 72 + roll(18)),
    person("father", pick(names.male), "Папа", "male", fatherAge, true, randomParentJob(), 62 + roll(24)),
    person("grandma1", pick(names.female), "Бабушка", "female", motherAge + 24 + roll(10), true, "Пенсионер", 45 + roll(30)),
    person("grandpa1", pick(names.male), "Дедушка", "male", motherAge + 25 + roll(12), true, "Пенсионер", 40 + roll(30)),
  ];
  st.lastName = last;
  st.familyMoney = 1200 + householdIncome(st) * 0.5;
  st.traits = {
    curiosity: 35 + roll(45),
    risk: 25 + roll(55),
    kindness: 35 + roll(45),
    ambition: 25 + roll(55),
  };
  st.skills.empathy = Math.floor((st.traits.kindness + livingParentCountFor(st) * 8) / 12);
  st.skills.logic = Math.floor(st.traits.curiosity / 14);
  st.log = [
    `0 лет: вы родились в городе ${cityName(st)} (${countryName(st)}).`,
    `Семья ${last}: мама и папа начинают с разными доходами, характером и запасом отношений.`,
  ];
  return st;
}

function normalizeState(st) {
  const fresh = JSON.parse(JSON.stringify(baseState));
  const merged = { ...fresh, ...st };
  merged.assets = { ...fresh.assets, ...(st.assets || {}) };
  merged.skills = { ...fresh.skills, ...(st.skills || {}) };
  merged.traits = { ...fresh.traits, ...(st.traits || {}) };
  merged.documents = { ...fresh.documents, ...(st.documents || {}) };
  merged.possessions = Array.isArray(st.possessions) ? st.possessions : [];
  merged.certificates = Array.isArray(st.certificates) ? st.certificates : [];
  merged.budgetMode = budgetModes[st.budgetMode] ? st.budgetMode : "balanced";
  merged.creditScore = clamp(Number.isFinite(st.creditScore) ? st.creditScore : 55, 0, 100);
  merged.portfolio = clamp(Number.isFinite(st.portfolio) ? st.portfolio : 0, 0, 100);
  merged.network = clamp(Number.isFinite(st.network) ? st.network : 0, 0, 100);
  merged.looks = clamp(Number.isFinite(st.looks) ? st.looks : 55, 0, 100);
  merged.fame = clamp(Number.isFinite(st.fame) ? st.fame : 0, 0, 100);
  merged.karma = clamp(Number.isFinite(st.karma) ? st.karma : 50, 0, 100);
  merged.criminalRecord = Math.max(0, Number.isFinite(st.criminalRecord) ? st.criminalRecord : 0);
  merged.housing = st.housing || (st.livingWithParents ? "parents" : "room");
  if (merged.relationship) {
    merged.relationship = {
      trust: 45,
      romance: 45,
      conflict: 10,
      sharedBudget: false,
      ...merged.relationship,
    };
  }
  if (merged.company) {
    merged.company = {
      marketing: 0,
      quality: 0,
      automation: 0,
      branches: 0,
      debt: 0,
      ...merged.company,
    };
  }
  merged.children = Array.isArray(st.children)
    ? st.children.map((child) => ({ education: 0, talent: 35 + roll(40), ...child }))
    : [];
  merged.family = Array.isArray(st.family) && st.family.length ? st.family : fresh.family;
  merged.log = Array.isArray(st.log) ? st.log : [];
  return merged;
}

function person(id, name, role, gender, age, alive, job, bond) {
  return { id, name, role, gender, age, alive, job, bond, health: 65 + roll(30) };
}

function randomParentJob() {
  return pick(["учитель", "инженер", "водитель", "медсестра", "повар", "менеджер", "мастер", "бухгалтер"]);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function roll(max) {
  return Math.floor(Math.random() * max);
}

function fmt(value) {
  const symbol = countries[state.country]?.currency || "₽";
  const amount = rub.format(Math.floor(value));
  if (symbol === "$" || symbol === "€" || symbol === "¥") return `${symbol}${amount}`;
  return `${amount} ${symbol}`;
}

function ageText(age) {
  const mod10 = age % 10;
  const mod100 = age % 100;
  if (mod10 === 1 && mod100 !== 11) return `${age} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${age} года`;
  return `${age} лет`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cityData(st = state) {
  return countries[st.country].cities[st.city];
}

function cityName(st = state) {
  return cityData(st).name;
}

function countryName(st = state) {
  return countries[st.country].name;
}

function player() {
  return state.family.find((item) => item.id === "player");
}

function livingParentCount() {
  return state.family.filter((item) => (item.id === "mother" || item.id === "father") && item.alive).length;
}

function livingParentCountFor(st) {
  return st.family.filter((item) => (item.id === "mother" || item.id === "father") && item.alive).length;
}

function housingData() {
  return housingCatalog[state.housing] || housingCatalog.parents;
}

function netWorth() {
  const property = state.housing === "ownedFlat" || state.housing === "house" ? housingData().buy : 0;
  return Math.floor(
    state.personalMoney +
      state.assets.deposits +
      state.assets.stocks +
      state.assets.pension * 0.65 +
      state.assets.property +
      property +
      (state.company ? state.company.cash + state.company.level * 1800 + state.company.reputation * 70 : 0) -
      state.debt
  );
}

function countryTaxRate() {
  const rates = { ru: 0.13, de: 0.24, jp: 0.19, us: 0.22, se: 0.27 };
  return rates[state.country] || 0.18;
}

function addIncome(amount) {
  state.personalMoney += amount;
  if (state.age >= 18) state.taxableIncome += amount;
}

function skillAverage(ids) {
  return ids.reduce((sum, id) => sum + (state.skills[id] || 0), 0) / ids.length;
}

function improveSkill(id, amount) {
  state.skills[id] = clamp((state.skills[id] || 0) + amount, 0, 100);
}

function hasPossession(id) {
  return state.possessions.includes(id);
}

function hasCertificate(id) {
  return state.certificates.includes(id);
}

function budgetModeData() {
  return budgetModes[state.budgetMode] || budgetModes.balanced;
}

function emergencyFundMonths() {
  const cost = Math.max(1, personalCost());
  return Math.floor((state.personalMoney / cost) * 10) / 10;
}

function certificateBonus() {
  return state.certificates.reduce((sum, id) => sum + (certificateCatalog[id]?.reputation || 0), 0);
}

function partnerIncome() {
  if (!state.relationship?.married) return 0;
  const trust = (state.relationship.trust || 40) / 100;
  const bond = state.relationship.bond / 100;
  const city = cityData();
  const base = 650 + (state.relationship.age > 22 ? 280 : 80);
  const shared = state.relationship.sharedBudget ? 1 : 0.42;
  return Math.floor(base * city.salary * (0.65 + trust * 0.25 + bond * 0.25) * shared);
}

function creditLimit() {
  const income = Math.max(annualSalary(), partnerIncome(), 500);
  return Math.floor(income * (0.35 + state.creditScore / 95));
}

function changeCredit(amount) {
  state.creditScore = clamp(state.creditScore + amount, 0, 100);
}

function householdIncome(st = state) {
  const city = cityData(st);
  return st.family
    .filter((item) => item.alive && (item.id === "mother" || item.id === "father"))
    .reduce((sum, item) => {
      const base = item.job === "Пенсионер" ? 300 : 650 + item.bond * 4;
      return sum + Math.floor(base * city.salary);
    }, 0);
}

function householdCost() {
  const city = cityData();
  const dependents = 1 + state.children.length + (state.relationship ? 1 : 0);
  const childCost = state.age < 18 && state.livingWithParents ? 0 : dependents * 260 * city.cost;
  const rent = state.livingWithParents ? 0 : housingData().annual * city.cost;
  const carCost = hasPossession("car") ? 520 * city.cost : 0;
  return Math.floor(560 * city.cost + childCost + rent + carCost);
}

function personalCost() {
  if (state.age < 18 && state.livingWithParents) return 0;
  const mode = budgetModeData();
  const base = (420 * cityData().cost + (state.relationship ? 140 : 0) + state.children.length * 250) * mode.cost;
  const housing = state.livingWithParents ? 0 : housingData().annual * cityData().cost;
  const carCost = hasPossession("car") ? 520 * cityData().cost : 0;
  return Math.floor(base + housing + carCost);
}

function stageName() {
  if (state.age < 3) return "Младенчество";
  if (state.age < 7) return "Дошкольник";
  if (state.age < 14) return "Школа";
  if (state.age < 18) return "Подросток";
  if (state.age < 25) return "Старт взрослой жизни";
  if (state.age < 45) return "Взрослая жизнь";
  if (state.age < 65) return "Зрелость";
  return "Поздняя жизнь";
}

function maxActionsForAge() {
  let max = state.age < 4 ? 2 : 3;
  if (state.age >= 7) max += 1;
  if (state.age >= 18) max += 1;
  if (state.discipline > 70) max += 1;
  if (state.health < 35 || state.stress > 80) max -= 1;
  return clamp(max, 1, 7);
}

function canAct(cost = 1) {
  return state.actions >= cost && !state.event;
}

function spendAction(cost = 1) {
  state.actions = Math.max(0, state.actions - cost);
}

function addLog(text) {
  state.log.unshift(`${state.age} лет: ${text}`);
  state.log = state.log.slice(0, 36);
}

function notify(text) {
  state.message = text;
  addLog(text);
  render();
}

function change(values) {
  for (const [key, amount] of Object.entries(values)) {
    if (["health", "happiness", "knowledge", "social", "discipline", "stress", "mental", "energy", "grades", "reputation", "lifestyle", "portfolio", "network", "creditScore", "looks", "fame", "karma"].includes(key)) {
      state[key] = clamp(state[key] + amount, 0, 100);
    } else {
      state[key] += amount;
    }
  }
}

function familyBond(id, amount) {
  const member = state.family.find((item) => item.id === id);
  if (member) member.bond = clamp(member.bond + amount, 0, 100);
}

function canPay(amount) {
  return state.personalMoney >= amount;
}

function pay(amount) {
  if (state.personalMoney >= amount) {
    state.personalMoney -= amount;
    return true;
  }
  return false;
}

function borrow(amount) {
  if (state.debt + amount > creditLimit()) return false;
  state.personalMoney += amount;
  state.debt += amount;
  changeCredit(-Math.ceil(amount / Math.max(700, annualSalary() || 700)));
  return true;
}

function getActions() {
  const list = [];

  if (state.age < 3) {
    list.push(
      action("Слушать речь", "Просить родителей говорить и читать рядом.", "Знания +4, связь с родителями +2", "Слушать", () => {
        spendAction();
        change({ knowledge: 4, happiness: 1 });
        improveSkill("language", 3);
        improveSkill("empathy", 1);
        familyBond("mother", 2);
        familyBond("father", 2);
        notify("Вы учитесь речи и узнаете голоса семьи.");
      }),
      action("Играть на полу", "Ранние движения дают здоровье и настроение.", "Здоровье +3, счастье +3", "Играть", () => {
        spendAction();
        change({ health: 3, happiness: 3, stress: -1 });
        improveSkill("fitness", 3);
        improveSkill("creativity", 1);
        notify("Игра укрепила тело и любопытство.");
      }),
      action("Тянуться к маме", "Эмоциональная связь станет ресурсом на годы.", "Связь с мамой +5", "К маме", () => {
        spendAction();
        familyBond("mother", 5);
        change({ happiness: 2, stress: -2 });
        improveSkill("empathy", 2);
        notify("Мама чаще рядом, чувство безопасности растет.");
      }),
      action("Тянуться к папе", "Отцовская вовлеченность влияет на уверенность.", "Связь с папой +5", "К папе", () => {
        spendAction();
        familyBond("father", 5);
        change({ happiness: 2, social: 1 });
        improveSkill("leadership", 1);
        notify("Папа уделил время. Связь стала крепче.");
      })
    );
  }

  if (state.age >= 3 && state.age < 7) {
    list.push(
      action("Детский сад", "Режим, первые друзья и самостоятельность.", `Семья платит ${fmt(180)}, социальность +5`, "Пойти", () => {
        spendAction();
        state.familyMoney -= 180 * cityData().cost;
        change({ social: 5, discipline: 3, knowledge: 2, stress: 1 });
        improveSkill("empathy", 3);
        improveSkill("language", 2);
        notify("Детский сад дал первых друзей и привычку к режиму.");
      }, state.familyMoney < 180 * cityData().cost),
      action("Рисовать и лепить", "Творчество развивает внимание.", "Знания +3, счастье +4", "Творить", () => {
        spendAction();
        change({ knowledge: 3, happiness: 4, discipline: 1 });
        improveSkill("creativity", 5);
        notify("Творчество стало маленькой опорой.");
      }),
      action("Гулять во дворе", "Двор учит общаться и договариваться.", "Социальность +4, здоровье +2", "Гулять", () => {
        spendAction();
        change({ social: 4, health: 2, happiness: 2 });
        improveSkill("fitness", 2);
        improveSkill("empathy", 2);
        notify("Во дворе появились знакомые дети.");
      }),
      action("Помочь дома", "Даже маленькая помощь влияет на семью.", "Связь с родителями +3", "Помочь", () => {
        spendAction();
        familyBond("mother", 3);
        familyBond("father", 3);
        change({ discipline: 2, happiness: 1 });
        improveSkill("empathy", 2);
        improveSkill("craft", 1);
        notify("Родители заметили помощь и стали теплее.");
      })
    );
  }

  if (state.age >= 7 && state.age < 18) {
    list.push(
      action("Учиться в школе", "База для будущей профессии.", "Оценки +7, знания +5, стресс +2", "Учиться", () => {
        spendAction();
        const cityBonus = Math.floor(cityData().education / 25);
        change({ grades: 7, knowledge: 5 + cityBonus, discipline: 2, stress: 2 });
        improveSkill("logic", 3 + cityBonus);
        improveSkill("language", 2);
        notify("Школьная учеба улучшила оценки и знания.");
      }),
      action("Спорт", "Здоровье снижает риски в долгой игре.", "Здоровье +6, стресс -3", "Спорт", () => {
        spendAction();
        change({ health: 6, stress: -3, discipline: 1 });
        improveSkill("fitness", 5);
        notify("Тело стало крепче, стресс снизился.");
      }),
      action("Друзья", "Социальная сеть пригодится в карьере и бизнесе.", "Социальность +6, счастье +3", "Встретиться", () => {
        spendAction();
        change({ social: 6, happiness: 3, stress: -1 });
        improveSkill("empathy", 3);
        improveSkill("leadership", 1);
        notify("Дружба добавила уверенности и контактов.");
      }),
      action("Кружок", "Навык вне школы может стать профессией.", "Знания +4, репутация +1", "Заниматься", () => {
        spendAction();
        change({ knowledge: 4, discipline: 2, reputation: 1, portfolio: 2, happiness: 1 });
        improveSkill("creativity", 2);
        improveSkill("craft", 2);
        improveSkill("logic", 1);
        notify("Кружок дал личный навык и первые достижения.");
      }),
      action("Олимпиада", "Сложная учебная цель.", "Знания +7, портфолио +4", "Готовиться", () => {
        spendAction();
        change({ knowledge: 7, grades: 5, discipline: 3, stress: 4, portfolio: 4, reputation: 2 });
        improveSkill("logic", 4);
        improveSkill("language", 1);
        notify("Олимпиада усилила учебный профиль.");
      }, state.knowledge < 20 && state.grades < 25),
      action("Мини-проект", "Первый результат своими руками.", "Портфолио +6, навык +3", "Сделать", () => {
        spendAction();
        change({ portfolio: 6, knowledge: 2, discipline: 2, stress: 2 });
        improveSkill(state.skills.creativity > state.skills.logic ? "creativity" : "logic", 3);
        notify("Мини-проект появился в портфолио.");
      }, state.age < 12),
      action("Помогать семье", "Семья экономит деньги, отношения крепнут.", `Бюджет семьи +${fmt(120)}`, "Помочь", () => {
        spendAction();
        state.familyMoney += 120;
        familyBond("mother", 2);
        familyBond("father", 2);
        change({ discipline: 3, stress: 1 });
        improveSkill("finance", 1);
        improveSkill("empathy", 2);
        notify("Семья сэкономила немного денег благодаря вашей помощи.");
      })
    );
  }

  if (state.age >= 14) {
    list.push(
      action("Подработка", "Первые личные деньги без профессии.", `1 действие, около ${fmt(250)}`, "Подработать", () => {
        spendAction();
        const earned = Math.floor(250 * cityData().salary * (1 + state.discipline / 220));
        addIncome(earned);
        change({ stress: 4, discipline: 2, social: 1 });
        improveSkill("finance", 2);
        improveSkill("empathy", 1);
        notify(`Подработка принесла ${fmt(earned)} личных денег.`);
      }),
      action("Стажировка", "Опыт до полноценной работы.", `Опыт +1, связи +4`, "Идти", () => {
        spendAction();
        const earned = Math.floor((180 + state.knowledge * 4 + state.social * 3) * cityData().salary);
        addIncome(earned);
        state.experience += 1;
        change({ network: 4, portfolio: 3, stress: 5, reputation: 2 });
        improveSkill("leadership", 1);
        improveSkill("empathy", 1);
        notify(`Стажировка дала опыт и ${fmt(earned)}.`);
      }, state.knowledge < 18 || state.social < 10)
    );
  }

  if (state.age >= 16) {
    list.push(
      action("Личный бренд", "Публичность и доверие.", "Связи +6, репутация +3", "Развивать", () => {
        spendAction();
        change({ network: 6, reputation: 3, social: 2, stress: 3 });
        improveSkill("leadership", 2);
        notify("Личный бренд усилил доверие к вам.");
      })
    );
  }

  if (state.age >= 18) {
    list.push(
      action("Работать по профессии", "Стабильный доход и опыт.", `Доход: ${fmt(annualSalary())}`, "Работать", () => {
        spendAction();
        const earned = annualSalary();
        addIncome(earned);
        state.experience += 1;
        change({ stress: professionData().stress, discipline: 2, reputation: 2 });
        applyProfessionSkillGrowth();
        if (state.experience % 3 === 0) state.careerLevel += 1;
        notify(`Работа принесла ${fmt(earned)} и опыт в профессии.`);
      }, state.profession === "none" || !state.documents.workPermit),
      action("Фриланс", "Зависит от знаний, общения и репутации.", "Переменный доход", "Взять заказ", () => {
        spendAction();
        const tools = hasPossession("laptop") ? 1.18 : 1;
        const earned = Math.floor((350 + state.knowledge * 10 + state.social * 8 + state.reputation * 9 + skillAverage(["logic", "creativity", "finance"]) * 12) * cityData().salary * tools);
        state.personalMoney += earned;
        change({ stress: 8, reputation: 2, social: 1 });
        improveSkill("finance", 2);
        improveSkill("leadership", 1);
        notify(`Фриланс принес ${fmt(earned)}.`);
      }, state.knowledge < 20 && state.social < 20),
      action("Забота о здоровье", "Профилактика дешевле кризиса.", `${fmt(300)}, здоровье +9, стресс -6`, "Заняться", () => {
        spendAction();
        payOrDebt(300);
        change({ health: 9, stress: -6, happiness: 1 });
        improveSkill("fitness", 2);
        notify("Здоровье улучшилось, стресс стал ниже.");
      }),
      action("Отдых", "Баланс нужен для долгой жизни.", "Счастье +7, стресс -8", "Отдохнуть", () => {
        spendAction();
        change({ happiness: 7, stress: -8, health: 1 });
        change({ lifestyle: 3 });
        notify("Отдых вернул силы.");
      })
    );
  }

  return list;
}

function action(title, text, meta, button, run, disabled = false) {
  return { title, text, meta, button, run, disabled: Boolean(disabled) || !canAct() };
}

function professionData() {
  return professions[state.profession] || professions.none;
}

function professionSkillIds(id = state.profession) {
  const map = {
    service: ["empathy", "leadership", "finance"],
    trade: ["craft", "fitness", "finance"],
    it: ["logic", "language", "finance"],
    medicine: ["logic", "empathy", "fitness"],
    engineering: ["logic", "craft", "leadership"],
    education: ["empathy", "language", "leadership"],
    art: ["creativity", "language", "empathy"],
    finance: ["finance", "logic", "leadership"],
  };
  return map[id] || ["logic", "empathy"];
}

function applyProfessionSkillGrowth() {
  for (const id of professionSkillIds()) improveSkill(id, 2);
}

function annualSalary() {
  if (state.profession === "none") return 0;
  const prof = professionData();
  const education = state.educationLevel === "Высшее образование" ? 1.3 : state.educationLevel === "Колледж" ? 1.12 : 1;
  const level = 1 + state.careerLevel * 0.18;
  const coreSkills = skillAverage(professionSkillIds());
  const proof = 1 + (state.portfolio * 0.45 + state.network * 0.3 + certificateBonus() * 2.2) / 260;
  const publicBonus = 1 + state.fame / 450;
  const recordPenalty = Math.max(0.62, 1 - state.criminalRecord * 0.08);
  const skill = 1 + (state.knowledge + coreSkills * 1.4 + state.social * 0.35 + state.discipline * 0.25) / 320;
  return Math.floor(prof.salary * cityData().salary * education * level * skill * proof * publicBonus * recordPenalty);
}

function payOrDebt(amount) {
  if (state.personalMoney >= amount) state.personalMoney -= amount;
  else {
    const gap = amount - state.personalMoney;
    state.personalMoney = 0;
    state.debt += gap;
  }
}

function resolveTaxesYear() {
  if (state.age < 18 || state.taxableIncome <= 0) return "";
  const rate = state.documents.taxId ? countryTaxRate() : countryTaxRate() + 0.06;
  const due = Math.floor(state.taxableIncome * rate);
  state.taxableIncome = 0;
  if (due <= 0) return "";
  if (state.personalMoney >= due) {
    state.personalMoney -= due;
    state.taxesPaid += due;
    return `налоги ${fmt(due)}`;
  }
  const paid = state.personalMoney;
  state.personalMoney = 0;
  state.taxesPaid += paid;
  state.taxDebt += due - paid;
  state.debt += due - paid;
  change({ stress: 5, reputation: -1 });
  return `налоги частично, долг ${fmt(due - paid)}`;
}

function chooseProfession(id) {
  const prof = professions[id];
  if (!prof || id === "none") return;
  if (state.knowledge < prof.knowledge || state.social < prof.social || state.age < 16) return;
  state.profession = id;
  state.educationLevel = state.age < 18 ? "Профиль выбран" : state.educationLevel;
  notify(`Вы выбрали направление: ${prof.name}.`);
}

function enroll(type) {
  if (state.age < 17) return;
  const cost = type === "university" ? 2400 * cityData().cost : 1200 * cityData().cost;
  if (state.personalMoney + state.familyMoney < cost) return;
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else {
    const rest = cost - state.personalMoney;
    state.personalMoney = 0;
    state.familyMoney -= rest;
  }
  spendAction();
  if (type === "university") {
    state.educationLevel = "Высшее образование";
    change({ knowledge: 16, social: 5, stress: 8, reputation: 3 });
    notify("Высшее образование открыло сильные карьерные траектории.");
  } else {
    state.educationLevel = "Колледж";
    change({ knowledge: 10, discipline: 6, stress: 4, reputation: 2 });
    notify("Колледж дал прикладную профессию и быстрый старт.");
  }
}

function acquireCertificate(id) {
  const cert = certificateCatalog[id];
  if (!cert || hasCertificate(id) || !canAct()) return;
  const cost = Math.floor(cert.cost * cityData().cost);
  if (state.age < 16 || state.knowledge < cert.knowledge || state.social < cert.social || state.personalMoney + state.familyMoney < cost) return;
  spendAction();
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else {
    const rest = cost - state.personalMoney;
    state.personalMoney = 0;
    state.familyMoney -= rest;
  }
  state.certificates.push(id);
  improveSkill(cert.skill, 5);
  change({ reputation: cert.reputation, portfolio: 3, stress: 3 });
  notify(`Получен сертификат: ${cert.name}.`);
}

function moveTo(countryId, cityId) {
  if (state.age < 18 || state.event) return;
  if (countryId !== state.country && !state.documents.passport) return;
  const dest = countries[countryId].cities[cityId];
  const cost = Math.floor(dest.housing * 1.5);
  if (state.personalMoney < cost) return;
  const oldCountry = state.country;
  state.personalMoney -= cost;
  state.country = countryId;
  state.city = cityId;
  state.livingWithParents = false;
  state.documents.workPermit = oldCountry === countryId;
  if (oldCountry !== countryId && !state.documents.visas.includes(countryId)) state.documents.visas.push(countryId);
  change({ stress: 8, social: -5, happiness: 2 });
  notify(`Вы переехали в ${dest.name}, ${countries[countryId].name}.`);
}

function leaveParents() {
  if (state.age < 18 || !state.livingWithParents) return;
  const cost = Math.floor(cityData().housing);
  if (state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.livingWithParents = false;
  change({ discipline: 4, stress: 6, happiness: 3 });
  notify("Вы начали жить отдельно. Свободы больше, расходов тоже.");
}

function supportParents() {
  if (state.age < 18 || state.personalMoney < 400) return;
  state.personalMoney -= 400;
  state.familyMoney += 400;
  familyBond("mother", 4);
  familyBond("father", 4);
  change({ happiness: 2, reputation: 1 });
  notify("Вы помогли семье деньгами.");
}

function startRelationship() {
  if (state.age < 16 || state.relationship || !canAct()) return;
  spendAction();
  const partnerGender = Math.random() > 0.5 ? "female" : "male";
  state.relationship = {
    name: pick(names[partnerGender]),
    age: state.age + roll(5) - 2,
    bond: 45 + Math.floor((state.social + state.happiness) / 5),
    trust: 42 + Math.floor(state.skills.empathy / 3),
    romance: 38 + roll(20),
    conflict: 8 + roll(12),
    sharedBudget: false,
    married: false,
    gender: partnerGender,
  };
  change({ happiness: 6, social: 3, stress: 2 });
  notify(`Вы начали отношения. Партнер: ${state.relationship.name}.`);
}

function developRelationship() {
  if (!state.relationship || !canAct()) return;
  spendAction();
  state.relationship.bond = clamp(state.relationship.bond + 9, 0, 100);
  state.relationship.trust = clamp((state.relationship.trust || 40) + 4, 0, 100);
  state.relationship.romance = clamp((state.relationship.romance || 40) + 2, 0, 100);
  state.relationship.conflict = clamp((state.relationship.conflict || 0) - 2, 0, 100);
  change({ happiness: 4, stress: -2, social: 1 });
  notify("Отношения стали крепче.");
}

function marry() {
  if (!state.relationship || state.relationship.married || state.relationship.bond < 70 || (state.relationship.trust || 0) < 55 || state.age < 18 || !canAct()) return;
  const cost = Math.floor(1100 * cityData().cost);
  if (state.personalMoney < cost) return;
  spendAction();
  state.personalMoney -= cost;
  state.relationship.married = true;
  change({ happiness: 10, stress: 5, reputation: 3 });
  notify("Вы создали семью. В семейном дереве появилась новая ветка.");
}

function haveChild() {
  if (!state.relationship || !state.relationship.married || state.age < 20 || state.children.length >= 4 || !canAct()) return;
  const cost = Math.floor(800 * cityData().cost);
  if (state.personalMoney + state.familyMoney < cost) return;
  spendAction();
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else state.familyMoney -= cost - state.personalMoney;
  const gender = Math.random() > 0.5 ? "male" : "female";
  const child = { id: `child-${Date.now()}`, name: pick(names[gender]), gender, age: 0, bond: 80, health: 70 + roll(25) };
  state.children.push(child);
  change({ happiness: 12, stress: 12, reputation: 2 });
  notify(`Родился ребенок: ${child.name}. Расходы семьи выросли.`);
}

function startCompany(sectorId) {
  const sector = companySectors[sectorId];
  if (!sector || state.age < 18 || state.company || !canAct()) return;
  if (state.personalMoney < sector.cost || state.knowledge < sector.knowledge || state.social < sector.social) return;
  spendAction();
  state.personalMoney -= sector.cost;
  state.company = {
    sector: sectorId,
    cash: Math.floor(sector.cost * 0.35),
    reputation: 5,
    employees: 0,
    level: 1,
    stress: sector.stress,
    marketing: 0,
    quality: 0,
    automation: 0,
    branches: 0,
    debt: 0,
  };
  change({ stress: 10, reputation: 4, happiness: 3 });
  notify(`Открыта компания: ${sector.name}. Теперь доход зависит от решений бизнеса.`);
}

function companyAction(type) {
  if (!state.company || !canAct()) return;
  const sector = companySectors[state.company.sector];
  if (type === "sell") {
    spendAction();
    const revenue = Math.floor((sector.baseRevenue + state.company.reputation * 35 + state.social * 12 + state.company.marketing * 18) * cityData().opportunity / 100);
    state.company.cash += revenue;
    state.company.reputation = clamp(state.company.reputation + 4, 0, 100);
    change({ stress: 5, reputation: 1 });
    notify(`Компания получила выручку ${fmt(revenue)}.`);
  }
  if (type === "hire" && state.company.cash >= 900) {
    spendAction();
    state.company.cash -= 900;
    state.company.employees += 1;
    state.company.reputation = clamp(state.company.reputation + 2, 0, 100);
    change({ stress: 3 });
    notify("В компанию нанят сотрудник.");
  }
  if (type === "improve" && state.company.cash >= 1300) {
    spendAction();
    state.company.cash -= 1300;
    state.company.level += 1;
    state.company.reputation = clamp(state.company.reputation + 7, 0, 100);
    change({ knowledge: 3, stress: 4, reputation: 2 });
    notify("Компания улучшила процессы и стала сильнее.");
  }
  if (type === "marketing" && state.company.cash >= 700) {
    spendAction();
    state.company.cash -= 700;
    state.company.marketing = clamp(state.company.marketing + 8, 0, 100);
    state.company.reputation = clamp(state.company.reputation + 3, 0, 100);
    change({ stress: 2, fame: 1 });
    notify("Маркетинг привел новых клиентов.");
  }
  if (type === "quality" && state.company.cash >= 1000) {
    spendAction();
    state.company.cash -= 1000;
    state.company.quality = clamp(state.company.quality + 8, 0, 100);
    state.company.reputation = clamp(state.company.reputation + 5, 0, 100);
    change({ knowledge: 2, stress: 2 });
    notify("Качество продукта выросло.");
  }
  if (type === "automation" && state.company.cash >= 1800) {
    spendAction();
    state.company.cash -= 1800;
    state.company.automation = clamp(state.company.automation + 10, 0, 100);
    change({ knowledge: 2, stress: 3 });
    notify("Автоматизация снизит будущие расходы.");
  }
  if (type === "branch" && state.company.cash >= 3200) {
    spendAction();
    state.company.cash -= 3200;
    state.company.branches += 1;
    state.company.reputation = clamp(state.company.reputation + 4, 0, 100);
    change({ stress: 7, reputation: 2 });
    notify("Открыт новый филиал.");
  }
  if (type === "loan") {
    spendAction();
    const amount = Math.floor(2200 * (1 + state.company.level * 0.2) * cityData().salary);
    state.company.cash += amount;
    state.company.debt += amount;
    change({ stress: 4, creditScore: -2 });
    notify(`Компания взяла кредит ${fmt(amount)}.`);
  }
  if (type === "repay" && state.company.cash > 0 && state.company.debt > 0) {
    const amount = Math.min(state.company.cash, state.company.debt, 1200);
    state.company.cash -= amount;
    state.company.debt -= amount;
    change({ creditScore: 1, stress: -1 });
    notify(`Компания погасила ${fmt(amount)} долга.`);
  }
  if (type === "withdraw" && state.company.cash >= 500) {
    const amount = Math.floor(state.company.cash * 0.25);
    state.company.cash -= amount;
    addIncome(amount);
    notify(`Вы вывели из компании ${fmt(amount)}.`);
  }
}

function resolveCompanyYear() {
  if (!state.company) return "";
  const sector = companySectors[state.company.sector];
  const founder = 1 + skillAverage(["finance", "leadership", "empathy"]) / 260;
  const branchPower = 1 + state.company.branches * 0.38;
  const demand = 1 + state.company.marketing / 180 + state.company.quality / 220;
  const income = Math.floor((sector.baseRevenue * state.company.level + state.company.employees * 380 + state.company.reputation * 18) * cityData().opportunity / 100 * founder * branchPower * demand);
  const automationDiscount = 1 - Math.min(0.35, state.company.automation / 260);
  const costs = Math.floor((300 + state.company.employees * 420 + state.company.level * 160 + state.company.branches * 740) * automationDiscount);
  const debtInterest = Math.ceil((state.company.debt || 0) * 0.08);
  const profit = income - costs;
  state.company.cash += profit - debtInterest;
  state.company.reputation = clamp(state.company.reputation + (profit > 0 ? 2 : -3), 0, 100);
  change({ stress: state.company.stress });
  if (state.company.cash < 0) {
    state.debt += Math.abs(state.company.cash);
    state.company.cash = 0;
  }
  return `Компания: ${profit >= 0 ? "прибыль" : "убыток"} ${fmt(Math.abs(profit))}${debtInterest ? `, кредит ${fmt(debtInterest)}` : ""}.`;
}

function resolveAssetsYear() {
  const notes = [];
  if (state.assets.deposits > 0) {
    const income = Math.floor(state.assets.deposits * 0.045);
    state.assets.deposits += income;
    notes.push(`вклад +${fmt(income)}`);
  }
  if (state.assets.stocks > 0) {
    const rate = -0.12 + Math.random() * 0.28 + state.skills.finance / 900;
    const result = Math.floor(state.assets.stocks * rate);
    state.assets.stocks = Math.max(0, state.assets.stocks + result);
    notes.push(`акции ${result >= 0 ? "+" : "-"}${fmt(Math.abs(result))}`);
  }
  if (state.assets.pension > 0) {
    const income = Math.floor(state.assets.pension * 0.035);
    state.assets.pension += income;
    notes.push(`пенсия +${fmt(income)}`);
  }
  return notes.join(", ");
}

function maybeEvent() {
  if (state.event) return;
  if (state.age < 3 || Math.random() > 0.28) return;

  const events = [];
  if (state.age < 18) {
    events.push({
      title: "Семейный выбор",
      text: "Родители спорят, куда вложить свободные деньги.",
      options: [
        ["Книги и обучение", () => {
          state.familyMoney -= Math.min(state.familyMoney, 350);
          change({ knowledge: 7, grades: 4, happiness: 1 });
          closeEvent("Семья вложилась в обучение.");
        }, state.familyMoney < 120],
        ["Здоровье и спорт", () => {
          state.familyMoney -= Math.min(state.familyMoney, 300);
          change({ health: 8, stress: -3 });
          closeEvent("Семья выбрала здоровье.");
        }, state.familyMoney < 120],
        ["Сохранить деньги", () => {
          state.familyMoney += 120;
          change({ discipline: 2, happiness: -1 });
          closeEvent("Семья решила копить.");
        }],
      ],
    });
  }
  if (state.age >= 12) {
    events.push({
      title: "Новый круг общения",
      text: "Появилась возможность попасть в сильную компанию друзей.",
      options: [
        ["Влиться", () => {
          change({ social: 9, happiness: 4, stress: 3 });
          closeEvent("Новые друзья расширили круг общения.");
        }],
        ["Держать дистанцию", () => {
          change({ discipline: 5, stress: -2 });
          closeEvent("Вы сохранили фокус и спокойствие.");
        }],
      ],
    });
    events.push({
      title: "Случайная находка",
      text: "На улице лежит чужой кошелек.",
      options: [
        ["Вернуть", () => {
          change({ karma: 8, reputation: 2, happiness: 2 });
          closeEvent("Кошелек вернулся владельцу.");
        }],
        ["Оставить", () => {
          const gain = Math.floor((120 + roll(400)) * cityData().cost);
          state.personalMoney += gain;
          change({ karma: -7, stress: 3 });
          closeEvent(`Вы оставили ${fmt(gain)}.`);
        }],
      ],
    });
    if (state.fame > 8) {
      events.push({
        title: "Вирусный момент",
        text: "Ваше имя обсуждают в сети.",
        options: [
          ["Поддержать волну", () => {
            change({ fame: 8, network: 4, stress: 5 });
            closeEvent("Известность выросла.");
          }],
          ["Не лезть", () => {
            change({ stress: -4, fame: -2 });
            closeEvent("Вы не стали разгонять внимание.");
          }],
        ],
      });
    }
  }
  if (state.age >= 18) {
    events.push({
      title: "Поворот карьеры",
      text: "Появился шанс резко сменить траекторию.",
      options: [
        ["Рискнуть", () => {
          change({ knowledge: 8, reputation: 5, stress: 10 });
          state.careerLevel = Math.max(0, state.careerLevel - 1);
          closeEvent("Риск дал новые навыки, но карьера чуть просела.");
        }],
        ["Остаться в курсе", () => {
          change({ discipline: 5, stress: -3 });
          state.experience += 1;
          closeEvent("Вы укрепили текущую траекторию.");
        }],
      ],
    });
    events.push({
      title: "Финансовая развилка",
      text: "Появился шанс быстро заработать.",
      options: [
        ["Подработка", () => {
          const earned = Math.floor((400 + state.discipline * 8) * cityData().salary);
          addIncome(earned);
          change({ stress: 5, creditScore: 1 });
          closeEvent(`Дополнительный доход: ${fmt(earned)}.`);
        }],
        ["Отказаться", () => {
          change({ mental: 3, stress: -3 });
          closeEvent("Вы сохранили силы.");
        }],
      ],
    });
    if (!state.documents.taxId || state.taxDebt > 0 || state.criminalRecord > 0) {
      events.push({
        title: "Проверка статуса",
        text: "Всплыли документы, налоги или юридический след.",
        options: [
          ["Разобраться", () => {
            const cost = Math.floor((220 + state.taxDebt * 0.2 + state.criminalRecord * 180) * cityData().cost);
            payOrDebt(cost);
            if (state.taxDebt > 0) state.taxDebt = Math.floor(state.taxDebt * 0.75);
            change({ stress: -3, reputation: 1, creditScore: 1 });
            closeEvent(`Статус частично очищен за ${fmt(cost)}.`);
          }],
          ["Отложить", () => {
            change({ stress: 8, reputation: -2, creditScore: -2 });
            closeEvent("Проблемы остались висеть.");
          }],
        ],
      });
    }
  }
  if (events.length) {
    state.event = pick(events);
    state.message = `${state.event.title}: ${state.event.text}`;
  }
}

function closeEvent(text) {
  state.event = null;
  notify(text);
}

function endYear() {
  if (state.event) {
    render();
    return;
  }

  const notes = [];
  const familyIncome = householdIncome();
  const familyCost = Math.floor(householdCost() * (state.age < 18 ? 1 : 0.35));
  state.familyMoney += familyIncome - familyCost;
  if (state.familyMoney < 0) {
    state.debt += Math.abs(state.familyMoney);
    state.familyMoney = 0;
    change({ stress: 8, happiness: -4 });
    notes.push("семья закрыла дефицит долгом");
  }

  if (state.age >= 18) {
    const cost = personalCost();
    payOrDebt(cost);
    notes.push(`личные расходы ${fmt(cost)}`);
    const partnerPay = partnerIncome();
    if (partnerPay > 0) {
      addIncome(partnerPay);
      notes.push(`вклад партнера ${fmt(partnerPay)}`);
    }
    const mode = budgetModeData();
    change({ happiness: mode.happiness, discipline: mode.discipline, stress: mode.stress });
    changeCredit(mode.credit);
  }

  const companyNote = resolveCompanyYear();
  if (companyNote) notes.push(companyNote);
  const assetsNote = resolveAssetsYear();
  if (assetsNote) notes.push(assetsNote);
  const taxNote = resolveTaxesYear();
  if (taxNote) notes.push(taxNote);

  const interest = Math.ceil(state.debt * 0.06);
  if (interest > 0) {
    payOrDebt(interest);
    changeCredit(-1);
    notes.push(`проценты по долгу ${fmt(interest)}`);
  }

  ageFamily();
  naturalChanges();
  state.age += 1;
  state.year += 1;
  player().age = state.age;
  state.maxActions = maxActionsForAge();
  state.actions = state.maxActions;
  updateEducationByAge();
  maybeEvent();

  const note = notes.length ? notes.join(", ") : "год прошел спокойно";
  state.message = state.event ? state.message : `Новый год жизни: ${note}.`;
  addLog(state.message);
  render();
}

function ageFamily() {
  for (const member of state.family) {
    if (member.id !== "player") member.age += 1;
    if (!member.alive) continue;
    const risk = member.age < 55 ? 0.0006 : member.age < 65 ? 0.003 : member.age < 78 ? 0.018 : member.age < 90 ? 0.06 : 0.14;
    const healthRisk = member.age < 65 ? (100 - member.health) / 7000 : (100 - member.health) / 2600;
    if (member.id !== "player" && Math.random() < risk + healthRisk) {
      member.alive = false;
      change({ happiness: -12, stress: 12 });
      addLog(`${member.role} ${member.name} ${member.gender === "female" ? "ушла" : "ушел"} из жизни.`);
    } else {
      member.health = clamp(member.health + roll(7) - 4, 0, 100);
    }
  }
  if (state.relationship) state.relationship.age += 1;
  state.children.forEach((child) => {
    child.age += 1;
    child.health = clamp(child.health + roll(7) - 3, 0, 100);
  });
}

function naturalChanges() {
  const city = cityData();
  const home = housingData();
  const itemKnowledge = hasPossession("books") ? 1 : 0;
  const itemHealth = hasPossession("bike") ? 1 : 0;
  change({
    health: (city.safety > 80 ? 1 : -1) + itemHealth,
    happiness: (state.livingWithParents && state.age > 22 ? -2 : 0) + home.happiness,
    knowledge: (state.age < 22 ? 1 : 0) + itemKnowledge,
    social: state.age > 70 ? -1 : 0,
    stress: (state.age < 18 ? -1 : 2) + home.stress,
    lifestyle: Math.floor((home.quality - 50) / 18),
    mental: state.stress > 65 ? -4 : state.happiness > 70 ? 2 : 0,
    energy: state.health > 70 ? 2 : -2,
    looks: state.age < 25 ? 1 : state.age > 55 ? -1 : 0,
    fame: state.fame > 0 ? -1 : 0,
    karma: state.karma > 55 ? -1 : state.karma < 45 ? 1 : 0,
  });
  if (hasPossession("laptop")) improveSkill("logic", 1);
  if (hasPossession("tools")) improveSkill("craft", 1);
  if (state.health < 25) {
    change({ happiness: -5, stress: 7 });
    const bill = state.documents.insurance === "premium" ? 80 : state.documents.insurance === "basic" ? 170 : 300;
    state.debt += bill;
    addLog("Плохое здоровье вызвало расходы на лечение.");
  }
  if (state.stress > 92) {
    change({ health: -8, happiness: -8, mental: -10, energy: -8, discipline: -4 });
    addLog("Высокий стресс ударил по здоровью и дисциплине.");
  }
  if (state.mental < 25) {
    change({ happiness: -6, stress: 8, social: -2 });
    addLog("Ментальное состояние стало критическим: отношения и энергия просели.");
  }
  if (state.taxDebt > 0) {
    change({ stress: 3, reputation: -1 });
  }
  if (state.criminalRecord > 0) {
    change({ reputation: -state.criminalRecord, stress: Math.min(5, state.criminalRecord) });
  }
}

function updateEducationByAge() {
  if (state.age === 7) state.educationLevel = "Школа";
  if (state.age === 18 && state.educationLevel === "Школа") state.educationLevel = state.grades > 55 ? "Среднее образование" : "Базовое образование";
}

function section(title, text) {
  const node = document.createElement("section");
  node.className = "section";
  const head = document.createElement("div");
  head.className = "section-head";
  const wrap = document.createElement("div");
  const h = document.createElement("h2");
  h.textContent = title;
  wrap.append(h);
  head.append(wrap);
  node.append(head);
  return node;
}

function button(label, handler, options = {}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  if (options.className) btn.className = options.className;
  if (options.disabled) btn.disabled = true;
  btn.addEventListener("click", handler);
  return btn;
}

function card(title, text, meta, actionButton) {
  const node = document.createElement("article");
  node.className = "card";
  const h = document.createElement("h3");
  h.textContent = title;
  const m = document.createElement("div");
  m.className = "mini";
  m.textContent = meta;
  node.append(h);
  if (meta) node.append(m);
  if (actionButton) node.append(actionButton);
  return node;
}

function renderActionGrid(actions) {
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const item of actions) {
    grid.append(
      card(item.title, "", item.meta, button(item.disabled ? "Недоступно" : item.button, item.run, {
        disabled: item.disabled,
        className: item.disabled ? "" : "primary",
      }))
    );
  }
  return grid;
}

function renderStats() {
  const stats = [
    ["Возраст", ageText(state.age)],
    ["Этап", stageName()],
    ["Действия", `${state.actions}/${state.maxActions}`],
    ["Личные деньги", fmt(state.personalMoney)],
    ["Бюджет семьи", fmt(state.familyMoney)],
    ["Долг", fmt(state.debt)],
    ["Здоровье", `${state.health}%`],
    ["Психика", `${state.mental}%`],
    ["Энергия", `${state.energy}%`],
    ["Счастье", `${state.happiness}%`],
    ["Внешность", `${state.looks}%`],
    ["Известность", `${state.fame}%`],
    ["Знания", state.knowledge],
    ["Общение", state.social],
    ["Портфолио", state.portfolio],
    ["Связи", state.network],
    ["Кредит", state.creditScore],
    ["Карма", state.karma],
    ["Судимость", state.criminalRecord],
    ["Стресс", `${state.stress}%`],
    ["Город", cityName()],
    ["Дом", housingData().name],
    ["Капитал", fmt(netWorth())],
    ["Налоговый долг", fmt(state.taxDebt)],
  ];
  els.stats.replaceChildren(
    ...stats.map(([label, value]) => {
      const node = document.createElement("article");
      node.className = "stat";
      node.innerHTML = `<div class="stat-label"></div><div class="stat-value"></div>`;
      node.querySelector(".stat-label").textContent = label;
      node.querySelector(".stat-value").textContent = value;
      return node;
    })
  );
}

function renderTabs() {
  els.tabs.replaceChildren(
    ...tabs.map(([id, label]) => {
      const btn = button(label, () => {
        state.tab = id;
        render();
      });
      btn.className = `tab${state.tab === id ? " active" : ""}`;
      return btn;
    })
  );
}

function renderEvent() {
  if (!state.event) return document.createDocumentFragment();
  const node = section(state.event.title, state.event.text);
  const grid = document.createElement("div");
  grid.className = "button-grid";
  for (const [label, run, disabled] of state.event.options) {
    grid.append(button(label, run, { disabled: Boolean(disabled), className: "primary" }));
  }
  node.append(grid);
  return node;
}

function renderLife() {
  const root = document.createDocumentFragment();
  const profile = section("Персонаж", "");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `${ageText(state.age)}`,
    `${cityName()}, ${countryName()}`,
    `Счастье ${state.happiness}%`,
    `Здоровье ${state.health}%`,
    `Внешность ${state.looks}%`,
    `Известность ${state.fame}%`,
    `Карма ${state.karma}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  profile.append(tags);
  root.append(profile);

  const timeline = section("Жизненный этап", "Доступные решения зависят от возраста, семьи, города, здоровья и накопленных навыков.");
  const line = document.createElement("div");
  line.className = "timeline";
  [
    ["0-2", "Младенец"],
    ["3-6", "Дошкольник"],
    ["7-13", "Школа"],
    ["14-17", "Подросток"],
    ["18-24", "Старт"],
    ["25+", "Взрослая жизнь"],
  ].forEach(([years, label]) => {
    const step = document.createElement("div");
    const active =
      (label === "Младенец" && state.age < 3) ||
      (label === "Дошкольник" && state.age >= 3 && state.age < 7) ||
      (label === "Школа" && state.age >= 7 && state.age < 14) ||
      (label === "Подросток" && state.age >= 14 && state.age < 18) ||
      (label === "Старт" && state.age >= 18 && state.age < 25) ||
      (label === "Взрослая жизнь" && state.age >= 25);
    step.className = `life-step${active ? " active" : ""}`;
    step.innerHTML = `<strong></strong><span></span>`;
    step.querySelector("strong").textContent = years;
    step.querySelector("span").textContent = label;
    line.append(step);
  });
  timeline.append(line);
  root.append(timeline);

  const actions = section("Решения года", "Никаких полей ввода: каждое действие выбирается кнопкой.");
  actions.append(renderActionGrid(getActions()));
  root.append(actions);
  return root;
}

function renderActivities() {
  const root = document.createDocumentFragment();
  const s = section("Активности", "");
  const grid = document.createElement("div");
  grid.className = "grid";
  const vacationCost = Math.floor(900 * cityData().cost);
  const styleCost = Math.floor(380 * cityData().cost);
  const lawyerCost = Math.floor((900 + state.criminalRecord * 450) * cityData().cost);
  grid.append(
    activityCard("Игрушки", "Счастье +4, моторика", "toys", !canAct() || state.age >= 3),
    activityCard("Объятия", "Связь с семьей +3", "hug", !canAct() || state.age >= 7),
    activityCard("Прогулка", "Здоровье +2, счастье +3", "walk", !canAct() || state.age < 3),
    activityCard("Книга", "Знания +5, стресс -1", "book", !canAct() || state.age < 5),
    activityCard("Спортзал", "Здоровье +5, внешность +2", "gym", !canAct() || state.age < 12),
    activityCard("Медитация", "Психика +7, карма +2", "meditate", !canAct() || state.age < 10),
    activityCard("Волонтерство", "Карма +6, репутация +2", "volunteer", !canAct() || state.age < 12),
    activityCard("Соцсети", "Известность, связи", "social", !canAct() || state.age < 12),
    activityCard("Стиль", `${fmt(styleCost)}, внешность +6`, "style", !canAct() || state.age < 14 || state.personalMoney < styleCost),
    activityCard("Отпуск", `${fmt(vacationCost)}, счастье +12`, "vacation", !canAct() || state.age < 18 || state.personalMoney < vacationCost),
    activityCard("Лотерея", `${fmt(80)}, шанс выигрыша`, "lottery", state.age < 18 || state.personalMoney < 80 || state.event),
    activityCard("Азартная игра", `${fmt(180)}, риск`, "gamble", state.age < 18 || state.personalMoney < 180 || state.event),
    activityCard("Мелкая кража", "Риск судимости", "theft", !canAct() || state.age < 14),
    activityCard("Интервью", "Известность +5, деньги", "interview", !canAct() || state.fame < 15),
    activityCard("Реклама", "Доход от известности", "ad", !canAct() || state.fame < 25),
    activityCard("Адвокат", `${fmt(lawyerCost)}, судимость -1`, "lawyer", !canAct() || state.criminalRecord < 1 || state.personalMoney < lawyerCost),
    activityCard("Извиниться", "Карма +4, стресс -3", "apologize", !canAct() || state.age < 7 || state.karma > 80)
  );
  s.append(grid);
  root.append(s);

  const status = section("Статус", "");
  const statusTags = document.createElement("div");
  statusTags.className = "tagline";
  [`Судимость: ${state.criminalRecord}`, `Кредит: ${state.creditScore}/100`, `Резерв: ${emergencyFundMonths()} мес.`, `Связи: ${state.network}/100`, `Репутация: ${state.reputation}/100`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    statusTags.append(tag);
  });
  status.append(statusTags);
  root.append(status);
  return root;
}

function activityCard(title, meta, type, disabled) {
  return card(title, "", meta, button(disabled ? "Недоступно" : "Сделать", () => activityAction(type), {
    disabled,
    className: disabled ? "" : "primary",
  }));
}

function activityAction(type) {
  if (state.event) return;
  if (["toys", "hug", "walk", "book", "gym", "meditate", "volunteer", "social", "style", "vacation", "theft", "interview", "ad", "lawyer", "apologize"].includes(type) && !canAct()) return;
  if (type === "toys") {
    spendAction();
    change({ happiness: 4, energy: -2, knowledge: 1 });
    improveSkill("creativity", 2);
    notify("Игрушки развили любопытство.");
  }
  if (type === "hug") {
    spendAction();
    familyBond("mother", 3);
    familyBond("father", 3);
    change({ happiness: 3, stress: -2, mental: 2 });
    improveSkill("empathy", 1);
    notify("Семейная близость стала крепче.");
  }
  if (type === "walk") {
    spendAction();
    change({ health: 2, happiness: 3, stress: -2, energy: -1 });
    notify("Прогулка освежила день.");
  }
  if (type === "book") {
    spendAction();
    change({ knowledge: 5, stress: -1, mental: 1 });
    improveSkill("logic", 2);
    notify("Книга добавила знаний.");
  }
  if (type === "gym") {
    spendAction();
    change({ health: 5, looks: 2, stress: -2, energy: -4 });
    improveSkill("fitness", 4);
    notify("Тренировка сработала.");
  }
  if (type === "meditate") {
    spendAction();
    change({ mental: 7, stress: -7, karma: 2, energy: 2 });
    notify("Голова стала яснее.");
  }
  if (type === "volunteer") {
    spendAction();
    change({ karma: 6, reputation: 2, happiness: 3, stress: 1 });
    improveSkill("empathy", 2);
    notify("Волонтерство улучшило репутацию.");
  }
  if (type === "social") {
    spendAction();
    const viral = Math.random() < (0.08 + state.skills.creativity / 1000 + state.fame / 900);
    change({ social: 2, network: 4, stress: 2, fame: viral ? 9 : 2 });
    improveSkill("creativity", 1);
    notify(viral ? "Пост резко набрал популярность." : "Соцсети дали немного внимания.");
  }
  if (type === "style") {
    const cost = Math.floor(380 * cityData().cost);
    if (state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    change({ looks: 6, happiness: 2, stress: -1 });
    notify("Стиль обновлен.");
  }
  if (type === "vacation") {
    const cost = Math.floor(900 * cityData().cost);
    if (state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    change({ happiness: 12, stress: -12, mental: 5, energy: 6 });
    notify("Отпуск перезагрузил жизнь.");
  }
  if (type === "lottery") {
    if (state.age < 18 || state.personalMoney < 80) return;
    state.personalMoney -= 80;
    const win = Math.random() < 0.045 + state.karma / 5000;
    if (win) {
      const prize = Math.floor((1200 + roll(9000)) * cityData().salary);
      addIncome(prize);
      change({ happiness: 10, fame: 2 });
      notify(`Лотерея выиграла ${fmt(prize)}.`);
    } else {
      change({ happiness: -1 });
      notify("Лотерея не сыграла.");
    }
  }
  if (type === "gamble") {
    if (state.age < 18 || state.personalMoney < 180) return;
    state.personalMoney -= 180;
    const success = Math.random() < 0.38 + state.traits.risk / 900 + state.skills.finance / 1200;
    if (success) {
      const gain = 260 + roll(740);
      state.personalMoney += gain;
      change({ happiness: 4, stress: 3 });
      notify(`Азарт принес ${fmt(gain)}.`);
    } else {
      change({ stress: 6, happiness: -3, discipline: -2 });
      notify("Азартная игра ушла в минус.");
    }
  }
  if (type === "theft") {
    spendAction();
    const caught = Math.random() < 0.34 + (100 - cityData().safety) / 450 - state.traits.risk / 900;
    if (caught) {
      const fine = Math.floor((300 + roll(900)) * cityData().cost);
      state.criminalRecord += 1;
      payOrDebt(fine);
      change({ stress: 12, reputation: -8, karma: -8, happiness: -6 });
      notify(`Поймали. Штраф ${fmt(fine)}.`);
    } else {
      const gain = Math.floor((180 + roll(520)) * cityData().cost);
      state.personalMoney += gain;
      change({ stress: 5, karma: -6, reputation: -2 });
      notify(`Получилось скрыться: ${fmt(gain)}.`);
    }
  }
  if (type === "interview") {
    if (state.fame < 15) return;
    spendAction();
    const earned = Math.floor((120 + state.fame * 12 + state.social * 4) * cityData().salary);
    addIncome(earned);
    change({ fame: 5, network: 3, stress: 3 });
    notify(`Интервью принесло ${fmt(earned)}.`);
  }
  if (type === "ad") {
    if (state.fame < 25) return;
    spendAction();
    const earned = Math.floor((300 + state.fame * 28 + state.reputation * 8) * cityData().salary);
    addIncome(earned);
    change({ fame: 2, stress: 4, reputation: Math.random() < 0.18 ? -3 : 1 });
    notify(`Реклама принесла ${fmt(earned)}.`);
  }
  if (type === "lawyer") {
    const cost = Math.floor((900 + state.criminalRecord * 450) * cityData().cost);
    if (state.criminalRecord < 1 || state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    state.criminalRecord = Math.max(0, state.criminalRecord - 1);
    change({ stress: -5, reputation: 2, creditScore: 1 });
    notify("Адвокат смягчил юридический след.");
  }
  if (type === "apologize") {
    spendAction();
    change({ karma: 4, stress: -3, reputation: 1 });
    notify("Вы исправили часть напряжения.");
  }
}

function renderFamily() {
  const root = document.createDocumentFragment();
  const s = section("Семейное дерево", "Поколения связаны в единую схему: старшие, родители, вы с партнером и дети.");
  const tree = document.createElement("div");
  tree.className = "family-tree";
  tree.append(generation("Старшее поколение", state.family.filter((p) => p.role === "Бабушка" || p.role === "Дедушка"), "elders"));
  tree.append(generation("Родители", state.family.filter((p) => p.id === "mother" || p.id === "father"), "parents"));
  tree.append(generation("Вы и партнер", [player(), ...(state.relationship ? [partnerPerson()] : [])], "self"));
  tree.append(generation("Дети", state.children.length ? state.children.map(childPerson) : [], "children"));
  s.append(tree);
  root.append(s);

  const actions = section("Семейные действия", "Помощь семье, сепарация и забота о родителях влияют на экономику и связи.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const motherAction = state.age < 3 ? ["Быть рядом с мамой", "Ранняя привязанность снижает стресс.", "К маме"] : ["Поговорить с мамой", "Укрепляет связь и снижает стресс.", "Поговорить"];
  const fatherAction = state.age < 3 ? ["Быть рядом с папой", "Ранняя вовлеченность дает чувство безопасности.", "К папе"] : ["Поговорить с папой", "Поддержка отца помогает с уверенностью.", "Поговорить"];
  grid.append(
    card(motherAction[0], motherAction[1], "1 действие", button(motherAction[2], () => {
      if (!canAct()) return;
      spendAction();
      familyBond("mother", 6);
      change({ stress: -3, happiness: 2 });
      notify(state.age < 3 ? "Мама рядом, чувство безопасности стало крепче." : "Разговор с мамой стал эмоциональной опорой.");
    }, { disabled: !canAct() || !state.family.find((p) => p.id === "mother")?.alive, className: "primary" })),
    card(fatherAction[0], fatherAction[1], "1 действие", button(fatherAction[2], () => {
      if (!canAct()) return;
      spendAction();
      familyBond("father", 6);
      change({ discipline: 2, stress: -2 });
      notify(state.age < 3 ? "Папа рядом, уверенность растет." : "Разговор с папой помог собраться.");
    }, { disabled: !canAct() || !state.family.find((p) => p.id === "father")?.alive, className: "primary" })),
    card("Жить отдельно", "Свобода и расходы на жилье.", `Нужно ${fmt(cityData().housing)}`, button("Съехать", leaveParents, {
      disabled: state.age < 18 || !state.livingWithParents || state.personalMoney < cityData().housing,
    })),
    card("Помочь родителям", "Перевести часть личных денег в семейный бюджет.", fmt(400), button("Помочь", supportParents, {
      disabled: state.age < 18 || state.personalMoney < 400,
    })),
    card("Семейный совет", "Снизить конфликты и согласовать планы семьи.", "1 действие", button("Собрать", () => {
      if (!canAct()) return;
      spendAction();
      familyBond("mother", 3);
      familyBond("father", 3);
      change({ stress: -4, mental: 3, happiness: 2 });
      notify("Семейный совет снизил напряжение дома.");
    }, {
      disabled: !canAct(),
      className: "primary",
    })),
    card("Забота о старших", "Помочь бабушке или дедушке с делами и здоровьем.", state.age < 12 ? "Доступно с 12 лет" : "1 действие", button("Позаботиться", () => {
      if (!canAct() || state.age < 12) return;
      spendAction();
      const elders = state.family.filter((p) => p.alive && (p.role === "Бабушка" || p.role === "Дедушка"));
      elders.forEach((p) => {
        p.bond = clamp(p.bond + 4, 0, 100);
        p.health = clamp(p.health + 2, 0, 100);
      });
      change({ happiness: 3, stress: -1 });
      improveSkill("empathy", 3);
      notify("Старшие родственники получили заботу и поддержку.");
    }, {
      disabled: !canAct() || state.age < 12,
    }))
  );
  actions.append(grid);
  root.append(actions);
  return root;
}

function generation(title, people, kind) {
  const wrap = document.createElement("div");
  wrap.className = `generation ${kind}`;
  const h = document.createElement("div");
  h.className = "generation-title";
  h.textContent = title;
  const row = document.createElement("div");
  row.className = "person-row";
  if (!people.length) {
    row.append(card("Пока нет", "Эта ветка появится позже.", "", null));
  } else {
    people.forEach((p) => row.append(personNode(p)));
  }
  wrap.append(h, row);
  return wrap;
}

function partnerPerson() {
  return {
    name: state.relationship.name,
    role: state.relationship.married ? "Супруг/супруга" : "Партнер",
    age: state.relationship.age,
    alive: true,
    job: state.relationship.married ? "семья" : "отношения",
    bond: state.relationship.bond,
    trust: state.relationship.trust,
    romance: state.relationship.romance,
    health: 80,
  };
}

function childPerson(child) {
  return { name: child.name, role: "Ребенок", age: child.age, alive: true, job: "растет", bond: child.bond, health: child.health };
}

function personNode(p) {
  const node = document.createElement("article");
  node.className = `person tree-node${p.alive ? "" : " dead"}`;
  node.innerHTML = `<div class="person-name"></div><div class="person-role"></div><div class="person-details"></div>`;
  node.querySelector(".person-name").textContent = p.name;
  node.querySelector(".person-role").textContent = `${p.role}, ${ageText(p.age)}${p.alive ? "" : " - память"}`;
  const romantic = p.romance !== undefined ? ` · доверие ${p.trust ?? 0}/100 · романтика ${p.romance ?? 0}/100` : "";
  node.querySelector(".person-details").textContent = `${p.job || "без занятия"} · связь ${p.bond ?? 0}/100${romantic} · здоровье ${p.health ?? 0}/100`;
  return node;
}

function renderWorld() {
  const root = document.createDocumentFragment();
  const current = section("Место жизни", `Сейчас: ${cityName()}, ${countryName()}. Город влияет на зарплаты, стоимость жизни, образование и возможности.`);
  const tags = document.createElement("div");
  tags.className = "tagline";
  const city = cityData();
  [`Стоимость x${city.cost}`, `Зарплаты x${city.salary}`, `Образование ${city.education}`, `Безопасность ${city.safety}`, `Возможности ${city.opportunity}`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  current.append(tags);
  root.append(current);

  const moves = section("Переезд", "После 18 лет можно переехать кнопкой, если хватает денег на старт.");
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [countryId, country] of Object.entries(countries)) {
    for (const [cityId, c] of Object.entries(country.cities)) {
      const active = countryId === state.country && cityId === state.city;
      const cost = Math.floor(c.housing * 1.5);
      const needsPassport = countryId !== state.country && !state.documents.passport;
      grid.append(card(`${c.name}, ${country.name}`, `Возможности ${c.opportunity}, образование ${c.education}, безопасность ${c.safety}.`, active ? "Вы здесь." : `${needsPassport ? "Нужен паспорт. " : ""}Переезд: ${fmt(cost)}.`, button(active ? "Текущий город" : "Переехать", () => moveTo(countryId, cityId), {
        disabled: active || state.age < 18 || state.personalMoney < cost || state.event || needsPassport,
        className: "primary",
      })));
    }
  }
  moves.append(grid);
  root.append(moves);
  return root;
}

function renderEducation() {
  const root = document.createDocumentFragment();
  const s = section("Образование и навыки", `Текущий уровень: ${state.educationLevel}. Оценки: ${state.grades}/100.`);
  s.append(renderActionGrid(getActions().filter((a) => ["Учиться в школе", "Кружок", "Спорт", "Друзья", "Олимпиада", "Мини-проект", "Стажировка", "Личный бренд"].includes(a.title))));
  root.append(s);

  const profs = section("Выбор профессии", "Профессия выбирается кнопкой, когда хватает знаний и социальных навыков.");
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [id, prof] of Object.entries(professions)) {
    if (id === "none") continue;
    const selected = state.profession === id;
    const disabled = selected || state.age < 16 || state.knowledge < prof.knowledge || state.social < prof.social;
    grid.append(card(prof.name, `Доходная база: ${fmt(prof.salary)}. Стресс работы: ${prof.stress}.`, `Нужно: знания ${prof.knowledge}, общение ${prof.social}.`, button(selected ? "Выбрано" : "Выбрать", () => chooseProfession(id), {
      disabled,
      className: selected ? "" : "primary",
    })));
  }
  profs.append(grid);
  root.append(profs);

  const higher = section("Дальнейшее обучение", "После школы можно вложиться в колледж или университет.");
  const b = document.createElement("div");
  b.className = "button-grid";
  const collegeCost = Math.floor(1200 * cityData().cost);
  const universityCost = Math.floor(2400 * cityData().cost);
  b.append(
    button(`Колледж ${fmt(collegeCost)}`, () => enroll("college"), { disabled: state.age < 17 || state.actions < 1 || state.personalMoney + state.familyMoney < collegeCost }),
    button(`Университет ${fmt(universityCost)}`, () => enroll("university"), { disabled: state.age < 17 || state.actions < 1 || state.personalMoney + state.familyMoney < universityCost })
  );
  higher.append(b);
  root.append(higher);

  const certs = section("Сертификаты", "");
  const certGrid = document.createElement("div");
  certGrid.className = "grid";
  for (const [id, cert] of Object.entries(certificateCatalog)) {
    const owned = hasCertificate(id);
    const cost = Math.floor(cert.cost * cityData().cost);
    const disabled = owned || state.age < 16 || state.knowledge < cert.knowledge || state.social < cert.social || state.personalMoney + state.familyMoney < cost || !canAct();
    certGrid.append(card(cert.name, "", owned ? "Получен" : `${fmt(cost)}, знания ${cert.knowledge}, общение ${cert.social}`, button(owned ? "Есть" : "Получить", () => acquireCertificate(id), {
      disabled,
      className: owned ? "" : "primary",
    })));
  }
  certs.append(certGrid);
  root.append(certs);
  return root;
}

function renderCareer() {
  const root = document.createDocumentFragment();
  const s = section("Работа и профессия", `Профессия: ${professionData().name}. Карьерный уровень: ${state.careerLevel}. Опыт: ${state.experience}.`);
  s.append(renderActionGrid(getActions().filter((a) => ["Подработка", "Работать по профессии", "Фриланс"].includes(a.title))));
  const tags = document.createElement("div");
  tags.className = "tagline";
  [`Портфолио: ${state.portfolio}/100`, `Связи: ${state.network}/100`, `Сертификаты: ${state.certificates.length}`, `Доход: ${fmt(annualSalary())}`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  s.append(tags);
  root.append(s);
  const growth = section("Карьерное развитие", "Продвижение зависит от опыта, навыков, репутации и общения.");
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.append(
    card("Портфолио", "Собрать заметные результаты работы.", "1 действие, репутация +4", button("Собрать", () => {
      if (!canAct()) return;
      spendAction();
      change({ portfolio: 8, reputation: 3, stress: 2 });
      improveSkill("leadership", 1);
      notify("Портфолио усилило вашу карьерную позицию.");
    }, { disabled: !canAct(), className: "primary" })),
    card("Нетворкинг", "Познакомиться с людьми из отрасли.", "1 действие, общение +5", button("Встречаться", () => {
      if (!canAct()) return;
      spendAction();
      change({ network: 8, social: 3, reputation: 2, stress: 2 });
      improveSkill("empathy", 2);
      notify("Новые профессиональные контакты открыли будущие возможности.");
    }, { disabled: !canAct(), className: "primary" })),
    card("Смена позиции", "Найти работу лучше.", `Связи 35, портфолио 25`, button("Искать", () => careerMove("switch"), {
      disabled: !canAct() || state.profession === "none" || state.network < 35 || state.portfolio < 25,
      className: "primary",
    })),
    card("Просить повышение", "Попытаться поднять карьерный уровень.", "Нужны опыт и репутация", button("Попросить", () => {
      careerMove("raise");
    }, { disabled: !canAct() || state.profession === "none" })),
    card("Ментор", "Учиться у сильного специалиста.", `${fmt(Math.floor(500 * cityData().cost))}`, button("Найти", () => careerMove("mentor"), {
      disabled: !canAct() || state.age < 16 || state.personalMoney < Math.floor(500 * cityData().cost),
    })),
    card("Отпуск без выгорания", "Сбросить стресс карьеры.", "1 действие", button("Взять", () => careerMove("rest"), {
      disabled: !canAct() || state.age < 18,
    }))
  );
  growth.append(grid);
  root.append(growth);
  return root;
}

function careerMove(type) {
  if (!canAct()) return;
  if (type === "raise") {
    if (state.profession === "none") return;
    spendAction();
    const chance = state.experience * 10 + state.reputation + state.portfolio * 0.5 + state.network * 0.35 + skillAverage(professionSkillIds()) - state.stress * 0.4;
    if (chance > 45 + state.careerLevel * 18) {
      state.careerLevel += 1;
      change({ happiness: 5, reputation: 2, creditScore: 1 });
      notify("Повышение получилось. Карьерный уровень вырос.");
    } else {
      change({ stress: 5, discipline: 1, network: 2 });
      notify("Повышение пока не дали. Появились новые требования.");
    }
  }
  if (type === "switch") {
    if (state.profession === "none" || state.network < 35 || state.portfolio < 25) return;
    spendAction();
    const success = state.network + state.portfolio + state.reputation + certificateBonus() * 4 > 85 + state.careerLevel * 10;
    if (success) {
      state.careerLevel += 1;
      state.experience += 1;
      change({ happiness: 4, reputation: 3, stress: 4, creditScore: 2 });
      notify("Смена позиции удалась. Доходный потенциал вырос.");
    } else {
      change({ stress: 4, network: 3, portfolio: 2 });
      notify("Рынок дал обратную связь. Портфолио стало точнее.");
    }
  }
  if (type === "mentor") {
    const cost = Math.floor(500 * cityData().cost);
    if (state.personalMoney < cost) return;
    spendAction();
    state.personalMoney -= cost;
    change({ knowledge: 5, portfolio: 5, network: 5, reputation: 2 });
    improveSkill(professionSkillIds()[0], 4);
    notify("Ментор ускорил профессиональный рост.");
  }
  if (type === "rest") {
    spendAction();
    change({ stress: -14, mental: 6, energy: 8, reputation: -1 });
    notify("Пауза снизила риск выгорания.");
  }
}

function renderHealth() {
  const root = document.createDocumentFragment();
  const s = section("Здоровье, энергия и психика", "Физическое и ментальное состояние влияют на действия, карьеру, отношения, события и медицинские расходы.");
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.append(
    metricCard("Физическое здоровье", state.health, "Болезни, спорт, безопасность города и страховка."),
    metricCard("Ментальное состояние", state.mental, "Стресс, счастье, отношения, отдых и терапия."),
    metricCard("Энергия", state.energy, "Сон, здоровье, работа и качество быта.")
  );
  s.append(grid);
  root.append(s);

  const actions = section("Забота о себе", "Профилактика дешевле кризисов. Некоторые действия требуют денег после 18 лет.");
  const agrid = document.createElement("div");
  agrid.className = "grid";
  agrid.append(
    card("Нормальный сон", "Восстановить энергию и снизить стресс.", "1 действие", button("Выспаться", () => {
      if (!canAct()) return;
      spendAction();
      change({ energy: 14, stress: -7, mental: 3, discipline: -1 });
      notify("Хороший сон вернул энергию.");
    }, { disabled: !canAct(), className: "primary" })),
    card("Питание", "Еда и режим улучшают долгосрочное здоровье.", state.age < 18 ? `Семейный бюджет ${fmt(160)}` : fmt(260), button("Наладить", () => {
      if (!canAct()) return;
      const cost = state.age < 18 ? 160 : 260;
      if (state.age < 18) state.familyMoney -= Math.min(state.familyMoney, cost);
      else payOrDebt(cost);
      spendAction();
      change({ health: 5, energy: 5, stress: -2 });
      notify("Питание стало лучше, организм крепче.");
    }, { disabled: !canAct(), className: "primary" })),
    card("Психолог", "Работа с тревогой и выгоранием.", state.age < 18 ? `Семейный бюджет ${fmt(300)}` : fmt(500), button("Сходить", () => {
      if (!canAct()) return;
      const cost = state.age < 18 ? 300 : 500;
      if (state.age < 18) state.familyMoney -= Math.min(state.familyMoney, cost);
      else payOrDebt(cost);
      spendAction();
      change({ mental: 12, stress: -10, happiness: 2 });
      improveSkill("empathy", 1);
      notify("Психолог помог разобрать напряжение.");
    }, { disabled: !canAct() || (state.age >= 18 && state.personalMoney + 300 < 500) })),
    card("Медосмотр", "Снижает риск дорогого кризиса.", state.documents.insurance === "premium" ? fmt(120) : fmt(350), button("Пройти", () => {
      if (!canAct()) return;
      const cost = state.documents.insurance === "premium" ? 120 : 350;
      payOrDebt(cost);
      spendAction();
      change({ health: 10, stress: -3, energy: 2 });
      notify("Медосмотр помог поймать проблемы заранее.");
    }, { disabled: !canAct() || state.age < 18 }))
  );
  actions.append(agrid);
  root.append(actions);
  return root;
}

function metricCard(title, value, text) {
  const node = document.createElement("article");
  node.className = "card";
  node.innerHTML = `<h3></h3><div class="meter"><span></span></div><div class="mini"></div>`;
  node.querySelector("h3").textContent = title;
  node.querySelector(".meter span").style.setProperty("--value", `${clamp(value, 0, 100)}%`);
  node.querySelector(".mini").textContent = `${Math.floor(value)} из 100`;
  return node;
}

function renderSkills() {
  const root = document.createDocumentFragment();
  const s = section("Навыки и характер", "Навыки растут от детских занятий, учебы, работы и отдельных тренировок. Они напрямую влияют на доход, отношения, бизнес и переезд.");
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [id, skill] of Object.entries(skillCatalog)) {
    const cost = state.age < 18 ? 0 : 180 + Math.floor((state.skills[id] || 0) * 4);
    const disabled = !canAct() || (state.age >= 18 && state.personalMoney < cost);
    grid.append(card(skill.name, skill.text, `Уровень: ${state.skills[id] || 0}/100. ${state.age < 18 ? "Детское развитие бесплатно." : `Цена: ${fmt(cost)}.`}`, button(state.age < 18 ? skill.childhood : "Тренировать", () => {
      if (disabled) return;
      spendAction();
      if (state.age >= 18) state.personalMoney -= cost;
      const gain = state.age < 18 ? 5 : 4;
      improveSkill(id, gain + Math.floor(state.traits.curiosity / 40));
      if (id === "fitness") change({ health: 3, stress: -2 });
      if (id === "empathy") change({ social: 2, happiness: 1 });
      if (id === "finance") change({ discipline: 2 });
      if (id === "leadership") change({ reputation: 1, social: 1 });
      notify(`${skill.name}: навык вырос.`);
    }, { disabled, className: "primary" })));
  }
  s.append(grid);
  root.append(s);

  const traits = section("Черты характера", "Они задаются при рождении и мягко направляют стиль игры.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Любознательность: ${state.traits.curiosity}`,
    `Риск: ${state.traits.risk}`,
    `Доброта: ${state.traits.kindness}`,
    `Амбиции: ${state.traits.ambition}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  traits.append(tags);
  root.append(traits);
  return root;
}

function renderMoney() {
  const root = document.createDocumentFragment();
  const s = section("Личная экономика", `Личные деньги начинаются с нуля. Капитал сейчас: ${fmt(netWorth())}. Годовые личные расходы: ${fmt(personalCost())}.`);
  const status = document.createElement("div");
  status.className = "tagline";
  [`Бюджет: ${budgetModeData().name}`, `Резерв: ${emergencyFundMonths()} мес.`, `Кредитный лимит: ${fmt(creditLimit())}`, `Рейтинг: ${state.creditScore}/100`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    status.append(tag);
  });
  s.append(status);
  const grid = document.createElement("div");
  grid.className = "grid";
  [500, 1500, 5000].forEach((amount) => {
    grid.append(card(`Заем ${fmt(amount)}`, "Можно взять деньги сейчас, но долг растет процентами каждый год.", `Текущий долг: ${fmt(state.debt)}`, button("Взять", () => {
      if (borrow(amount)) notify(`Взят заем ${fmt(amount)}.`);
    }, { disabled: state.age < 18 || state.event || state.debt + amount > creditLimit(), className: "money" })));
  });
  [500, 1500, state.debt].forEach((amount, index) => {
    grid.append(card(index === 2 ? "Закрыть долг" : `Погасить ${fmt(amount)}`, "Снижение долга повышает устойчивость жизни.", `Доступно: ${fmt(state.personalMoney)}`, button(index === 2 ? "Закрыть" : "Погасить", () => {
      const paid = Math.min(amount, state.personalMoney, state.debt);
      state.personalMoney -= paid;
      state.debt -= paid;
      if (paid > 0) changeCredit(2);
      notify(`Погашено ${fmt(paid)}.`);
    }, { disabled: state.debt <= 0 || state.personalMoney <= 0 })));
  });
  s.append(grid);
  root.append(s);
  const budget = section("Бюджет и стиль жизни", "Чем выше быт, тем больше счастья, но расходы могут съесть свободу.");
  const modeGrid = document.createElement("div");
  modeGrid.className = "grid";
  for (const [id, mode] of Object.entries(budgetModes)) {
    modeGrid.append(card(mode.name, "", `Расходы x${mode.cost}`, button(state.budgetMode === id ? "Выбрано" : "Выбрать", () => setBudgetMode(id), {
      disabled: state.budgetMode === id || state.event,
      className: state.budgetMode === id ? "" : "primary",
    })));
  }
  modeGrid.append(card("Резерв", "", `${emergencyFundMonths()} / ${state.emergencyFundTarget} мес.`, button("Отложить", () => saveEmergencyFund(), {
    disabled: state.age < 18 || state.personalMoney < Math.floor(personalCost() * 0.5) || state.event,
    className: "money",
  })));
  budget.append(modeGrid);
  root.append(budget);
  return root;
}

function setBudgetMode(id) {
  if (!budgetModes[id]) return;
  state.budgetMode = id;
  notify(`Бюджет: ${budgetModes[id].name}.`);
}

function saveEmergencyFund() {
  const amount = Math.floor(Math.max(250, personalCost() * 0.5));
  if (state.personalMoney < amount) return;
  state.personalMoney -= amount;
  state.assets.deposits += amount;
  change({ discipline: 3, happiness: -1, creditScore: 1 });
  notify(`В резерв отложено ${fmt(amount)}.`);
}

function renderHome() {
  const root = document.createDocumentFragment();
  const home = section("Дом и быт", `Текущее жилье: ${housingData().name}. Качество: ${housingData().quality}/100. Годовая стоимость: ${fmt(Math.floor(housingData().annual * cityData().cost))}.`);
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [id, item] of Object.entries(housingCatalog)) {
    if (id === "parents" && state.age >= 18) continue;
    const active = state.housing === id;
    const annual = Math.floor(item.annual * cityData().cost);
    const buy = item.buy ? Math.floor(item.buy * cityData().cost) : 0;
    const needed = buy || annual;
    grid.append(card(item.name, `Счастье ${item.happiness >= 0 ? "+" : ""}${item.happiness}, стресс ${item.stress >= 0 ? "+" : ""}${item.stress}.`, item.buy ? `Покупка: ${fmt(buy)}. Содержание: ${fmt(annual)}.` : `Годовая стоимость: ${fmt(annual)}.`, button(active ? "Вы здесь" : item.buy ? "Купить" : "Переехать", () => changeHousing(id), {
      disabled: active || state.age < item.minAge || state.personalMoney < needed || state.event,
      className: "primary",
    })));
  }
  home.append(grid);
  root.append(home);

  const possessions = section("Вещи и инструменты", "Покупки дают постоянные маленькие бонусы, но деньги уходят сразу.");
  const pgrid = document.createElement("div");
  pgrid.className = "grid";
  for (const [id, item] of Object.entries(possessionCatalog)) {
    const owned = hasPossession(id);
    pgrid.append(card(item.name, item.text, owned ? "Уже куплено." : `Цена: ${fmt(item.cost)}.`, button(owned ? "Есть" : "Купить", () => buyPossession(id), {
      disabled: owned || state.personalMoney < item.cost || state.event,
    })));
  }
  possessions.append(pgrid);
  root.append(possessions);
  return root;
}

function changeHousing(id) {
  const item = housingCatalog[id];
  if (!item || state.age < item.minAge) return;
  const annual = Math.floor(item.annual * cityData().cost);
  const buy = item.buy ? Math.floor(item.buy * cityData().cost) : 0;
  const cost = buy || annual;
  if (state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.housing = id;
  state.livingWithParents = id === "parents";
  if (item.buy) state.assets.property += Math.floor(buy * 0.75);
  change({ happiness: item.happiness, stress: item.stress, lifestyle: Math.floor(item.quality / 12) });
  notify(`Новое жилье: ${item.name}.`);
}

function buyPossession(id) {
  const item = possessionCatalog[id];
  if (!item || hasPossession(id) || state.personalMoney < item.cost) return;
  state.personalMoney -= item.cost;
  state.possessions.push(id);
  if (item.bonus && state.skills[item.bonus] !== undefined) improveSkill(item.bonus, 4);
  if (item.bonus === "mobility") change({ lifestyle: 4, stress: -1 });
  notify(`Покупка: ${item.name}.`);
}

function renderAssets() {
  const root = document.createDocumentFragment();
  const s = section("Активы и капитал", "Деньги можно держать в наличных, вкладах, акциях, пенсионном капитале и недвижимости. Риск зависит от финансового навыка.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const assetRows = [
    ["deposits", "Вклад", "Низкий риск, небольшой процент каждый год."],
    ["stocks", "Акции", "Доходность плавает: можно заработать или потерять."],
    ["pension", "Пенсионный капитал", "Длинные деньги: лучше для поздней жизни."],
  ];
  for (const [id, title, text] of assetRows) {
    grid.append(card(title, text, `Сейчас: ${fmt(state.assets[id])}.`, assetButtons(id)));
  }
  grid.append(card("Капитал", "Сумма денег, активов, компании и жилья минус долг.", `Итого: ${fmt(netWorth())}.`, null));
  s.append(grid);
  root.append(s);
  return root;
}

function assetButtons(id) {
  const wrap = document.createElement("div");
  wrap.className = "button-grid";
  [300, 1000].forEach((amount) => {
    wrap.append(button(`Вложить ${fmt(amount)}`, () => investAsset(id, amount), {
      disabled: state.personalMoney < amount || state.event,
      className: "primary",
    }));
  });
  wrap.append(button("Вывести 25%", () => withdrawAsset(id), {
    disabled: state.assets[id] <= 0 || state.event,
  }));
  return wrap;
}

function investAsset(id, amount) {
  if (state.personalMoney < amount) return;
  state.personalMoney -= amount;
  state.assets[id] += amount;
  improveSkill("finance", 1);
  notify(`Вложено ${fmt(amount)} в ${assetName(id)}.`);
}

function withdrawAsset(id) {
  const amount = Math.floor(state.assets[id] * 0.25);
  if (amount <= 0) return;
  state.assets[id] -= amount;
  state.personalMoney += amount;
  notify(`Выведено ${fmt(amount)} из ${assetName(id)}.`);
}

function assetName(id) {
  return id === "deposits" ? "вклад" : id === "stocks" ? "акции" : "пенсионный капитал";
}

function renderBusiness() {
  const root = document.createDocumentFragment();
  const s = section("Создание компании", "Компания становится отдельной экономикой: касса, сотрудники, репутация, прибыль и стресс.");
  if (!state.company) {
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const [id, sector] of Object.entries(companySectors)) {
      const disabled = state.age < 18 || state.personalMoney < sector.cost || state.knowledge < sector.knowledge || state.social < sector.social;
      grid.append(card(sector.name, `Базовая выручка: ${fmt(sector.baseRevenue)}. Стресс: ${sector.stress}.`, `Нужно ${fmt(sector.cost)}, знания ${sector.knowledge}, общение ${sector.social}.`, button("Открыть", () => startCompany(id), {
        disabled: disabled || !canAct(),
        className: "primary",
      })));
    }
    s.append(grid);
  } else {
    const sector = companySectors[state.company.sector];
    const grid = document.createElement("div");
    grid.className = "grid";
    grid.append(
      card(sector.name, `Касса: ${fmt(state.company.cash)}. Репутация: ${state.company.reputation}. Сотрудники: ${state.company.employees}.`, `Уровень ${state.company.level}.`, null),
      card("Продажи", "Активно искать клиентов и заказы.", "1 действие", button("Продавать", () => companyAction("sell"), { disabled: !canAct(), className: "primary" })),
      card("Найм", "Сотрудники увеличивают годовую мощность.", `${fmt(900)} из кассы компании`, button("Нанять", () => companyAction("hire"), { disabled: !canAct() || state.company.cash < 900 })),
      card("Улучшение", "Процессы, продукт, оборудование.", `${fmt(1300)} из кассы компании`, button("Улучшить", () => companyAction("improve"), { disabled: !canAct() || state.company.cash < 1300 })),
      card("Маркетинг", "", `${fmt(700)} из кассы`, button("Запустить", () => companyAction("marketing"), { disabled: !canAct() || state.company.cash < 700 })),
      card("Качество", "", `${fmt(1000)} из кассы`, button("Усилить", () => companyAction("quality"), { disabled: !canAct() || state.company.cash < 1000 })),
      card("Автоматизация", "", `${fmt(1800)} из кассы`, button("Внедрить", () => companyAction("automation"), { disabled: !canAct() || state.company.cash < 1800 })),
      card("Филиал", "", `${fmt(3200)} из кассы`, button("Открыть", () => companyAction("branch"), { disabled: !canAct() || state.company.cash < 3200 })),
      card("Бизнес-кредит", "", `Долг: ${fmt(state.company.debt || 0)}`, button("Взять", () => companyAction("loan"), { disabled: !canAct() || state.creditScore < 35, className: "money" })),
      card("Погасить долг", "", `До ${fmt(1200)}`, button("Погасить", () => companyAction("repay"), { disabled: !state.company.debt || state.company.cash <= 0 })),
      card("Дивиденды", "Вывести четверть кассы в личные деньги.", `Минимум ${fmt(500)} в кассе`, button("Вывести", () => companyAction("withdraw"), { disabled: state.company.cash < 500, className: "money" }))
    );
    s.append(grid);
  }
  root.append(s);
  return root;
}

function renderRelationships() {
  const root = document.createDocumentFragment();
  const s = section("Отношения и своя семья", "Партнер, брак и дети влияют на счастье, расходы, стресс и семейное дерево.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const dateCost = Math.floor(260 * cityData().cost);
  const giftCost = Math.floor(420 * cityData().cost);
  grid.append(
    card("Найти отношения", "Шанс зависит от социальности и счастья.", state.relationship ? `Уже есть: ${state.relationship.name}` : "Возраст 16+", button("Познакомиться", startRelationship, {
      disabled: state.age < 16 || Boolean(state.relationship) || !canAct(),
      className: "primary",
    })),
    card("Теплое свидание", state.relationship ? `Романтика: ${state.relationship.romance ?? 0}/100.` : "Сначала нужно познакомиться.", `1 действие, ${fmt(dateCost)}`, button("На свидание", () => romanticAction("date"), {
      disabled: !state.relationship || !canAct() || state.personalMoney < dateCost,
      className: "primary",
    })),
    card("Глубокий разговор", state.relationship ? `Доверие: ${state.relationship.trust ?? 0}/100.` : "Сначала нужно познакомиться.", "1 действие, без расходов", button("Поговорить", () => romanticAction("talk"), {
      disabled: !state.relationship || !canAct(),
      className: "primary",
    })),
    card("Подарок", "Не заменяет доверие, но хорошо работает вместе с вниманием.", `${fmt(giftCost)}`, button("Подарить", () => romanticAction("gift"), {
      disabled: !state.relationship || !canAct() || state.personalMoney < giftCost,
    })),
    card("Решить конфликт", state.relationship ? `Напряжение: ${state.relationship.conflict ?? 0}/100.` : "Сначала нужно познакомиться.", "1 действие", button("Примириться", () => romanticAction("repair"), {
      disabled: !state.relationship || !canAct() || (state.relationship.conflict ?? 0) < 8,
    })),
    card("План на будущее", "Разговор о жилье, деньгах, детях и переезде.", "1 действие", button("Планировать", () => romanticAction("future"), {
      disabled: !state.relationship || !canAct() || (state.relationship.trust ?? 0) < 45,
    })),
    card("Брак", "Создать свою семью.", `Нужно связь 70 и ${fmt(Math.floor(1100 * cityData().cost))}.`, button("Пожениться", marry, {
      disabled: !state.relationship || state.relationship.married || state.relationship.bond < 70 || (state.relationship.trust || 0) < 55 || state.age < 18 || state.personalMoney < Math.floor(1100 * cityData().cost) || !canAct(),
    })),
    card("Общий бюджет", "После брака можно объединить часть денег и снизить бытовые трения.", state.relationship?.sharedBudget ? "Уже включен." : "Требуется брак", button("Объединить", () => romanticAction("budget"), {
      disabled: !state.relationship || !state.relationship.married || state.relationship.sharedBudget || !canAct(),
    })),
    card("Ребенок", "Новая ветка семьи и новые расходы.", `Детей: ${state.children.length}.`, button("Родить ребенка", haveChild, {
      disabled: !state.relationship || !state.relationship.married || state.age < 20 || state.children.length >= 4 || !canAct(),
    }))
  );
  s.append(grid);
  root.append(s);
  if (state.children.length) {
    const kids = section("Развитие детей", "Каждый ребенок растет отдельно. Вложения в детей повышают связь, здоровье и будущую устойчивость семьи.");
    const kg = document.createElement("div");
    kg.className = "grid";
    state.children.forEach((child, index) => {
      kg.append(card(child.name, `Возраст: ${ageText(child.age)}. Связь ${child.bond}/100. Здоровье ${child.health}/100.`, "Действия родителя", button("Вложиться в ребенка", () => investInChild(index), {
        disabled: !canAct() || state.personalMoney + state.familyMoney < 350,
        className: "primary",
      })));
    });
    kids.append(kg);
    root.append(kids);
  }
  return root;
}

function romanticAction(type) {
  if (!state.relationship || !canAct()) return;
  const rel = state.relationship;
  const dateCost = Math.floor(260 * cityData().cost);
  const giftCost = Math.floor(420 * cityData().cost);
  if (type === "date") {
    if (state.personalMoney < dateCost) return;
    state.personalMoney -= dateCost;
    spendAction();
    rel.romance = clamp((rel.romance || 0) + 11, 0, 100);
    rel.bond = clamp(rel.bond + 5, 0, 100);
    rel.conflict = clamp((rel.conflict || 0) - 3, 0, 100);
    change({ happiness: 5, stress: -2, social: 1 });
    notify("Свидание добавило тепла и романтики.");
  }
  if (type === "talk") {
    spendAction();
    rel.trust = clamp((rel.trust || 0) + 10 + Math.floor(state.skills.empathy / 25), 0, 100);
    rel.bond = clamp(rel.bond + 4, 0, 100);
    rel.conflict = clamp((rel.conflict || 0) - 4, 0, 100);
    improveSkill("empathy", 2);
    change({ mental: 3, stress: -3 });
    notify("Честный разговор укрепил доверие.");
  }
  if (type === "gift") {
    if (state.personalMoney < giftCost) return;
    state.personalMoney -= giftCost;
    spendAction();
    rel.romance = clamp((rel.romance || 0) + 7, 0, 100);
    rel.bond = clamp(rel.bond + 3, 0, 100);
    change({ happiness: 2 });
    notify("Подарок стал приятным знаком внимания.");
  }
  if (type === "repair") {
    spendAction();
    const empathyBonus = Math.floor(state.skills.empathy / 18);
    rel.conflict = clamp((rel.conflict || 0) - 14 - empathyBonus, 0, 100);
    rel.trust = clamp((rel.trust || 0) + 4, 0, 100);
    change({ stress: -6, mental: 3 });
    notify("Конфликт удалось разобрать спокойнее.");
  }
  if (type === "future") {
    spendAction();
    rel.trust = clamp((rel.trust || 0) + 7, 0, 100);
    rel.bond = clamp(rel.bond + 5, 0, 100);
    rel.romance = clamp((rel.romance || 0) + 2, 0, 100);
    rel.conflict = clamp((rel.conflict || 0) + (state.traits.risk > 65 ? 2 : -2), 0, 100);
    change({ discipline: 2, stress: -1 });
    notify("Вы обсудили будущее: деньги, жилье, детей и планы.");
  }
  if (type === "budget") {
    spendAction();
    rel.sharedBudget = true;
    const support = Math.floor((rel.trust + rel.bond) * cityData().salary * 4);
    state.personalMoney += support;
    rel.conflict = clamp((rel.conflict || 0) - 6, 0, 100);
    change({ stress: -4, discipline: 2 });
    notify(`Общий бюджет добавил устойчивости: ${fmt(support)}.`);
  }
}

function investInChild(index) {
  const child = state.children[index];
  if (!child || !canAct()) return;
  spendAction();
  const cost = 350;
  if (state.personalMoney >= cost) state.personalMoney -= cost;
  else state.familyMoney -= Math.min(state.familyMoney, cost);
  child.bond = clamp(child.bond + 8, 0, 100);
  child.health = clamp(child.health + 4, 0, 100);
  change({ happiness: 4, stress: 2 });
  improveSkill("empathy", 2);
  notify(`Вы вложились в развитие ребенка: ${child.name}.`);
}

function renderDocuments() {
  const root = document.createDocumentFragment();
  const s = section("Документы и статус", "Документы открывают работу, переезд, налоги, страховку и часть взрослых решений.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const docs = [
    ["birthCertificate", "Свидетельство о рождении", "Есть с рождения. Нужно для школы, семьи и базовых прав.", 0, 0],
    ["passport", "Паспорт", "Нужен для международного переезда и части взрослых действий.", 14, 220],
    ["taxId", "Налоговый номер", "Снижает налоговые штрафы и делает доходы официальными.", 16, 120],
    ["driverLicense", "Водительские права", "Нужны для автомобиля и некоторых карьерных возможностей.", 18, 650],
    ["workPermit", "Разрешение на работу", "После переезда в другую страну его нужно оформить заново.", 18, 900],
  ];
  for (const [id, title, text, age, cost] of docs) {
    const owned = Boolean(state.documents[id]);
    const disabled = owned || state.age < age || state.personalMoney < cost || state.event;
    grid.append(card(title, text, owned ? "Оформлено." : `Возраст: ${age}+. Цена: ${fmt(cost)}.`, button(owned ? "Есть" : "Оформить", () => acquireDocument(id, cost), {
      disabled,
      className: owned ? "" : "primary",
    })));
  }
  s.append(grid);
  root.append(s);

  const insurance = section("Страховка", "Страховка снижает медицинские риски и делает здоровье дешевле.");
  const ig = document.createElement("div");
  ig.className = "grid";
  [
    ["none", "Без страховки", 0, "Лечение дорогое, риск долгов выше."],
    ["basic", "Базовая страховка", 360, "Умеренные платежи, часть лечения дешевле."],
    ["premium", "Расширенная страховка", 900, "Дороже каждый год, но кризисы мягче."],
  ].forEach(([id, title, cost, text]) => {
    const active = state.documents.insurance === id;
    ig.append(card(title, text, active ? "Текущий вариант." : `Взнос: ${fmt(cost)}.`, button(active ? "Выбрано" : "Выбрать", () => setInsurance(id, cost), {
      disabled: active || state.age < 18 || state.personalMoney < cost || state.event,
    })));
  });
  insurance.append(ig);
  root.append(insurance);

  const status = section("Юридический след", "Налоги и разрешения влияют на репутацию и стресс.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [`Налоговая база: ${fmt(state.taxableIncome)}`, `Уплачено налогов: ${fmt(state.taxesPaid)}`, `Налоговый долг: ${fmt(state.taxDebt)}`, `Визы: ${state.documents.visas.length || 0}`, `Разрешение на работу: ${state.documents.workPermit ? "есть" : "нет"}`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  status.append(tags);
  root.append(status);
  return root;
}

function acquireDocument(id, cost) {
  if (state.documents[id] || state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.documents[id] = true;
  if (id === "taxId") change({ stress: -2, reputation: 1 });
  if (id === "passport") improveSkill("language", 1);
  notify(`Документ оформлен: ${documentName(id)}.`);
}

function setInsurance(id, cost) {
  if (state.age < 18 || state.personalMoney < cost) return;
  state.personalMoney -= cost;
  state.documents.insurance = id;
  change({ stress: id === "premium" ? -4 : id === "basic" ? -2 : 2 });
  notify(`Страховка изменена: ${insuranceName(id)}.`);
}

function documentName(id) {
  const namesMap = {
    birthCertificate: "свидетельство о рождении",
    passport: "паспорт",
    taxId: "налоговый номер",
    driverLicense: "водительские права",
    workPermit: "разрешение на работу",
  };
  return namesMap[id] || id;
}

function insuranceName(id) {
  return id === "premium" ? "расширенная" : id === "basic" ? "базовая" : "без страховки";
}

function renderReport() {
  const root = document.createDocumentFragment();
  const s = section("Сводка жизни", "Цель не одна: можно стать счастливым, богатым, семейным, известным, образованным или построить бизнес.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Год: ${state.year}`,
    `Возраст: ${state.age}`,
    `Место: ${cityName()}, ${countryName()}`,
    `Образование: ${state.educationLevel}`,
    `Профессия: ${professionData().name}`,
    `Доход работы: ${fmt(annualSalary())}`,
    `Капитал: ${fmt(netWorth())}`,
    `Жилье: ${housingData().name}`,
    `Психика: ${state.mental}/100`,
    `Энергия: ${state.energy}/100`,
    `Внешность: ${state.looks}/100`,
    `Известность: ${state.fame}/100`,
    `Карма: ${state.karma}/100`,
    `Судимость: ${state.criminalRecord}`,
    `Кредит: ${state.creditScore}/100`,
    `Портфолио: ${state.portfolio}/100`,
    `Связи: ${state.network}/100`,
    `Вклад: ${fmt(state.assets.deposits)}`,
    `Акции: ${fmt(state.assets.stocks)}`,
    `Пенсия: ${fmt(state.assets.pension)}`,
    `Навыки: ${Math.floor(skillAverage(Object.keys(skillCatalog)))}/100`,
    `Документы: ${state.documents.passport ? "паспорт" : "без паспорта"}, ${state.documents.taxId ? "налоговый номер" : "нет налогового номера"}`,
    `Семья: родители ${livingParentCount()}/2, детей ${state.children.length}`,
    `Компания: ${state.company ? `${companySectors[state.company.sector].name}, филиалов ${state.company.branches || 0}` : "нет"}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  s.append(tags);
  root.append(s);

  const logSection = section("Журнал жизни", "Все ключевые решения и события по годам.");
  const log = document.createElement("div");
  log.className = "log";
  state.log.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "log-entry";
    item.textContent = entry;
    log.append(item);
  });
  logSection.append(log);
  root.append(logSection);
  return root;
}

function renderContent() {
  const views = {
    life: renderLife,
    activities: renderActivities,
    family: renderFamily,
    world: renderWorld,
    education: renderEducation,
    career: renderCareer,
    health: renderHealth,
    skills: renderSkills,
    money: renderMoney,
    home: renderHome,
    assets: renderAssets,
    business: renderBusiness,
    relationships: renderRelationships,
    docs: renderDocuments,
    report: renderReport,
  };
  const root = document.createDocumentFragment();
  if (state.event) root.append(renderEvent());
  root.append(views[state.tab]());
  els.content.replaceChildren(root);
}

function saveGame() {
  const snapshot = { ...state, event: null, message: state.event ? "Событие снято перед сохранением." : state.message };
  localStorage.setItem("life-economy-save", JSON.stringify(snapshot));
  notify("Жизнь сохранена.");
}

function loadGame() {
  const raw = localStorage.getItem("life-economy-save");
  if (!raw) {
    notify("Сохранение не найдено.");
    return;
  }
  state = normalizeState({ ...JSON.parse(raw), event: null });
  notify("Сохранение загружено.");
}

function resetGame() {
  state = createNewLife();
  render();
}

function render() {
  els.subtitle.textContent = `${ageText(state.age)}. ${cityName()}, ${countryName()}.`;
  els.notice.textContent = state.event ? `${state.event.title}: ${state.event.text}` : state.message;
  els.endYear.disabled = Boolean(state.event);
  els.endYear.textContent = state.event ? "Сначала выберите событие" : "Прожить год";
  renderStats();
  renderTabs();
  renderContent();
}

els.endYear.addEventListener("click", endYear);
els.save.addEventListener("click", saveGame);
els.load.addEventListener("click", loadGame);
els.reset.addEventListener("click", resetGame);

render();
