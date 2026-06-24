(() => {
  const { clamp } = window.GameRandom;
  const Engine = window.GameRelationshipEngine;
  const catalog = window.GameData.relationshipActionCatalog;

  function safeCost(state, action) {
    return Math.floor((action.cost || 0) * (window.GameState?.cityData?.(state)?.cost || 1));
  }

  function applyStateEffects(state, effects = {}) {
    const stateKeys = ["happiness", "stress", "mental", "reputation", "social", "karma", "health", "discipline"];
    const skillKeys = ["logic", "creativity", "empathy", "fitness", "finance", "language", "craft", "leadership"];
    const changes = {};
    for (const [key, amount] of Object.entries(effects)) {
      if (stateKeys.includes(key)) changes[key] = (changes[key] || 0) + amount;
      if (skillKeys.includes(key) && state.skills) state.skills[key] = clamp((state.skills[key] || 0) + amount, 0, 100);
    }
    if (Object.keys(changes).length && window.GameState?.change) window.GameState.change(changes);
  }

  function applyNpcEffects(npc, effects = {}) {
    const npcEffects = {};
    ["bond", "trust", "conflict", "romance", "respect", "health", "mental"].forEach((key) => {
      if (effects[key] !== undefined) npcEffects[key] = effects[key];
    });
    Engine.changeNpc(npc, npcEffects);
  }

  function actionAllowed(state, actionId, npcId) {
    const action = catalog[actionId];
    if (!action || state.deceased || state.event) return { ok: false, reason: "Действие недоступно." };
    if (action.minAge !== undefined && state.age < action.minAge) return { ok: false, reason: "Возраст пока не подходит." };
    if (!window.GameState?.canAct?.()) return { ok: false, reason: "Нет действий на этот год." };
    if (action.maxChildren !== undefined && Engine.children(state).length >= action.maxChildren) return { ok: false, reason: "В этой версии семьи уже достаточно детей." };
    if (safeCost(state, action) > 0 && state.personalMoney + state.familyMoney < safeCost(state, action)) return { ok: false, reason: "Не хватает денег." };
    const npc = npcId ? Engine.findNpc(state, npcId) : Engine.activePartner(state);
    if (action.target !== "single" && action.target !== "partner" && action.target !== "spouse" && action.target !== "any") return { ok: true, npc };
    if (action.target === "single") {
      if (Engine.activePartner(state)) return { ok: false, reason: "Уже есть романтические отношения." };
      if (npc && action.allowedRelations && !action.allowedRelations.includes(npc.relationType)) return { ok: false, reason: "С этим человеком сейчас нельзя начать отношения." };
      return { ok: true, npc };
    }
    if (!npc || !npc.alive) return { ok: false, reason: "Нужен живой человек для действия." };
    if (action.target === "partner" && npc.relationType !== "partner") return { ok: false, reason: "Нужен партнер." };
    if (action.target === "spouse" && npc.relationType !== "spouse") return { ok: false, reason: "Нужен супруг или супруга." };
    if (action.minBond !== undefined && (npc.bond || 0) < action.minBond) return { ok: false, reason: "Связь пока слабая." };
    if (action.minTrust !== undefined && (npc.trust || 0) < action.minTrust) return { ok: false, reason: "Недостаточно доверия." };
    return { ok: true, npc };
  }

  function spendCost(state, action) {
    const cost = safeCost(state, action);
    if (!cost) return 0;
    if (state.personalMoney >= cost) state.personalMoney -= cost;
    else {
      const rest = cost - state.personalMoney;
      state.personalMoney = 0;
      state.familyMoney = Math.max(0, state.familyMoney - rest);
    }
    return cost;
  }

  function applyRelationshipAction(state, actionId, npcId, rng = Math.random) {
    Engine.normalizeNpcs(state);
    const action = catalog[actionId];
    const allowed = actionAllowed(state, actionId, npcId);
    if (!allowed.ok) return { ok: false, text: allowed.reason };

    window.GameState.spendAction();
    spendCost(state, action);
    let npc = allowed.npc;
    let text = action.result;

    if (actionId === "start_relationship") {
      npc = npc ? Engine.findNpc(state, npc.id) : null;
      if (npc) {
        npc.relationType = "partner";
        npc.role = Engine.relationLabels.partner;
      } else {
        npc = Engine.startRelationship(state, {});
      }
    } else if (actionId === "proposal") {
      npc.tags = [...new Set([...(npc.tags || []), "engaged"])];
      Engine.addNpcHistory(npc, "Получено предложение о браке.");
    } else if (actionId === "marriage") {
      npc = Engine.marryNpc(state, npc.id);
    } else if (actionId === "divorce") {
      npc = Engine.divorceNpc(state, npc.id);
    } else if (actionId === "breakup") {
      npc = Engine.breakupNpc(state, npc.id);
    } else if (actionId === "have_child") {
      const child = Engine.createChild(state, {});
      text = `${action.result} Ребенка зовут ${child.name}.`;
      if (npc) Engine.changeNpc(npc, { bond: 4, trust: 2, conflict: -2 });
    } else if (actionId === "ask_help") {
      const support = Math.floor((120 + (npc.trust || 0) * 5 + rng() * 260) * (window.GameState?.cityData?.()?.salary || 1));
      state.personalMoney += support;
      Engine.changeNpc(npc, { money: -support });
      text = `${action.result} Получено ${window.GameState?.fmt ? window.GameState.fmt(support) : support}.`;
    } else if (actionId === "help_money") {
      Engine.changeNpc(npc, { money: safeCost(state, action) });
    }

    if (npc) {
      applyNpcEffects(npc, action.effects);
      Engine.addNpcHistory(npc, action.result);
    }
    applyStateEffects(state, action.effects);
    Engine.syncLegacy(state);
    if (window.GameState?.notify) window.GameState.notify(text);
    return { ok: true, text, npc };
  }

  window.GameRelationshipActions = {
    catalog,
    actionAllowed,
    applyRelationshipAction,
    safeCost,
  };
})();
