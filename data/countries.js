(() => {
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

const names = {
  male: ["Алексей", "Иван", "Михаил", "Даниил", "Сергей", "Никита", "Артем", "Виктор"],
  female: ["Анна", "Мария", "Елена", "Ольга", "София", "Ирина", "Алиса", "Наталья"],
  last: ["Смирнов", "Иванов", "Кузнецов", "Попов", "Соколов", "Лебедев", "Новиков"],
};

  window.GameData = { ...(window.GameData || {}), countries, names };
})();
