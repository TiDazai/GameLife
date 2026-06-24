(() => {
  function catalog() {
    return (window.GameData && window.GameData.storyArcs) || [];
  }

  function getArcById(id) {
    return catalog().find((arc) => arc.id === id) || null;
  }

  function activeArcs(state) {
    return Array.isArray(state.storyArcs) ? state.storyArcs : (state.storyArcs = []);
  }

  function canStart(state, arc) {
    if (activeArcs(state).some((a) => a.id === arc.id)) return false;
    const cond = arc.startConditions || {};
    if (cond.minAge !== undefined && state.age < cond.minAge) return false;
    if (window.GameEventConditions?.checkConditions && !window.GameEventConditions.checkConditions(state, cond)) return false;
    return true;
  }

  function maybeStart(state, rng = Math.random) {
    const candidates = catalog().filter((arc) => canStart(state, arc) && !(arc.completedBy && false));
    const eligible = candidates.filter((arc) => !arcWasCompleted(state, arc.id));
    if (!eligible.length) return null;
    if (activeArcs(state).length >= 2) return null;
    if (rng() > 0.3) return null;
    const arc = eligible[Math.floor(rng() * eligible.length)];
    activeArcs(state).push({ id: arc.id, title: arc.title, step: arc.steps[0]?.id, status: "active" });
    if (window.GameState?.addLog) window.GameState.addLog(`Началась история: «${arc.title}». ${arc.description}`);
    return arc;
  }

  function arcWasCompleted(state, arcId) {
    return activeArcs(state).some((a) => a.id === arcId && a.status !== "active");
  }

  function advance(state, instance, rng = Math.random) {
    const arc = getArcById(instance.id);
    if (!arc) return;
    const step = (arc.steps || []).find((s) => s.id === instance.step);
    if (!step) { instance.status = "done"; return; }
    let branch = (step.branches || []).find((b) => {
      try { return b.when ? Boolean(b.when(state)) : false; } catch (e) { return false; }
    });
    if (!branch) branch = (step.branches || []).find((b) => !b.when) || step.branches?.[step.branches.length - 1];
    if (!branch) { instance.status = "done"; return; }
    if (branch.effects && window.GameEventEffects?.applyEffects) {
      window.GameEventEffects.applyEffects(state, branch.effects, rng);
    }
    if (window.GameState?.addLog) window.GameState.addLog(`История «${arc.title}»: ${branch.text}`);
    if (branch.end) {
      instance.status = branch.end; // "success" | "failure"
      const reward = arc.completionReward?.[branch.end];
      if (reward && window.GameEventEffects?.applyEffects) window.GameEventEffects.applyEffects(state, reward, rng);
      if (window.GameState?.addLog) {
        window.GameState.addLog(branch.end === "success" ? `История «${arc.title}» завершилась успехом.` : `История «${arc.title}» подошла к концу.`);
      }
    } else if (branch.next) {
      instance.step = branch.next;
    } else {
      instance.status = "done";
    }
  }

  // Called each year: advance active arcs and maybe start new ones.
  function tick(state, rng = Math.random) {
    activeArcs(state).forEach((instance) => {
      if (instance.status === "active") advance(state, instance, rng);
    });
    maybeStart(state, rng);
  }

  function onAction(state) {
    // arcs advance yearly via tick; nothing per-action for now
  }

  function describe(state) {
    return activeArcs(state).map((instance) => {
      const arc = getArcById(instance.id) || {};
      const stepDef = (arc.steps || []).find((s) => s.id === instance.step);
      return {
        id: instance.id,
        title: instance.title || arc.title,
        status: instance.status,
        stepText: stepDef?.text || "",
        category: arc.category || "",
      };
    });
  }

  window.GameStoryArcs = { catalog, getArcById, maybeStart, tick, advance, onAction, describe };
})();
