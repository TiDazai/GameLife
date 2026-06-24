(() => {
  // Adult work engine (18+ only). Drives the abstract risky branch entirely
  // through numbers: income, safety/discretion, and legal/reputation/health/
  // stress risk, plus an exit path and hide/reveal-to-partner mechanics. No
  // explicit content is ever produced. Unavailable and hidden under 18.

  const rnd = () => window.GameRandom || { roll: (n) => Math.floor(Math.random() * n), pick: (a) => a[0], clamp: (v, a, b) => Math.max(a, Math.min(b, v)) };
  const data = () => window.GameAdultWorkData || { types: {}, incidents: [], stageLabels: [] };
  const npcF = () => window.GameNpcFactory;
  const rel = () => window.GameRelationshipEngine;
  const GS = () => window.GameState;

  function clamp(v, a = 0, b = 100) {
    return rnd().clamp(Number.isFinite(Number(v)) ? Number(v) : a, a, b);
  }

  function emptyProfile() {
    return {
      active: false,
      type: null,
      stage: 0,
      incomeRange: [0, 0],
      safety: 60,
      discretion: 55,
      reputationRisk: 0,
      legalRisk: 0,
      healthRisk: 0,
      stress: 0,
      network: 0,
      exposed: false,
      yearsActive: 0,
      totalEarned: 0,
      clientNpcIds: [],
      placeIds: [],
      history: [],
    };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return null;
    const p = state.adultWork && typeof state.adultWork === "object" ? state.adultWork : null;
    state.adultWork = {
      ...emptyProfile(),
      ...(p || {}),
      incomeRange: p && Array.isArray(p.incomeRange) ? p.incomeRange : [0, 0],
      clientNpcIds: p && Array.isArray(p.clientNpcIds) ? p.clientNpcIds.filter(Boolean) : [],
      placeIds: p && Array.isArray(p.placeIds) ? p.placeIds.filter(Boolean) : [],
      history: p && Array.isArray(p.history) ? p.history.slice(-24) : [],
    };
    return state.adultWork;
  }

  function isAvailable(state) {
    return (state.age || 0) >= 18;
  }

  function typeById(id) {
    return data().types[id] || null;
  }

  function listTypes(state) {
    if (!isAvailable(state)) return [];
    return Object.values(data().types);
  }

  function pushHistory(state, text) {
    const p = normalize(state);
    if (!text) return;
    p.history.unshift(`${state.age} лет: ${text}`);
    p.history = p.history.slice(0, 24);
  }

  // Country legal climate -> multiplier on legal risk. Derived from the
  // descriptive legalStrictness string plus local safety.
  function legalMultiplier(state) {
    const country = window.GameData?.countries?.[state.country] || {};
    const text = String(country.legalStrictness || "").toLowerCase();
    let mult = 1;
    if (/строг|контрол|законопослуш/.test(text)) mult += 0.35;
    if (/предсказуем|чётк|честн/.test(text)) mult += 0.1;
    if (/слаб|медлен|переменчив|неровн|перегруж|развивающ/.test(text)) mult -= 0.3;
    if (/либеральн|мягк|прозрачн/.test(text)) mult -= 0.1;
    const cityInfo = GS()?.cityData?.(state) || {};
    mult += Math.max(-0.2, Math.min(0.3, (60 - (cityInfo.safety || 60)) / 120));
    return Math.max(0.5, Math.min(1.6, mult));
  }

  function ensurePlaces(state, type) {
    if (!window.GamePlaces) return [];
    return (type.placeTypes || []).map((pt) => window.GamePlaces.ensureVenue(state, pt, {})).filter(Boolean).map((p) => p.id);
  }

  // Begin the branch with a chosen type.
  function start(state, typeId) {
    if (!isAvailable(state)) return { ok: false, text: "Доступно только с 18 лет." };
    const type = typeById(typeId);
    if (!type) return { ok: false, text: "Ветка не найдена." };
    const p = (state.adultWork = emptyProfile());
    p.active = true;
    p.type = type.id;
    p.stage = 0;
    p.incomeRange = type.incomeRange.slice();
    p.safety = type.baseSafety;
    p.discretion = type.baseDiscretion;
    p.reputationRisk = type.reputationRisk;
    p.legalRisk = type.legalRisk;
    p.healthRisk = type.healthRisk;
    p.placeIds = ensurePlaces(state, type);
    pushHistory(state, `Начало взрослой ветки: ${type.title}`);
    return { ok: true, text: `Начата взрослая рискованная ветка: ${type.title}.`, profile: p };
  }

  function addClient(state) {
    if (!npcF() || !rel()) return null;
    const npc = npcF().createContactNpc(state, "client", { minAge: 18, tags: ["18+", "adult_work"], flags: { adultWork: true } });
    rel().addNpc(state, npc);
    const p = normalize(state);
    p.clientNpcIds.push(npc.id);
    return npc;
  }

  function rollIncident(rng) {
    const incidents = data().incidents || [];
    const total = incidents.reduce((s, i) => s + (i.weight || 0), 0);
    if (!total) return null;
    let r = rng() * total;
    for (const inc of incidents) {
      r -= inc.weight || 0;
      if (r <= 0) return inc;
    }
    return incidents[incidents.length - 1];
  }

  // Resolve one year of the branch (called from the yearly simulation).
  function resolveYear(state, rng = Math.random) {
    const p = normalize(state);
    if (!p.active) return null;
    const type = typeById(p.type);
    if (!type) return null;

    p.yearsActive += 1;
    if (p.yearsActive % 2 === 0 && p.stage < (data().stageLabels.length - 1)) p.stage += 1;

    const [lo, hi] = p.incomeRange;
    let income = lo + Math.floor(rng() * Math.max(1, hi - lo)) + p.stage * 200 + p.network * 8;

    let summary = `${type.title}: год пройден`;
    const inc = rollIncident(rng);
    if (inc) {
      const e = inc.effect || {};
      if (e.incomeMult) income = Math.floor(income * e.incomeMult);
      if (e.network) p.network = clamp(p.network + e.network, 0, 100);
      if (e.discretion) p.discretion = clamp(p.discretion + e.discretion);
      if (e.safety) p.safety = clamp(p.safety + e.safety);
      if (e.stress) p.stress = clamp(p.stress + e.stress);
      if (e.health && typeof state.health === "number") state.health = clamp(state.health + e.health);
      if (e.reputationHit && typeof state.reputation === "number") state.reputation = clamp(state.reputation - e.reputationHit);
      if (e.exposed) p.exposed = true;
      if (e.addClient) addClient(state);
      if (e.partnerConflict && rel()) {
        const partner = rel().activePartner(state);
        if (partner) rel().changeNpc(partner, { conflict: 8, trust: -6 });
      }
      if (e.legalCase && window.GameLegalEngine?.addCase) {
        const mult = legalMultiplier(state);
        if (rng() < 0.4 * mult) window.GameLegalEngine.addCase(state, { title: "Правовые риски взрослой ветки", type: "adult_work", severity: 2, tags: ["18+"] });
      }
      if (e.exitOffer) p.exitOfferPending = true;
      summary = `${type.title}: ${inc.title}`;
    }

    // baseline yearly toll
    p.stress = clamp(p.stress + type.stressPerYear - Math.floor(p.discretion / 25));
    if (typeof state.stress === "number") state.stress = clamp(state.stress + Math.ceil(type.stressPerYear / 2));
    if (rng() * 100 < p.healthRisk - p.safety / 6 && typeof state.health === "number") {
      state.health = clamp(state.health - (4 + rng() * 6));
    }
    const reputationDrip = Math.max(0, p.reputationRisk - Math.floor(p.discretion / 20));
    if (typeof state.reputation === "number" && reputationDrip > 0 && rng() * 100 < reputationDrip * 3) {
      state.reputation = clamp(state.reputation - 2);
    }

    income = Math.max(0, income);
    p.totalEarned += income;
    if (GS()?.addIncome) GS().addIncome(income); else state.personalMoney = (state.personalMoney || 0) + income;

    pushHistory(state, `${summary} (+${income})`);
    return { income, summary, profile: p };
  }

  function hide(state) {
    const p = normalize(state);
    if (!p.active) return null;
    p.discretion = clamp(p.discretion + 8);
    p.exposed = false;
    pushHistory(state, "Усилены меры конфиденциальности");
    return p;
  }

  function reveal(state, partnerId) {
    const p = normalize(state);
    if (!p.active || !rel()) return null;
    const partner = partnerId ? rel().findNpc(state, partnerId) : rel().activePartner(state);
    p.exposed = true;
    if (partner) {
      // reaction depends on the partner's openness; abstract, no detail
      const tolerant = (partner.personality?.kindness || 50) > 60 || (partner.sexualityProfile?.openness || 0) > 60;
      if (tolerant) rel().changeNpc(partner, { trust: 4, conflict: 4 });
      else rel().changeNpc(partner, { trust: -16, conflict: 16, romance: -10 });
      rel().addNpcHistory?.(partner, `${state.age} лет: узнал(а) о взрослой ветке.`);
    }
    pushHistory(state, "Раскрытие партнёру");
    return p;
  }

  function exit(state) {
    const p = normalize(state);
    if (!p.active) return null;
    p.active = false;
    p.exitOfferPending = false;
    if (!Array.isArray(state.tags)) state.tags = [];
    if (!state.tags.includes("adult_work_past")) state.tags.push("adult_work_past");
    pushHistory(state, "Выход из взрослой ветки");
    return p;
  }

  function isActive(state) {
    return Boolean(state.adultWork && state.adultWork.active);
  }

  window.GameAdultWork = {
    normalize,
    emptyProfile,
    isAvailable,
    typeById,
    listTypes,
    legalMultiplier,
    start,
    resolveYear,
    hide,
    reveal,
    exit,
    isActive,
    addClient,
  };
})();
