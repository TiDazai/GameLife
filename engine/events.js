(() => {
  const { state, requestRender } = window.GameState;
  const { createRandomEvent, applyEventOption } = window.GameEventEngine;

  function maybeEvent(rng = Math.random) {
    if (state.deceased || state.event) return null;
    if (state.age < 3 || rng() > 0.28) return null;
    return createRandomEvent(state, rng);
  }

  function chooseEventOption(eventId, optionId, rng = Math.random) {
    const result = applyEventOption(state, eventId, optionId, rng);
    requestRender();
    return result;
  }

  function closeEvent(text) {
    state.event = null;
    state.message = text;
    requestRender();
  }

  window.GameEvents = {
    maybeEvent,
    closeEvent,
    chooseEventOption,
    getAvailableEvents: window.GameEventEngine.getAvailableEvents,
    pickEvent: window.GameEventEngine.pickEvent,
    applyEventOption: window.GameEventEngine.applyEventOption,
    applyEffects: window.GameEventEngine.applyEffects,
    checkConditions: window.GameEventEngine.checkConditions,
  };
})();
