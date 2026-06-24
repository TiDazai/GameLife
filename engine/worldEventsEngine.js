(() => {
  const roll = (n) => window.GameRandom?.roll?.(n) || 0;

  function catalog() {
    return (window.GameData && window.GameData.worldEvents) || [];
  }

  function active(state) {
    return Array.isArray(state.worldEvents) ? state.worldEvents : [];
  }

  function combinedModifiers(state) {
    const mods = { salary: 1, prices: 1, opportunity: 1, property: 1 };
    active(state).forEach((we) => {
      const def = catalog().find((d) => d.id === we.id);
      if (!def || !def.modifiers) return;
      for (const [k, v] of Object.entries(def.modifiers)) {
        mods[k] = (mods[k] || 1) * v;
      }
    });
    return mods;
  }

  function maybeStart(state, rng = Math.random) {
    if (active(state).length >= 2) return null;
    if (rng() > 0.18) return null;
    const history = state.worldEventHistory || [];
    const pool = catalog().filter((def) => !active(state).some((we) => we.id === def.id));
    if (!pool.length) return null;
    const total = pool.reduce((sum, def) => sum + (def.weight || 1), 0);
    let pickValue = rng() * total;
    let chosen = pool[0];
    for (const def of pool) {
      pickValue -= def.weight || 1;
      if (pickValue <= 0) { chosen = def; break; }
    }
    const duration = (chosen.minDuration || 1) + roll((chosen.maxDuration || chosen.minDuration || 1) - (chosen.minDuration || 1) + 1);
    const instance = { id: chosen.id, title: chosen.title, startYear: state.year, remaining: duration };
    state.worldEvents = active(state).concat(instance);
    state.worldEventHistory = history.concat({ id: chosen.id, year: state.year });
    if (window.GameState?.addLog) window.GameState.addLog(`Мир изменился: ${chosen.title}. ${chosen.description}`);
    return instance;
  }

  // Apply yearly effects of active world events and decrement durations.
  function tick(state, rng = Math.random) {
    const stillActive = [];
    active(state).forEach((we) => {
      const def = catalog().find((d) => d.id === we.id);
      if (!def) return;
      if (def.yearlyEffects && window.GameEventEffects?.applyEffects) {
        window.GameEventEffects.applyEffects(state, def.yearlyEffects, rng);
      }
      we.remaining = (we.remaining || 1) - 1;
      if (we.remaining > 0) stillActive.push(we);
      else if (window.GameState?.addLog) window.GameState.addLog(`Закончилось: ${def.title}.`);
    });
    state.worldEvents = stillActive;
    maybeStart(state, rng);
  }

  function describe(state) {
    return active(state).map((we) => {
      const def = catalog().find((d) => d.id === we.id) || {};
      return {
        id: we.id,
        title: we.title || def.title,
        description: def.description || "",
        remaining: we.remaining || 0,
        tags: def.tags || [],
      };
    });
  }

  window.GameWorldEvents = { catalog, active, combinedModifiers, maybeStart, tick, describe };
})();
