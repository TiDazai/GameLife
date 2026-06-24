(() => {
  function statValue(state, stat) {
    if (!stat) return 0;
    if (stat in state) return Number(state[stat]) || 0;
    if (state.traits && stat in state.traits) return Number(state.traits[stat]) || 0;
    if (state.skills && stat in state.skills) return Number(state.skills[stat]) || 0;
    if (state.assets && stat in state.assets) return Number(state.assets[stat]) || 0;
    if (state.healthProfile && stat in state.healthProfile) return Number(state.healthProfile[stat]) || 0;
    if (stat === "money") return Number(state.personalMoney) || 0;
    if (stat === "children") return Array.isArray(state.children) ? state.children.length : 0;
    if (stat === "healthConditions") return window.GameHealthEngine?.allStateConditions?.(state).length || 0;
    if (stat === "legalRisk") return window.GameLegalEngine?.legalRisk?.(state) || 0;
    if (stat === "moneyPressure") return window.GameLegalEngine?.moneyPressure?.(state) || 0;
    if (stat === "unpaidFines") return window.GameLegalEngine?.unpaidFines?.(state).length || 0;
    if (stat === "activeCases") return Array.isArray(state.activeCases) ? state.activeCases.length : 0;
    if (stat === "pastCases") return Array.isArray(state.pastCases) ? state.pastCases.length : 0;
    if (stat === "companyReputation") return Number(state.company?.reputation) || 0;
    if (stat === "relationshipConflict") return Number(state.relationship?.conflict) || 0;
    if (stat === "relationshipTrust") return Number(state.relationship?.trust) || 0;
    if (stat === "careerBurnout") return Number(state.career?.burnout) || 0;
    if (stat === "employed") return state.career?.status === "employed" && state.career?.jobId ? 1 : 0;
    if (stat === "livingParents") return (state.npcs || []).filter((npc) => npc.alive && npc.relationType === "parent").length;
    if (stat === "familyBond") {
      const family = (state.npcs || []).filter((npc) => npc.alive && ["parent", "grandparent", "sibling", "child", "spouse", "partner"].includes(npc.relationType));
      return family.length ? family.reduce((sum, npc) => sum + (Number(npc.bond) || 0), 0) / family.length : 0;
    }
    return 0;
  }

  function hasFlag(state, flag) {
    return Array.isArray(state.flags) && state.flags.includes(flag);
  }

  function checkStats(state, stats, compare) {
    if (!stats) return true;
    return Object.entries(stats).every(([stat, value]) => compare(statValue(state, stat), value));
  }

  function checkRequiredState(state, requiredState = {}) {
    if (requiredState.relationship !== undefined && Boolean(state.relationship) !== requiredState.relationship) return false;
    if (requiredState.married !== undefined && Boolean(state.relationship?.married) !== requiredState.married) return false;
    if (requiredState.company !== undefined && Boolean(state.company) !== requiredState.company) return false;
    if (requiredState.employed !== undefined && Boolean(state.career?.status === "employed" && state.career?.jobId) !== requiredState.employed) return false;
    if (requiredState.industry && state.career?.industry !== requiredState.industry) return false;
    if (requiredState.education && state.education?.levelId !== requiredState.education) return false;
    if (requiredState.profession && state.profession !== requiredState.profession) return false;
    if (requiredState.notProfession && state.profession === requiredState.notProfession) return false;
    if (requiredState.document && !state.documents?.[requiredState.document]) return false;
    if (requiredState.noDocument && state.documents?.[requiredState.noDocument]) return false;
    if (requiredState.legalStatus && state.legalStatus !== requiredState.legalStatus) return false;
    if (requiredState.notLegalStatus && state.legalStatus === requiredState.notLegalStatus) return false;
    return true;
  }

  function checkConditions(state, conditions = {}) {
    if (!conditions) return true;
    if (!checkStats(state, conditions.minStats, (actual, expected) => actual >= expected)) return false;
    if (!checkStats(state, conditions.maxStats, (actual, expected) => actual <= expected)) return false;
    if ((conditions.requiredFlags || []).some((flag) => !hasFlag(state, flag))) return false;
    if ((conditions.blockedFlags || []).some((flag) => hasFlag(state, flag))) return false;
    if (conditions.minChildren !== undefined && statValue(state, "children") < conditions.minChildren) return false;
    if (conditions.maxChildren !== undefined && statValue(state, "children") > conditions.maxChildren) return false;
    if (conditions.minMoney !== undefined && statValue(state, "money") < conditions.minMoney) return false;
    if (conditions.maxDebt !== undefined && statValue(state, "debt") > conditions.maxDebt) return false;
    if (conditions.hasRelationType && !(state.npcs || []).some((npc) => npc.alive && npc.relationType === conditions.hasRelationType)) return false;
    if (conditions.hasHealthCondition && !window.GameHealthEngine?.hasCondition?.(state, conditions.hasHealthCondition)) return false;
    if (conditions.noHealthCondition && window.GameHealthEngine?.hasCondition?.(state, conditions.noHealthCondition)) return false;
    if (conditions.hasLegalRestriction && !window.GameLegalEngine?.hasRestriction?.(state, conditions.hasLegalRestriction)) return false;
    if (conditions.noLegalRestriction && window.GameLegalEngine?.hasRestriction?.(state, conditions.noLegalRestriction)) return false;
    if (conditions.minNpcRelation) {
      const rule = conditions.minNpcRelation;
      const matches = (state.npcs || []).filter((npc) => npc.alive && (!rule.relationType || npc.relationType === rule.relationType));
      if (!matches.some((npc) => Object.entries(rule).every(([key, value]) => key === "relationType" || (Number(npc[key]) || 0) >= value))) return false;
    }
    if (!checkRequiredState(state, conditions.requiredState)) return false;
    return true;
  }

  window.GameEventConditions = { statValue, hasFlag, checkConditions };
})();
