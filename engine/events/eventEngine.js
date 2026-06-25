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

  // ---- Object binding (section: events reference concrete world objects) ----
  // An event may declare `binds`, e.g. { npc: { relationType: "friend" },
  // place: { type: "bar" }, workplace: true, company: true, position: true,
  // condition: true, pregnancy: true }. Resolution turns each into a concrete
  // id stored on the active event, plus a name map for text interpolation.

  function pickBoundNpc(state, filter = {}, rng = Math.random) {
    let pool = (state.npcs || []).filter((npc) => npc && npc.alive && npc.relationType !== "self");
    if (filter.relationType) pool = pool.filter((npc) => npc.relationType === filter.relationType);
    if (filter.relationGroup) {
      const group = window.GameNpcFactory?.relationGroups?.[filter.relationGroup] || [];
      pool = pool.filter((npc) => group.includes(npc.relationType));
    }
    if (filter.minAge !== undefined) pool = pool.filter((npc) => (npc.age || 0) >= filter.minAge);
    if (filter.adultOnly) pool = pool.filter((npc) => (npc.age || 0) >= 18);
    if (!pool.length) return null;
    return pool[Math.floor(rng() * pool.length)] || pool[0];
  }

  function pickBoundPlace(state, filter = {}, rng = Math.random) {
    let pool = window.GamePlaces?.list?.(state) || [];
    if (filter.type) pool = pool.filter((p) => p.type === filter.type);
    if (filter.category) pool = pool.filter((p) => window.GamePlaces?.typeMeta?.(p.type)?.category === filter.category);
    if (!pool.length) return null;
    return pool[Math.floor(rng() * pool.length)] || pool[0];
  }

  // Build refs + names without side effects. Returns null if any declared
  // binding cannot be satisfied (so the event will not be offered).
  function resolveBindings(state, event, rng = Math.random) {
    const binds = event.binds;
    if (!binds) return { refs: {}, names: {} };
    const refs = {};
    const names = {};
    if (binds.npc) {
      const npc = pickBoundNpc(state, binds.npc, rng);
      if (!npc) return null;
      refs.npcId = npc.id;
      names.npcName = npc.fullName || npc.name || "знакомый";
    }
    if (binds.place) {
      const place = pickBoundPlace(state, binds.place, rng);
      if (!place) return null;
      refs.placeId = place.id;
      names.placeName = place.name || "место";
    }
    if (binds.workplace) {
      if (!state.workplace || !state.workplace.active) return null;
      refs.workplaceId = state.workplace.workplaceId || null;
      refs.companyId = state.workplace.company?.id || null;
      refs.positionId = state.workplace.positionId || null;
      names.companyName = state.workplace.company?.name || "компания";
      names.positionTitle = state.workplace.title || "должность";
    }
    if (binds.company) {
      if (!state.workplace || !state.workplace.company) return null;
      refs.companyId = state.workplace.company.id || null;
      names.companyName = state.workplace.company.name || "компания";
    }
    if (binds.position) {
      if (!state.workplace || !state.workplace.positionId) return null;
      refs.positionId = state.workplace.positionId;
      names.positionTitle = state.workplace.title || "должность";
    }
    if (binds.condition) {
      const conditions = window.GameHealthEngine?.allStateConditions?.(state) || [];
      const match = binds.condition === true ? conditions[0] : conditions.find((c) => c.id === binds.condition.id);
      if (!match) return null;
      refs.conditionId = match.id;
      names.conditionName = match.title || "состояние";
    }
    if (binds.pregnancy) {
      if (!state.pregnancy || !state.pregnancy.active) return null;
      refs.pregnancyId = "active";
      names.pregnancyContext = state.pregnancy.context || "беременность";
    }
    return { refs, names };
  }

  function canBind(state, event) {
    if (!event.binds) return true;
    return resolveBindings(state, event, () => 0) !== null;
  }

  function interpolate(text, names = {}) {
    if (!text || typeof text !== "string") return text;
    return text.replace(/\{(\w+)\}/g, (whole, token) => (token in names ? names[token] : whole));
  }

  function getAvailableEvents(state) {
    if (state.deceased || state.event) return [];
    return allEvents().filter((event) => isAgeAllowed(state, event) && checkConditions(state, event.conditions) && canBind(state, event));
  }

  function pickEvent(state, rng = Math.random) {
    return pickWeighted(getAvailableEvents(state), (event) => eventWeight(state, event), rng);
  }

  function toActiveEvent(event, refs = {}, names = {}) {
    if (!event) return null;
    return {
      id: event.id,
      category: event.category,
      title: interpolate(event.title, names),
      description: interpolate(event.description, names),
      text: interpolate(event.description, names),
      options: event.options.map((option) => ({
        id: option.id,
        label: interpolate(option.label, names),
        description: interpolate(option.description, names),
      })),
      refs,
      refNames: names,
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

    // Reuse the refs resolved when the event was shown; fall back to a fresh
    // resolution if the active event is missing (e.g. headless/test calls).
    const active = state.event && state.event.id === eventId ? state.event : null;
    const bound = active && active.refs ? { refs: active.refs, names: active.refNames || {} } : (resolveBindings(state, event, rng) || { refs: {}, names: {} });
    const refs = bound.refs;
    const names = bound.names;

    applyEffects(state, option.effects, rng, refs);
    const messages = [interpolate(option.resultText, names) || "Выбор сделан."];
    if (option.risk && rng() < option.risk.chance) {
      applyEffects(state, option.risk.effects, rng, refs);
      if (option.risk.resultText) messages.push(interpolate(option.risk.resultText, names));
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
    const bound = resolveBindings(state, event, rng) || { refs: {}, names: {} };
    const active = toActiveEvent(event, bound.refs, bound.names);
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
    resolveBindings,
    canBind,
    interpolate,
  };
})();
