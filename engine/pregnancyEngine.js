(() => {
  // Pregnancy flow (18+). An abstract, non-graphic life-sim system: it tracks a
  // single active Pregnancy object, applies mild yearly health/financial effects,
  // and resolves into a real child NPC at the due year. No medical instructions
  // are provided — only game state. Bridges the legacy `expectingChild` flag.

  const rnd = () => window.GameRandom || { roll: (n) => Math.floor(Math.random() * n), clamp: (v, a, b) => Math.max(a, Math.min(b, v)) };
  const rel = () => window.GameRelationshipEngine;
  const GS = () => window.GameState;

  function clamp(v, a = 0, b = 100) {
    return rnd().clamp(Number.isFinite(Number(v)) ? Number(v) : a, a, b);
  }

  const CONTEXTS = [
    "planned_with_spouse",
    "unplanned_with_partner",
    "unplanned_with_ex",
    "unplanned_nightlife",
    "unplanned_adult_route",
  ];

  function emptyPregnancy() {
    return {
      active: false,
      sinceYear: null,
      dueYear: null,
      partnerNpcId: null,
      context: null,
      planned: false,
      acknowledged: false,
      relationshipImpact: 0,
      healthRisk: 0,
      financialImpact: 0,
      choicesMade: [],
      history: [],
    };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return null;
    const p = state.pregnancy && typeof state.pregnancy === "object" ? state.pregnancy : null;
    state.pregnancy = {
      ...emptyPregnancy(),
      ...(p || {}),
      choicesMade: p && Array.isArray(p.choicesMade) ? p.choicesMade : [],
      history: p && Array.isArray(p.history) ? p.history.slice(-16) : [],
    };
    return state.pregnancy;
  }

  function isActive(state) {
    return Boolean(state.pregnancy && state.pregnancy.active);
  }

  // Pregnancy is an adult-only game system; gate at 18 and a plausible range.
  function canConceive(state) {
    const age = state.age || 0;
    return age >= 18 && age <= 49;
  }

  function pushHistory(state, text) {
    const p = normalize(state);
    if (!text) return;
    p.history.unshift(`${state.age} лет: ${text}`);
    p.history = p.history.slice(0, 16);
  }

  function healthRiskForAge(age) {
    if (age >= 40) return 24;
    if (age >= 35) return 16;
    if (age <= 19) return 12;
    return 8;
  }

  function start(state, opts = {}, rng = Math.random) {
    normalize(state);
    if (!canConceive(state)) return null;
    if (isActive(state)) return state.pregnancy;
    const context = CONTEXTS.includes(opts.context) ? opts.context : "unplanned_with_partner";
    const partner = opts.partnerNpcId
      ? (rel()?.findNpc(state, opts.partnerNpcId) || null)
      : (rel()?.activePartner(state) || null);
    const p = (state.pregnancy = emptyPregnancy());
    p.active = true;
    p.sinceYear = state.year || 0;
    p.dueYear = (state.year || 0) + 1;
    p.partnerNpcId = partner ? partner.id : (opts.partnerNpcId || null);
    p.context = context;
    p.planned = Boolean(opts.planned) || context === "planned_with_spouse";
    p.acknowledged = p.planned;
    p.healthRisk = healthRiskForAge(state.age || 0);
    p.relationshipImpact = context.startsWith("unplanned") ? -6 : 4;
    p.financialImpact = 1;
    state.expectingChild = true;
    // partner reaction (abstract)
    if (partner && rel()) {
      if (p.planned) rel().changeNpc(partner, { bond: 4, romance: 2 });
      else rel().changeNpc(partner, { conflict: 4, trust: -2 });
    }
    pushHistory(state, p.planned ? "Запланированная беременность" : "Незапланированная беременность");
    return p;
  }

  // Called by nightlife / adult-work / event systems with a context.
  function maybeFromContext(state, opts = {}, rng = Math.random) {
    normalize(state);
    if (!canConceive(state) || isActive(state)) return null;
    return start(state, opts, rng);
  }

  function acknowledge(state) {
    const p = normalize(state);
    if (!p.active) return null;
    p.acknowledged = true;
    pushHistory(state, "Беременность признана");
    return p;
  }

  function recordChoice(state, choiceId) {
    const p = normalize(state);
    if (!p.active || !choiceId) return null;
    p.choicesMade.push({ choiceId, year: state.year || 0 });
    return p;
  }

  function resolveBirth(state) {
    const p = normalize(state);
    const partner = p.partnerNpcId ? rel()?.findNpc(state, p.partnerNpcId) : null;
    let child = null;
    if (rel()?.createChild) {
      child = rel().createChild(state, {
        flags: { bornInGame: true, context: p.context },
      });
    }
    // mild birth-year effects (abstract)
    if (typeof state.health === "number") state.health = clamp(state.health - Math.floor(p.healthRisk / 4));
    if (typeof state.happiness === "number") state.happiness = clamp(state.happiness + (p.planned ? 8 : 3));
    if (partner && rel()) rel().changeNpc(partner, { bond: 3 });
    state.expectingChild = false;
    state.pregnancy = emptyPregnancy();
    state.pregnancy.history = p.history;
    pushHistory(state, child ? `Рождение ребёнка: ${child.name}` : "Рождение ребёнка");
    return child;
  }

  // Yearly hook. Bridges legacy expectingChild, advances and resolves pregnancy.
  function tick(state, rng = Math.random) {
    normalize(state);
    // bridge: legacy flag set elsewhere but no structured pregnancy yet
    if (state.expectingChild && !isActive(state) && canConceive(state)) {
      const spouse = rel()?.spouse?.(state);
      start(state, { context: spouse ? "planned_with_spouse" : "unplanned_with_partner", partnerNpcId: spouse?.id }, rng);
    }
    const p = state.pregnancy;
    if (!p.active) return null;
    // yearly toll
    if (typeof state.health === "number" && rng() * 100 < p.healthRisk) {
      state.health = clamp(state.health - 3);
    }
    if ((state.year || 0) >= (p.dueYear || Infinity)) {
      const child = resolveBirth(state);
      return child ? `родился ребёнок (${child.name})` : "родился ребёнок";
    }
    return p.acknowledged ? null : "ожидается ребёнок";
  }

  window.GamePregnancy = {
    CONTEXTS,
    normalize,
    emptyPregnancy,
    isActive,
    canConceive,
    start,
    maybeFromContext,
    acknowledge,
    recordChoice,
    resolveBirth,
    tick,
  };
})();
