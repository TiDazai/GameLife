(() => {
  const { state, createNewLife, createLifeFromChild, normalizeState, setState, setAppMode, notify, requestRender } = window.GameState;
  const historyKey = "gamelife-generation-history";

  // ---------------------------------------------------------------------------
  // SaveRepository — a single localStorage blob that holds the live autosave
  // plus any number of named slots. It is intentionally defensive: a missing or
  // broken localStorage never throws and never wipes an existing save.
  // ---------------------------------------------------------------------------
  const REPO_KEY = "gamelife-save-repository";
  const LEGACY_KEY = "life-economy-save"; // old single-slot key (auto-migrated)
  const REPO_VERSION = 1; // save-FORMAT version (independent of state.version)
  const STATE_VERSION = 9; // schema version stamped on each snapshot
  const MAX_SLOTS = 20;

  function ls() {
    try {
      return window.localStorage || null;
    } catch {
      return null;
    }
  }
  function lsGet(key) {
    try {
      return ls()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  function lsSet(key, value) {
    try {
      ls()?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
  function lsRemove(key) {
    try {
      ls()?.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  function makeId() {
    return `save_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function defaultName(st) {
    const name = `${st?.firstName || ""} ${st?.lastName || ""}`.trim();
    return name || "Безымянная жизнь";
  }

  function snapshotState(st) {
    // Deep clone + stamp the schema version. Temporary UI-only fields (filters,
    // search boxes) live in render.js module scope, never in state, so nothing
    // ephemeral leaks into the save here.
    return JSON.parse(JSON.stringify({ ...st, version: STATE_VERSION }));
  }

  function makeEntry(name, st) {
    return { id: makeId(), name: name || defaultName(st), state: snapshotState(st), updatedAt: Date.now() };
  }

  function blankRepo() {
    return { repoVersion: REPO_VERSION, currentSaveId: null, autosave: null, saves: [], updatedAt: Date.now() };
  }

  function normalizeRepo(parsed) {
    const repo = blankRepo();
    if (!parsed || typeof parsed !== "object") return repo;
    repo.repoVersion = REPO_VERSION;
    repo.currentSaveId = typeof parsed.currentSaveId === "string" ? parsed.currentSaveId : null;
    repo.autosave = parsed.autosave && parsed.autosave.state ? parsed.autosave : null;
    repo.saves = Array.isArray(parsed.saves) ? parsed.saves.filter((s) => s && s.id && s.state) : [];
    repo.updatedAt = Number.isFinite(parsed.updatedAt) ? parsed.updatedAt : Date.now();
    return repo;
  }

  function readRepo() {
    const raw = lsGet(REPO_KEY);
    if (raw) {
      try {
        return normalizeRepo(JSON.parse(raw));
      } catch {
        /* fall through to legacy / blank */
      }
    }
    // One-time migration of the old single-slot save into the repository.
    const legacy = lsGet(LEGACY_KEY);
    if (legacy) {
      try {
        const legacyState = JSON.parse(legacy);
        const repo = blankRepo();
        const entry = makeEntry(defaultName(legacyState), legacyState);
        repo.autosave = entry;
        repo.currentSaveId = entry.id;
        writeRepo(repo);
        return repo;
      } catch {
        /* ignore broken legacy */
      }
    }
    return blankRepo();
  }

  function writeRepo(repo) {
    repo.repoVersion = REPO_VERSION;
    repo.updatedAt = Date.now();
    return lsSet(REPO_KEY, JSON.stringify(repo));
  }

  function findEntry(repo, id) {
    if (repo.autosave && repo.autosave.id === id) return repo.autosave;
    return repo.saves.find((s) => s.id === id) || null;
  }

  // ---- public repository API ------------------------------------------------

  function hasAnySave() {
    const repo = readRepo();
    return Boolean(repo.autosave || (repo.saves && repo.saves.length));
  }

  function getCurrentSave() {
    const repo = readRepo();
    if (repo.currentSaveId) {
      const found = findEntry(repo, repo.currentSaveId);
      if (found) return found;
    }
    return repo.autosave || repo.saves[0] || null;
  }

  function saveCurrentGame(st = state) {
    if (!st) return false;
    const repo = readRepo();
    const id = repo.autosave?.id || makeId();
    repo.autosave = { id, name: defaultName(st), state: snapshotState(st), updatedAt: Date.now() };
    repo.currentSaveId = id;
    return writeRepo(repo);
  }

  function loadCurrentGame() {
    const save = getCurrentSave();
    if (!save || !save.state) {
      notify("Сохранение не найдено.");
      return null;
    }
    const loaded = normalizeState(save.state);
    setState(loaded);
    setAppMode(loaded.deceased ? "death" : "life");
    requestRender();
    return loaded;
  }

  function createNewSaveSlot(name, st = state) {
    if (!st) return null;
    const repo = readRepo();
    const entry = makeEntry(name, st);
    repo.saves.unshift(entry);
    repo.saves = repo.saves.slice(0, MAX_SLOTS);
    return writeRepo(repo) ? entry : null;
  }

  function listSaveSlots() {
    const repo = readRepo();
    const slots = repo.saves.map((s) => ({ id: s.id, name: s.name, updatedAt: s.updatedAt, kind: "slot" }));
    if (repo.autosave) {
      slots.unshift({
        id: repo.autosave.id,
        name: `Автосохранение — ${repo.autosave.name}`,
        updatedAt: repo.autosave.updatedAt,
        kind: "autosave",
      });
    }
    return slots;
  }

  function loadSaveSlot(id) {
    const repo = readRepo();
    const entry = findEntry(repo, id);
    if (!entry || !entry.state) {
      notify("Слот не найден.");
      return null;
    }
    const loaded = normalizeState(entry.state);
    setState(loaded);
    saveCurrentGame(loaded); // make the chosen slot the live autosave going forward
    setAppMode(loaded.deceased ? "death" : "life");
    requestRender();
    return loaded;
  }

  function deleteSaveSlot(id) {
    const repo = readRepo();
    let changed = false;
    if (repo.autosave && repo.autosave.id === id) {
      repo.autosave = null;
      changed = true;
    }
    const before = repo.saves.length;
    repo.saves = repo.saves.filter((s) => s.id !== id);
    if (repo.saves.length !== before) changed = true;
    if (repo.currentSaveId === id) repo.currentSaveId = repo.autosave?.id || repo.saves[0]?.id || null;
    return changed ? writeRepo(repo) : false;
  }

  function deleteAllSaves() {
    lsRemove(REPO_KEY);
    lsRemove(LEGACY_KEY);
    return true;
  }

  function exportSave() {
    return lsGet(REPO_KEY) || JSON.stringify(readRepo());
  }

  function importSave(json) {
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      const repo = normalizeRepo(parsed);
      return writeRepo(repo);
    } catch {
      return false;
    }
  }

  // ---- legacy-compatible helpers (used by existing UI / tests) ---------------

  function saveGame() {
    saveCurrentGame(state);
    notify("Жизнь сохранена.");
  }

  function loadGame() {
    const loaded = loadCurrentGame();
    if (loaded) notify("Сохранение загружено.");
  }

  function resetGame() {
    setAppMode("creator");
    requestRender();
  }

  function startGame(options = {}) {
    setState(createNewLife(options));
    setAppMode("life");
    // A brand-new life starts a fresh autosave (replaces the live slot).
    const repo = readRepo();
    repo.autosave = makeEntry(defaultName(state), state);
    repo.currentSaveId = repo.autosave.id;
    writeRepo(repo);
    requestRender();
  }

  function startRandomGame() {
    startGame({});
  }

  function readGenerationHistory() {
    try {
      const raw = lsGet(historyKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeGenerationHistory(history) {
    lsSet(historyKey, JSON.stringify(history.slice(0, 24)));
  }

  function recordGenerationHistory(snapshot) {
    if (!snapshot) return;
    const history = readGenerationHistory();
    const withoutDuplicate = history.filter((item) => item.id !== snapshot.id);
    writeGenerationHistory([snapshot, ...withoutDuplicate]);
  }

  function continueAsChild(childId) {
    const next = createLifeFromChild(state, childId);
    if (!next) {
      notify("Не удалось продолжить за этого ребенка.");
      return;
    }
    setState(next);
    setAppMode("life");
    const repo = readRepo();
    repo.autosave = makeEntry(defaultName(state), state);
    repo.currentSaveId = repo.autosave.id;
    writeRepo(repo);
    requestRender();
  }

  window.GameStorage = {
    // repository API
    hasAnySave,
    getCurrentSave,
    saveCurrentGame,
    loadCurrentGame,
    createNewSaveSlot,
    listSaveSlots,
    loadSaveSlot,
    deleteSaveSlot,
    deleteAllSaves,
    exportSave,
    importSave,
    // legacy-compatible helpers
    saveGame,
    loadGame,
    resetGame,
    startGame,
    startRandomGame,
    readGenerationHistory,
    recordGenerationHistory,
    continueAsChild,
  };
})();
