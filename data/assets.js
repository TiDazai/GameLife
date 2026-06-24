(() => {
const budgetModes = {
  strict: { name: "Жесткая экономия", cost: 0.78, happiness: -4, discipline: 4, stress: 2, credit: 2 },
  balanced: { name: "Баланс", cost: 1, happiness: 0, discipline: 1, stress: 0, credit: 1 },
  growth: { name: "Рост", cost: 1.12, happiness: 1, discipline: 2, stress: 2, credit: 0 },
  comfort: { name: "Комфорт", cost: 1.28, happiness: 5, discipline: -1, stress: -2, credit: -1 },
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

  window.GameData = { ...(window.GameData || {}), budgetModes, housingCatalog, possessionCatalog };
})();
