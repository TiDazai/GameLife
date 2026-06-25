(() => {
  // Nightlife engine (18+ only). Turns a nightlife activity into concrete world
  // changes: it ensures the venue Place exists, spends money/energy, applies an
  // abstract risk profile (conflict/jealousy, reputation, health, legal,
  // pregnancy chance), and can spawn a consent-based social encounter as an NPC.
  // No graphic content is produced anywhere in this module.

  const rnd = () => window.GameRandom || { roll: (n) => Math.floor(Math.random() * n), pick: (a) => a[0], clamp: (v, a, b) => Math.max(a, Math.min(b, v)) };
  const data = () => window.GameNightlifeData || { activities: {} };
  const npcF = () => window.GameNpcFactory;
  const rel = () => window.GameRelationshipEngine;
  const places = () => window.GamePlaces;
  const GS = () => window.GameState;

  function clamp(v, a = 0, b = 100) {
    return rnd().clamp(Number.isFinite(Number(v)) ? Number(v) : a, a, b);
  }

  function emptyNightlife() {
    return { outings: 0, conflicts: 0, encounters: 0, lastVenueId: null, encounterIds: [], history: [] };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return null;
    const n = state.nightlife && typeof state.nightlife === "object" ? state.nightlife : null;
    state.nightlife = {
      ...emptyNightlife(),
      ...(n || {}),
      encounterIds: n && Array.isArray(n.encounterIds) ? n.encounterIds.filter(Boolean) : [],
      history: n && Array.isArray(n.history) ? n.history.slice(-24) : [],
    };
    return state.nightlife;
  }

  function isAvailable(state) {
    return (state.age || 0) >= 18;
  }

  function activityById(id) {
    return data().activities[id] || null;
  }

  function listActivities(state) {
    if (!isAvailable(state)) return [];
    return Object.values(data().activities);
  }

  function pushHistory(state, text) {
    const n = normalize(state);
    if (!text) return;
    n.history.unshift(`${state.age} лет: ${text}`);
    n.history = n.history.slice(0, 24);
  }

  function ensureVenue(state, activity) {
    if (!places()) return null;
    return places().ensureVenue(state, activity.placeType, {});
  }

  function spendMoney(state, amount) {
    if (!amount) return true;
    if (GS()?.pay) return GS().pay(amount);
    if ((state.personalMoney || 0) >= amount) { state.personalMoney -= amount; return true; }
    return false;
  }

  function applyStat(state, key, delta) {
    if (typeof state[key] === "number") state[key] = clamp(state[key] + delta, 0, 100);
  }

  // Spawn a consent-based social encounter as an NPC (never graphic).
  function spawnEncounter(state, activity, rng) {
    if (!activity.canMeet || !npcF() || !rel()) return null;
    if (rng() > 0.55) return null;
    let npc;
    const type = activity.encounterType;
    if (type === "date") npc = npcF().createDateNpc(state, {});
    else if (type === "hookup_18_plus") npc = npcF().createDateNpc(state, { relationType: "hookup_18_plus", tags: ["romance", "18+"] });
    else if (type === "friend") npc = npcF().createFriendNpc(state, {});
    else npc = npcF().createAcquaintanceNpc(state, {});
    npc.flags = { ...(npc.flags || {}), metAt: activity.placeType, nightlife: true };
    const n = normalize(state);
    npc.metContext = "nightlife";
    npc.metAtPlaceId = n.lastVenueId || null;
    npc.metYear = state.age || 0;
    rel().addNpc(state, npc);
    rel().addNpcHistory?.(npc, "Познакомились в ночной жизни.");
    if (n.lastVenueId) window.GamePlaces?.attachNpc?.(state, n.lastVenueId, npc.id);
    n.encounterIds.push(npc.id);
    n.encounters += 1;
    return npc;
  }

  function applyJealousy(state, rng, conflictRisk) {
    if (!rel()) return 0;
    const partner = rel().activePartner(state);
    if (!partner) return 0;
    if (rng() * 100 > conflictRisk + 8) return 0;
    rel().changeNpc(partner, { conflict: 6, trust: -5, romance: -3 });
    rel().addNpcHistory?.(partner, `${state.age} лет: ревность из-за ночного выхода.`);
    const n = normalize(state);
    n.conflicts += 1;
    return 1;
  }

  // Main entry: spend a night out.
  function go(state, activityId, rng = Math.random) {
    if (!isAvailable(state)) return { ok: false, text: "Ночные заведения доступны с 18 лет." };
    const activity = activityById(activityId);
    if (!activity) return { ok: false, text: "Заведение не найдено." };
    if (GS()?.canPay && !GS().canPay(activity.cost)) return { ok: false, text: "Недостаточно средств для этого вечера." };
    if (GS()?.canAct && !GS().canAct()) return { ok: false, text: "Не осталось действий в этом году." };
    GS()?.spendAction?.();

    const venue = ensureVenue(state, activity);
    const n = normalize(state);
    n.outings += 1;
    n.lastVenueId = venue ? venue.id : null;

    spendMoney(state, activity.cost);
    applyStat(state, "energy", -activity.energy);
    applyStat(state, "happiness", activity.fun);
    applyStat(state, "social", Math.ceil(activity.fun / 3));

    const risk = activity.risk || {};
    if (risk.health) applyStat(state, "health", -(rng() * risk.health));
    if (risk.reputation && rng() * 100 < risk.reputation) applyStat(state, "reputation", -2);

    // legal risk scales with local safety (lower safety => higher risk)
    if (risk.legal) {
      const cityInfo = GS()?.cityData?.(state) || {};
      const legalChance = risk.legal + Math.max(0, (60 - (cityInfo.safety || 60)) / 6);
      if (rng() * 100 < legalChance && window.GameLegalEngine?.addFine) {
        window.GameLegalEngine.addFine(state, 60 + Math.floor(rng() * 120), "Инцидент в ночном заведении", { tags: ["nightlife"] });
      }
    }

    const encounter = spawnEncounter(state, activity, rng);
    applyJealousy(state, rng, risk.conflict || 0);

    // abstract pregnancy chance for adult encounters; delegated to pregnancy engine
    if (encounter && risk.pregnancy && rng() * 100 < risk.pregnancy && window.GamePregnancy?.maybeFromContext) {
      window.GamePregnancy.maybeFromContext(state, { partnerNpcId: encounter.id, context: "unplanned_nightlife" }, rng);
    }

    const metText = encounter ? ` Знакомство: ${encounter.fullName || encounter.name}.` : "";
    const text = `${activity.title}.${metText}`;
    pushHistory(state, text);
    GS()?.notify?.(text);
    return { ok: true, text, venue, encounter };
  }

  // Leave with someone met tonight (18+, consent-based). Forms a hookup_18_plus
  // relationship and carries the same abstract health/pregnancy risk.
  function leaveWithSomeone(state, npcId, rng = Math.random) {
    if (!isAvailable(state)) return { ok: false, text: "Доступно с 18 лет." };
    if (!rel()) return { ok: false, text: "Недоступно." };
    const npc = rel().findNpc(state, npcId);
    if (!npc || (npc.age || 0) < 18) return { ok: false, text: "Недоступно." };
    rel().setRelation?.(state, npcId, "hookup_18_plus", "Связь 18+");
    npc.tags = [...new Set([...(npc.tags || []), "18+", "romance"])];
    applyStat(state, "happiness", 4);
    applyJealousy(state, rng, 60);
    if (window.GamePregnancy?.maybeFromContext && rng() * 100 < 6) {
      window.GamePregnancy.maybeFromContext(state, { partnerNpcId: npcId, context: "unplanned_nightlife" }, rng);
    }
    const text = "Вечер закончился вместе (18+).";
    pushHistory(state, text);
    return { ok: true, text };
  }

  window.GameNightlife = {
    normalize,
    emptyNightlife,
    isAvailable,
    activityById,
    listActivities,
    go,
    leaveWithSomeone,
  };
})();
