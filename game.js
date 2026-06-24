(() => {
  const { setRenderCallback } = window.GameState;
  const { render, els } = window.GameUI;
  const { endYear } = window.GameSimulation;
  const { saveGame, loadGame, resetGame } = window.GameStorage;

  setRenderCallback(render);

  els.endYear.addEventListener("click", endYear);
  els.save.addEventListener("click", saveGame);
  els.load.addEventListener("click", loadGame);
  els.reset.addEventListener("click", resetGame);

  render();
})();
