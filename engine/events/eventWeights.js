(() => {
  const { statValue } = window.GameEventConditions;

  function modifierApplies(state, modifier) {
    const value = statValue(state, modifier.stat);
    if (modifier.gte !== undefined && value < modifier.gte) return false;
    if (modifier.lte !== undefined && value > modifier.lte) return false;
    if (modifier.gt !== undefined && value <= modifier.gt) return false;
    if (modifier.lt !== undefined && value >= modifier.lt) return false;
    if (modifier.eq !== undefined && value !== modifier.eq) return false;
    return true;
  }

  function characteristicWeight(state, event) {
    const traits = state.traits || {};
    const skills = state.skills || {};
    let add = 0;
    if (["school", "career"].includes(event.category)) add += Math.max(0, (traits.ambition || 0) - 55) / 12;
    if (["school", "health"].includes(event.category)) add += Math.max(0, (traits.curiosity || 0) - 55) / 18;
    if (["relationship", "family"].includes(event.category)) add += Math.max(0, (traits.kindness || 0) - 55) / 12;
    if (["money"].includes(event.category)) add += Math.max(0, (skills.finance || 0) - 45) / 15;
    if (["teen", "money", "legal"].includes(event.category)) add += Math.max(0, (traits.risk || 0) - 60) / 14;
    if (event.category === "legal") add += (window.GameLegalEngine?.legalRisk?.(state) || 0) / 18;
    return add;
  }

  function eventWeight(state, event) {
    let weight = Number(event.baseWeight) || 0;
    for (const modifier of event.weightModifiers || []) {
      if (!modifierApplies(state, modifier)) continue;
      if (modifier.add !== undefined) weight += Number(modifier.add) || 0;
      if (modifier.multiply !== undefined) weight *= Number(modifier.multiply) || 1;
    }
    weight += characteristicWeight(state, event);
    return Math.max(0, weight);
  }

  function pickWeighted(items, getWeight, rng = Math.random) {
    const weighted = items.map((item) => ({ item, weight: Math.max(0, getWeight(item)) })).filter((entry) => entry.weight > 0);
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    if (total <= 0) return null;
    let cursor = rng() * total;
    for (const entry of weighted) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry.item;
    }
    return weighted.at(-1)?.item || null;
  }

  window.GameEventWeights = { eventWeight, pickWeighted };
})();
