(() => {
  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function roll(max) {
    return Math.floor(Math.random() * max);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.GameRandom = { pick, roll, clamp };
})();
