(() => {
  // Education-as-objects layer. Sits alongside the legacy education progression
  // (state.education) and models the *concrete* institution a character attends:
  // a real Place, a chosen Specialty, classmates and teachers as NPCs, and a
  // diploma object on graduation. Career later reads the specialty for job fit.

  const rnd = () => window.GameRandom || { roll: (n) => Math.floor(Math.random() * n), pick: (a) => a[0], clamp: (v, a, b) => Math.max(a, Math.min(b, v)) };
  const eduData = () => window.GameEducationData || { specialties: {}, schoolTypes: {}, universityTypes: {} };
  const npcF = () => window.GameNpcFactory;
  const rel = () => window.GameRelationshipEngine;
  const places = () => window.GamePlaces;

  function clamp(v, a = 0, b = 100) {
    return rnd().clamp(Number.isFinite(Number(v)) ? Number(v) : a, a, b);
  }

  function rangeRoll([min, max]) {
    return min + rnd().roll(Math.max(1, max - min + 1));
  }

  function institutionMeta(typeKey) {
    return eduData().schoolTypes[typeKey] || eduData().universityTypes[typeKey] || null;
  }

  function specialty(id) {
    return eduData().specialties[id] || null;
  }

  function listSpecialties(level) {
    const all = Object.values(eduData().specialties);
    return level ? all.filter((s) => s.level === level) : all;
  }

  function availableSpecialties(state, level) {
    const age = state.age || 0;
    return listSpecialties(level).filter((s) => age >= (s.minAge || 0));
  }

  function emptyPath() {
    return {
      active: false,
      institutionId: null,
      institutionType: null,
      level: null,
      specialtyId: null,
      enrolledYear: null,
      expectedGradYear: null,
      status: "none", // none | studying | graduated | dropped | transferred
      performance: 60,
      classmateIds: [],
      teacherIds: [],
      diploma: null,
      diplomas: [],
      history: [],
    };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return null;
    const p = state.educationPath && typeof state.educationPath === "object" ? state.educationPath : null;
    if (!p) {
      state.educationPath = emptyPath();
      return state.educationPath;
    }
    const base = emptyPath();
    state.educationPath = {
      ...base,
      ...p,
      classmateIds: Array.isArray(p.classmateIds) ? p.classmateIds.filter(Boolean) : [],
      teacherIds: Array.isArray(p.teacherIds) ? p.teacherIds.filter(Boolean) : [],
      diplomas: Array.isArray(p.diplomas) ? p.diplomas : [],
      history: Array.isArray(p.history) ? p.history.slice(-24) : [],
    };
    return state.educationPath;
  }

  function pushHistory(path, text) {
    if (!path || !text) return;
    path.history = Array.isArray(path.history) ? path.history : [];
    path.history.unshift(text);
    path.history = path.history.slice(0, 24);
  }

  function institutionName(meta) {
    const pool = (meta && meta.namePool) || ["Учебное заведение"];
    return rnd().pick(pool).replace("{n}", String(1 + rnd().roll(40)));
  }

  function createInstitution(state, meta) {
    if (!places()) return null;
    const place = places().createPlace({
      type: meta.placeType,
      country: state.country,
      city: state.city,
      name: institutionName(meta),
    });
    places().addPlace(state, place);
    return place;
  }

  function populateCohort(state, meta, institutionId, specialtyObj) {
    const path = state.educationPath;
    if (!npcF() || !rel()) return;
    const teacherRel = meta.level === "university" || meta.level === "master" ? "professor" : "teacher";
    const teacherCount = rangeRoll(meta.teacherCount || [2, 3]);
    const classmateCount = rangeRoll(meta.classmateCount || [3, 6]);
    for (let i = 0; i < teacherCount; i += 1) {
      const maker = teacherRel === "professor" ? npcF().createProfessorNpc : npcF().createTeacherNpc;
      const npc = maker(state, {
        schoolId: institutionId,
        occupation: specialtyObj ? `преподаватель: ${specialtyObj.title}` : undefined,
      });
      rel().addNpc(state, npc);
      path.teacherIds.push(npc.id);
    }
    for (let i = 0; i < classmateCount; i += 1) {
      const npc = npcF().createClassmateNpc(state, {
        schoolId: institutionId,
        education: specialtyObj ? { level: meta.level, specialtyId: specialtyObj.id, institutionId } : undefined,
      });
      rel().addNpc(state, npc);
      path.classmateIds.push(npc.id);
    }
  }

  // Enroll into a concrete institution + specialty. Generates the venue and
  // the cohort of classmates/teachers as NPCs.
  function enroll(state, opts = {}) {
    normalize(state);
    const typeKey = opts.institutionType || "university";
    const meta = institutionMeta(typeKey);
    if (!meta) return null;
    if ((state.age || 0) < (meta.minAge || 0)) return null;

    const specialtyObj = opts.specialtyId ? specialty(opts.specialtyId) : null;
    const institution = createInstitution(state, meta);
    const path = (state.educationPath = emptyPath());
    path.active = true;
    path.status = "studying";
    path.institutionId = institution ? institution.id : null;
    path.institutionType = typeKey;
    path.level = meta.level;
    path.specialtyId = specialtyObj ? specialtyObj.id : null;
    path.enrolledYear = state.year || 0;
    path.expectedGradYear = (state.year || 0) + (meta.level === "school" ? 4 : meta.level === "master" ? 2 : 4);
    path.performance = clamp(55 + rnd().roll(20));
    populateCohort(state, meta, path.institutionId, specialtyObj);
    pushHistory(path, `Поступление: ${institution ? institution.name : meta.placeType}${specialtyObj ? ` — ${specialtyObj.title}` : ""}`);
    return path;
  }

  function chooseSpecialty(state, specialtyId) {
    normalize(state);
    const path = state.educationPath;
    const specialtyObj = specialty(specialtyId);
    if (!path.active || !specialtyObj) return null;
    path.specialtyId = specialtyId;
    pushHistory(path, `Выбор специальности: ${specialtyObj.title}`);
    return path;
  }

  // One academic year of progress; nudges performance and specialty skills.
  function studyYear(state, rng = rnd()) {
    normalize(state);
    const path = state.educationPath;
    if (!path.active || path.status !== "studying") return null;
    const drift = rng.roll(13) - 5;
    path.performance = clamp(path.performance + drift);
    const specialtyObj = specialty(path.specialtyId);
    if (specialtyObj && specialtyObj.skills && state.skills) {
      Object.entries(specialtyObj.skills).forEach(([skill, amount]) => {
        if (typeof state.skills[skill] === "number") {
          state.skills[skill] = clamp(state.skills[skill] + amount, 0, 100);
        }
      });
    }
    if ((state.year || 0) >= (path.expectedGradYear || Infinity)) {
      return graduate(state);
    }
    return path;
  }

  function makeDiploma(state, path) {
    const specialtyObj = specialty(path.specialtyId);
    return {
      level: path.level,
      institutionId: path.institutionId,
      specialtyId: path.specialtyId,
      specialtyTitle: specialtyObj ? specialtyObj.title : null,
      field: specialtyObj ? specialtyObj.field : null,
      year: state.year || 0,
      gpa: Math.round(path.performance) / 20, // 0..5 scale
    };
  }

  function graduate(state) {
    normalize(state);
    const path = state.educationPath;
    if (!path.active) return null;
    const diploma = makeDiploma(state, path);
    path.diploma = diploma;
    path.diplomas.push(diploma);
    path.active = false;
    path.status = "graduated";
    pushHistory(path, `Диплом: ${diploma.specialtyTitle || path.level} (GPA ${diploma.gpa.toFixed(1)})`);
    return path;
  }

  function dropOut(state) {
    normalize(state);
    const path = state.educationPath;
    if (!path.active) return null;
    path.active = false;
    path.status = "dropped";
    pushHistory(path, "Отчисление / уход из учебного заведения");
    return path;
  }

  function transfer(state, opts = {}) {
    normalize(state);
    const prev = state.educationPath;
    if (prev.active) pushHistory(prev, "Перевод в другое заведение");
    const carried = { diplomas: prev.diplomas };
    const path = enroll(state, opts);
    if (path) {
      path.status = "studying";
      path.diplomas = carried.diplomas;
      pushHistory(path, "Перевод завершён");
    }
    return path;
  }

  function isEnrolled(state) {
    return Boolean(state.educationPath && state.educationPath.active);
  }

  function highestDiploma(state) {
    normalize(state);
    const order = { school: 1, college: 2, university: 3, master: 4 };
    return (state.educationPath.diplomas || []).reduce((best, d) => {
      if (!best || (order[d.level] || 0) > (order[best.level] || 0)) return d;
      return best;
    }, null);
  }

  window.GameEducationPath = {
    normalize,
    emptyPath,
    institutionMeta,
    specialty,
    listSpecialties,
    availableSpecialties,
    enroll,
    chooseSpecialty,
    studyYear,
    graduate,
    dropOut,
    transfer,
    isEnrolled,
    highestDiploma,
  };
})();
