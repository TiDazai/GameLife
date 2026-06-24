(() => {
  const data = () => window.GamePlacesData || { types: {}, namePools: {}, districts: ["Центр"], defaultCityVenues: [] };
  const rnd = () => (window.GameRandom || { pick: (a) => a[0], roll: (n) => Math.floor(Math.random() * n), clamp: (v, a, b) => Math.max(a, Math.min(b, v)) });

  function clamp(v, a = 0, b = 100) {
    return rnd().clamp(Number.isFinite(Number(v)) ? Number(v) : a, a, b);
  }

  function randomId(type = "place") {
    return `${type}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  }

  function typeMeta(type) {
    return data().types[type] || { label: type, category: "other", base: {}, tags: [] };
  }

  function typeLabel(type) {
    return typeMeta(type).label || type;
  }

  function isAdultType(type) {
    return Boolean(typeMeta(type).adultOnly) || (typeMeta(type).minAge || 0) >= 18;
  }

  function nameForType(type) {
    const pool = data().namePools[type] || [typeLabel(type)];
    const raw = rnd().pick(pool);
    return raw.replace("{n}", String(1 + rnd().roll(40)));
  }

  // Build a Place instance. Pulls sensible defaults from the type catalog and
  // can be biased by the surrounding city (cost/safety/popularity).
  function createPlace(input = {}) {
    const type = data().types[input.type] ? input.type : "cafe";
    const meta = typeMeta(type);
    const base = meta.base || {};
    const cityBias = input.cityBias || {};
    const place = {
      id: input.id || randomId(type),
      name: input.name || nameForType(type),
      type,
      country: input.country || "",
      city: input.city || "",
      district: input.district || rnd().pick(data().districts),
      costLevel: clamp(input.costLevel ?? base.costLevel ?? 1, 0, 4),
      prestige: clamp(input.prestige ?? base.prestige ?? 45),
      safety: clamp(input.safety ?? ((base.safety ?? 60) + (cityBias.safety || 0))),
      popularity: clamp(input.popularity ?? ((base.popularity ?? 50) + (cityBias.popularity || 0))),
      tags: Array.isArray(input.tags) ? [...new Set([...(meta.tags || []), ...input.tags])] : [...(meta.tags || [])],
      npcIds: Array.isArray(input.npcIds) ? [...new Set(input.npcIds)] : [],
      eventTags: Array.isArray(input.eventTags) ? input.eventTags : [],
      minAge: input.minAge ?? meta.minAge ?? 0,
      adultOnly: Boolean(input.adultOnly ?? meta.adultOnly),
    };
    return place;
  }

  function list(state) {
    if (!Array.isArray(state.places)) state.places = [];
    return state.places;
  }

  function findPlace(state, id) {
    return list(state).find((p) => p && p.id === id) || null;
  }

  function getByType(state, type) {
    return list(state).filter((p) => p.type === type);
  }

  function placesInCity(state, city = state.city) {
    return list(state).filter((p) => !p.city || p.city === city);
  }

  function addPlace(state, place) {
    const arr = list(state);
    const built = place && place.id && place.type && data().types[place.type] ? place : createPlace(place || {});
    const existing = arr.findIndex((p) => p.id === built.id);
    if (existing >= 0) arr[existing] = built;
    else arr.push(built);
    return built;
  }

  function attachNpc(state, placeId, npcId) {
    const place = findPlace(state, placeId);
    if (!place || !npcId) return null;
    if (!place.npcIds.includes(npcId)) place.npcIds.push(npcId);
    return place;
  }

  function detachNpc(state, placeId, npcId) {
    const place = findPlace(state, placeId);
    if (!place) return;
    place.npcIds = place.npcIds.filter((id) => id !== npcId);
  }

  // Seed the player's current city with its standard public venues. Idempotent:
  // a venue type is only created once per city.
  function ensureCityPlaces(state) {
    const arr = list(state);
    const city = state.city;
    const country = state.country;
    const cityInfo = window.GameState?.cityData?.(state) || {};
    const cityBias = {
      safety: Math.round(((cityInfo.safety || 60) - 60) * 0.4),
      popularity: Math.round(((cityInfo.nightlife || 55) - 55) * 0.4),
    };
    (data().defaultCityVenues || []).forEach((type) => {
      const has = arr.some((p) => p.type === type && p.city === city);
      if (has) return;
      addPlace(state, createPlace({ type, country, city, cityBias }));
    });
    return arr;
  }

  // Find or lazily create a single representative venue of a type in the city.
  function ensureVenue(state, type, input = {}) {
    const city = state.city;
    let venue = list(state).find((p) => p.type === type && p.city === city);
    if (!venue) {
      venue = addPlace(state, createPlace({ type, country: state.country, city, ...input }));
    }
    return venue;
  }

  // Public nightlife venues available to an adult player in the current city.
  function nightlifeVenues(state) {
    if ((state.age || 0) < 18) return [];
    ensureCityPlaces(state);
    return placesInCity(state).filter((p) => typeMeta(p.type).category === "nightlife");
  }

  function normalizePlaces(state) {
    if (!Array.isArray(state.places)) {
      state.places = [];
      return state.places;
    }
    state.places = state.places
      .filter((p) => p && p.type && data().types[p.type])
      .map((p) => createPlace(p));
    return state.places;
  }

  window.GamePlaces = {
    types: () => data().types,
    typeMeta,
    typeLabel,
    isAdultType,
    createPlace,
    list,
    findPlace,
    getByType,
    placesInCity,
    addPlace,
    attachNpc,
    detachNpc,
    ensureCityPlaces,
    ensureVenue,
    nightlifeVenues,
    normalizePlaces,
  };
})();
