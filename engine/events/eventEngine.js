(() => {
  const { checkConditions } = window.GameEventConditions;
  const { applyEffects } = window.GameEventEffects;
  const { eventWeight, pickWeighted } = window.GameEventWeights;

  function allEvents() {
    return window.GameEventData || [];
  }

  function getEventById(eventId) {
    return allEvents().find((event) => event.id === eventId) || null;
  }

  function isAgeAllowed(state, event) {
    if (event.minAge !== undefined && state.age < event.minAge) return false;
    if (event.maxAge !== undefined && state.age > event.maxAge) return false;
    return true;
  }

  function getAvailableEvents(state) {
    if (state.deceased || state.event) return [];
    return allEvents().filter((event) => isAgeAllowed(state, event) && checkConditions(state, event.conditions));
  }

  function pickEvent(state, rng = Math.random) {
    return pickWeighted(getAvailableEvents(state), (event) => eventWeight(state, event), rng);
  }

  function toActiveEvent(event) {
    if (!event) return null;
    return {
      id: event.id,
      category: event.category,
      title: event.title,
      description: event.description,
      text: event.description,
      options: event.options.map((option) => ({
        id: option.id,
        label: option.label,
        description: option.description,
      })),
    };
  }

  function appendLog(state, text) {
    if (!text) return;
    state.log = Array.isArray(state.log) ? state.log : [];
    state.log.unshift(`${state.age} лет: ${text}`);
    state.log = state.log.slice(0, 36);
  }

  function applyEventOption(state, eventId, optionId, rng = Math.random) {
    const event = getEventById(eventId);
    const option = event?.options.find((item) => item.id === optionId);
    if (!event || !option || state.deceased) return { ok: false, text: "Событие недоступно." };

    applyEffects(state, option.effects, rng);
    const messages = [option.resultText || "Выбор сделан."];
    if (option.risk && rng() < option.risk.chance) {
      applyEffects(state, option.risk.effects, rng);
      if (option.risk.resultText) messages.push(option.risk.resultText);
    }

    const finalText = messages.join(" ");
    appendLog(state, finalText);
    state.event = null;
    state.message = finalText;
    return { ok: true, text: finalText };
  }

  function createRandomEvent(state, rng = Math.random) {
    const event = pickEvent(state, rng);
    if (!event) return null;
    const active = toActiveEvent(event);
    state.event = active;
    state.message = `${active.title}: ${active.description}`;
    return active;
  }

  window.GameEventEngine = {
    allEvents,
    getEventById,
    getAvailableEvents,
    pickEvent,
    toActiveEvent,
    createRandomEvent,
    applyEventOption,
    applyEffects,
    checkConditions,
    eventWeight,
  };
})();
