(() => {
  const { setRenderCallback, getAppMode, state } = window.GameState;
  const { render, els } = window.GameUI;
  const { endYear } = window.GameSimulation;
  const { saveGame, loadGame, resetGame, saveCurrentGame } = window.GameStorage;

  // Debounced autosave: every render is a "something changed" signal, so we
  // piggy-back on it. Saving is throttled (~400ms) and only happens while a
  // life is in play (life/death modes), never on the start/creation screen.
  let autosaveTimer = null;
  function scheduleAutosave() {
    const mode = getAppMode();
    if (mode !== "life" && mode !== "death") return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null;
      try {
        saveCurrentGame(state);
      } catch {
        /* never let a storage hiccup break the game */
      }
    }, 400);
  }

  setRenderCallback(() => {
    render();
    scheduleAutosave();
  });

  els.endYear.addEventListener("click", endYear);
  els.save.addEventListener("click", saveGame);
  els.load.addEventListener("click", loadGame);
  els.reset.addEventListener("click", resetGame);

  // On open we stay on the start screen (creator mode). If a save exists,
  // renderCreator() shows "Продолжить / Новая жизнь / Загрузить / Удалить";
  // otherwise it shows character creation directly.
  render();
})();
