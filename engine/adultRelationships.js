(() => {
  const { clamp } = window.GameRandom;

  const ADULT_STAT_DEFAULTS = {
    intimacy: 30,
    passion: 40,
    trust: 45,
    romance: 45,
    conflict: 15,
    jealousy: 15,
    commitment: 30,
    sexualCompatibility: 45,
    familyPlans: 20,
    sharedFuture: 25,
    boundariesDiscussed: 0,
    contraceptionDiscussed: 0,
    pregnancyRisk: 30,
  };

  // Adult content is gated: player must be 18+ and have an adult romantic partner.
  function isUnlocked(state) {
    if (!state || (state.age || 0) < 18) return false;
    const partner = state.relationship;
    if (!partner) return false;
    if (typeof partner.age === "number" && partner.age < 18) return false;
    return true;
  }

  function ensureAdultStats(state) {
    if (!isUnlocked(state)) return null;
    if (!state.adultStats || typeof state.adultStats !== "object") {
      state.adultStats = { ...ADULT_STAT_DEFAULTS };
    } else {
      state.adultStats = { ...ADULT_STAT_DEFAULTS, ...state.adultStats };
    }
    return state.adultStats;
  }

  function clearIfLocked(state) {
    if (!isUnlocked(state)) state.adultStats = null;
  }

  // Push core relationship deltas onto the backing partner. Prefers the NPC model
  // (relationshipEngine) so syncLegacy keeps state.relationship consistent; falls back
  // to the legacy relationship object used in lightweight tests.
  function syncPartner(state, deltas = {}) {
    const map = { romance: deltas.romance, trust: deltas.trust, conflict: deltas.conflict, bond: deltas.intimacy };
    const clean = Object.fromEntries(Object.entries(map).filter(([, v]) => typeof v === "number" && v !== 0));
    if (deltas.intimacy) clean.bond = Math.round(deltas.intimacy / 2);
    if (!Object.keys(clean).length) return;
    const npc = window.GameRelationshipEngine?.activePartner?.(state);
    if (npc && window.GameRelationshipEngine?.changeNpc) {
      window.GameRelationshipEngine.changeNpc(npc, clean);
      window.GameRelationshipEngine.syncLegacy(state);
      return;
    }
    if (state.relationship) {
      for (const [key, amount] of Object.entries(clean)) {
        state.relationship[key] = clamp((state.relationship[key] || 0) + amount, 0, 100);
      }
    }
  }

  // Abstract, non-graphic pregnancy risk. Applies only to unlocked adult relationships.
  // Higher pregnancyRisk and undiscussed contraception raise the chance.
  function pregnancyChance(state) {
    if (!isUnlocked(state)) return 0;
    const stats = ensureAdultStats(state);
    if (!stats) return 0;
    const risk = clamp(stats.pregnancyRisk || 0, 0, 100) / 100;
    const protection = stats.contraceptionDiscussed ? 0.35 : 1;
    return clamp(risk * protection, 0, 1);
  }

  function maybePregnancy(state, rng = Math.random) {
    if (!isUnlocked(state)) return false;
    if (state.expectingChild) return false;
    if (rng() < pregnancyChance(state)) {
      state.expectingChild = true;
      if (window.GameState?.addLog) window.GameState.addLog("В отношениях ожидается прибавление — пара готовится стать родителями.");
      return true;
    }
    return false;
  }

  function getActions(state) {
    if (!isUnlocked(state)) return [];
    const list = (window.GameData && window.GameData.adultRelationshipActions) || [];
    return list.filter((action) => {
      if (action.conditions?.minConflict && (state.adultStats?.conflict || ensureAdultStats(state)?.conflict || 0) < action.conditions.minConflict) return false;
      return true;
    });
  }

  function performAction(state, actionId) {
    if (!isUnlocked(state)) return { ok: false, reason: "locked" };
    const list = (window.GameData && window.GameData.adultRelationshipActions) || [];
    const action = list.find((a) => a.id === actionId);
    if (!action) return { ok: false, reason: "not_found" };
    const stats = ensureAdultStats(state);
    if (!stats) return { ok: false, reason: "locked" };

    const moneyCost = action.cost?.money || 0;
    if (moneyCost > 0) {
      if ((state.personalMoney || 0) < moneyCost) return { ok: false, reason: "no_money" };
      if (window.GameState?.pay) window.GameState.pay(moneyCost);
      else state.personalMoney = Math.max(0, state.personalMoney - moneyCost);
    }

    for (const [key, amount] of Object.entries(action.effects || {})) {
      stats[key] = clamp((stats[key] || 0) + amount, 0, 100);
    }
    // mirror core romance/trust/conflict/intimacy onto the backing partner (NPC or legacy)
    syncPartner(state, action.effects || {});
    if (action.stateEffects && window.GameEventEffects?.applyEffects) {
      window.GameEventEffects.applyEffects(state, action.stateEffects);
    }
    if (window.GameState?.spendAction) window.GameState.spendAction(1);
    if (window.GameState?.addLog) window.GameState.addLog(`${action.title}: ${action.resultText}`);
    if (window.GameState?.requestRender) window.GameState.requestRender();
    return { ok: true, resultText: action.resultText };
  }

  function describe(state) {
    if (!isUnlocked(state)) return null;
    const stats = ensureAdultStats(state);
    return { unlocked: true, stats };
  }

  window.GameAdultRelationships = {
    ADULT_STAT_DEFAULTS,
    isUnlocked,
    ensureAdultStats,
    clearIfLocked,
    syncPartner,
    pregnancyChance,
    maybePregnancy,
    getActions,
    performAction,
    describe,
  };
})();
