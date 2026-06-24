(() => {
  const { state, createNewLife, createLifeFromChild, normalizeState, setState, setAppMode, notify, requestRender } = window.GameState;
  const historyKey = "gamelife-generation-history";

function saveGame() {
  const snapshot = { ...state, version: 9 };
  localStorage.setItem("life-economy-save", JSON.stringify(snapshot));
  notify("Жизнь сохранена.");
}

function loadGame() {
  const raw = localStorage.getItem("life-economy-save");
  if (!raw) {
    notify("Сохранение не найдено.");
    return;
  }
  const loaded = normalizeState(JSON.parse(raw));
  setState(loaded);
  setAppMode(loaded.deceased ? "death" : "life");
  notify("Сохранение загружено.");
}

function resetGame() {
  setAppMode("creator");
  requestRender();
}

function startGame(options = {}) {
  setState(createNewLife(options));
  setAppMode("life");
  requestRender();
}

function startRandomGame() {
  startGame({});
}

function readGenerationHistory() {
  try {
    const raw = localStorage.getItem(historyKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGenerationHistory(history) {
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 24)));
}

function recordGenerationHistory(snapshot) {
  if (!snapshot) return;
  const history = readGenerationHistory();
  const withoutDuplicate = history.filter((item) => item.id !== snapshot.id);
  writeGenerationHistory([snapshot, ...withoutDuplicate]);
}

function continueAsChild(childId) {
  const next = createLifeFromChild(state, childId);
  if (!next) {
    notify("Не удалось продолжить за этого ребенка.");
    return;
  }
  setState(next);
  setAppMode("life");
  requestRender();
}

  window.GameStorage = {
    saveGame,
    loadGame,
    resetGame,
    startGame,
    startRandomGame,
    readGenerationHistory,
    recordGenerationHistory,
    continueAsChild,
  };
})();
