(() => {
  function catalog() {
    return (window.GameData && window.GameData.lifeGoals) || [];
  }

  function getGoalById(id) {
    return catalog().find((goal) => goal.id === id) || null;
  }

  function assignGoal(state, goalId) {
    const goal = goalId ? getGoalById(goalId) : pickRandomGoal();
    if (!goal) return null;
    state.lifeGoal = goal.id;
    state.lifeGoalProgress = { completedMilestones: [], progress: 0, completed: false };
    return goal;
  }

  function pickRandomGoal() {
    const list = catalog();
    if (!list.length) return null;
    return list[Math.floor((window.GameRandom?.roll?.(list.length) || 0))] || list[0];
  }

  function evaluate(state) {
    const goal = getGoalById(state.lifeGoal);
    if (!goal) return null;
    const progress = (state.lifeGoalProgress = state.lifeGoalProgress || { completedMilestones: [], progress: 0, completed: false });
    progress.completedMilestones = progress.completedMilestones || [];
    const milestones = goal.milestones || [];
    let done = 0;
    milestones.forEach((m) => {
      let ok = false;
      try { ok = Boolean(m.check && m.check(state)); } catch (e) { ok = false; }
      if (ok) {
        done += 1;
        if (!progress.completedMilestones.includes(m.id)) {
          progress.completedMilestones.push(m.id);
          if (window.GameState?.addLog) window.GameState.addLog(`Цель жизни: выполнено «${m.text}».`);
        }
      }
    });
    progress.progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
    progress.completed = milestones.length > 0 && done === milestones.length;
    return progress;
  }

  function onAction(state) {
    if (state.lifeGoal) evaluate(state);
  }

  function describe(state) {
    const goal = getGoalById(state.lifeGoal);
    if (!goal) return null;
    const progress = state.lifeGoalProgress || { progress: 0, completedMilestones: [] };
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      progress: progress.progress || 0,
      completed: Boolean(progress.completed),
      milestones: (goal.milestones || []).map((m) => ({
        text: m.text,
        done: (progress.completedMilestones || []).includes(m.id),
      })),
    };
  }

  window.GameLifeGoals = { catalog, getGoalById, assignGoal, pickRandomGoal, evaluate, onAction, describe };
})();
