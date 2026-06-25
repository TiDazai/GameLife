(() => {
  // Workplace-as-objects layer. Complements legacy state.career by modeling the
  // *concrete* employer: a Company record, a Workplace Place, a Position on a
  // career track, plus a boss and coworkers as NPCs. Hiring builds all of these;
  // promotion advances the position along the track.

  const rnd = () => window.GameRandom || { roll: (n) => Math.floor(Math.random() * n), pick: (a) => a[0], clamp: (v, a, b) => Math.max(a, Math.min(b, v)) };
  const cData = () => window.GameCareerData || {};
  const npcF = () => window.GameNpcFactory;
  const rel = () => window.GameRelationshipEngine;
  const places = () => window.GamePlaces;

  function rangeRoll([min, max]) {
    return min + rnd().roll(Math.max(1, max - min + 1));
  }

  function randomId(prefix = "company") {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  }

  function emptyWorkplace() {
    return {
      active: false,
      company: null,
      workplaceId: null,
      workplaceTypeId: null,
      trackId: null,
      positionId: null,
      title: "",
      field: "",
      level: 0,
      jobId: null,
      since: null,
      bossId: null,
      coworkerIds: [],
      history: [],
    };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return null;
    const w = state.workplace && typeof state.workplace === "object" ? state.workplace : null;
    if (!w) {
      state.workplace = emptyWorkplace();
      return state.workplace;
    }
    state.workplace = {
      ...emptyWorkplace(),
      ...w,
      coworkerIds: Array.isArray(w.coworkerIds) ? w.coworkerIds.filter(Boolean) : [],
      history: Array.isArray(w.history) ? w.history.slice(-24) : [],
      company: w.company && typeof w.company === "object" ? w.company : null,
    };
    return state.workplace;
  }

  function pushHistory(w, text) {
    if (!w || !text) return;
    w.history = Array.isArray(w.history) ? w.history : [];
    w.history.unshift(text);
    w.history = w.history.slice(0, 24);
  }

  function pickSize() {
    const sizes = cData().companySizes || [{ id: "smb", label: "компания", headcount: [20, 120], prestige: 50, salaryMult: 1 }];
    return rnd().pick(sizes);
  }

  function companyName(industry) {
    const pools = cData().companyNamePools || {};
    const pool = pools[industry] || cData().companyDefaultNames || ["«Компания»"];
    return rnd().pick(pool).replace("{n}", String(1 + rnd().roll(40)));
  }

  function createCompany(state, industry) {
    const size = pickSize();
    return {
      id: randomId("company"),
      name: companyName(industry),
      industry,
      size: size.id,
      sizeLabel: size.label,
      prestige: size.prestige,
      salaryMult: size.salaryMult,
      headcount: rangeRoll(size.headcount || [20, 120]),
    };
  }

  function track(field) {
    return (cData().trackForField && cData().trackForField(field)) || { ladder: ["intern", "junior", "specialist", "senior", "lead", "manager", "head", "director"], titles: {}, field };
  }

  function positionAtLevel(field, level) {
    const tr = track(field);
    const positions = cData().positions || {};
    const idx = Math.max(0, Math.min(tr.ladder.length - 1, level));
    const posId = tr.ladder[idx];
    const base = positions[posId] || { id: posId, title: posId, level: idx + 1, salaryMult: 1, prestige: 45 };
    return { ...base, title: tr.titles[posId] || base.title, trackId: tr.id, ladderIndex: idx };
  }

  function createWorkplacePlace(state, company, industry) {
    if (!places()) return null;
    const wtype = (cData().workplaceTypeFor && cData().workplaceTypeFor(industry)) || { placeType: "companyOffice", id: "office" };
    const place = places().createPlace({
      type: wtype.placeType,
      country: state.country,
      city: state.city,
      name: company ? company.name : undefined,
    });
    places().addPlace(state, place);
    return { place, wtype };
  }

  function populateColleagues(state, w, field) {
    if (!npcF() || !rel()) return;
    // one boss
    const companyId = w.company ? w.company.id : null;
    const boss = npcF().createBossNpc(state, {
      workplaceId: w.workplaceId,
      career: { field, companyId, positionId: w.positionId || null },
      metContext: "work",
      metAtPlaceId: w.workplaceId,
      metYear: state.age || 0,
    });
    rel().addNpc(state, boss);
    rel().addNpcHistory?.(boss, "Мой руководитель на работе.");
    if (w.workplaceId) window.GamePlaces?.attachNpc?.(state, w.workplaceId, boss.id);
    w.bossId = boss.id;
    // a handful of concrete coworkers
    const count = 2 + rnd().roll(3);
    for (let i = 0; i < count; i += 1) {
      const npc = npcF().createCoworkerNpc(state, {
        workplaceId: w.workplaceId,
        career: { field, companyId, positionId: w.positionId || null },
        metContext: "work",
        metAtPlaceId: w.workplaceId,
        metYear: state.age || 0,
      });
      rel().addNpc(state, npc);
      rel().addNpcHistory?.(npc, "Коллега по работе.");
      if (w.workplaceId) window.GamePlaces?.attachNpc?.(state, w.workplaceId, npc.id);
      w.coworkerIds.push(npc.id);
    }
  }

  // Called when the player is hired into a legacy job. Builds the concrete
  // employer object graph around that job.
  function onHire(state, job = {}) {
    normalize(state);
    const industry = job.industry || state.career?.industry || "service";
    const field = industry;
    const company = createCompany(state, industry);
    const created = createWorkplacePlace(state, company, industry);
    const startLevel = (state.age || 18) < 20 ? 0 : 1; // intern vs junior
    const position = positionAtLevel(field, startLevel);
    const w = (state.workplace = emptyWorkplace());
    w.active = true;
    w.company = company;
    w.workplaceId = created ? created.place.id : null;
    w.workplaceTypeId = created ? created.wtype.id : null;
    w.trackId = position.trackId;
    w.positionId = position.id;
    w.title = position.title;
    w.field = field;
    w.level = position.ladderIndex;
    w.jobId = job.id || null;
    w.since = state.year || 0;
    populateColleagues(state, w, field);
    pushHistory(w, `Найм: ${company.name} — ${position.title}`);
    return w;
  }

  // Advance to the next rung of the career track.
  function promote(state) {
    normalize(state);
    const w = state.workplace;
    if (!w.active) return null;
    const tr = track(w.field);
    if (w.level >= tr.ladder.length - 1) return w;
    const position = positionAtLevel(w.field, w.level + 1);
    w.level = position.ladderIndex;
    w.positionId = position.id;
    w.title = position.title;
    pushHistory(w, `Повышение: ${position.title}`);
    return w;
  }

  function leave(state, reason = "Уход с работы") {
    normalize(state);
    const w = state.workplace;
    if (!w.active) return null;
    w.active = false;
    // Old colleagues don't vanish: they stay in the world as acquaintances and
    // are tagged so the player can still see who they used to work with.
    const formerIds = [w.bossId, ...(w.coworkerIds || [])].filter(Boolean);
    formerIds.forEach((id) => {
      const npc = rel() ? rel().findNpc(state, id) : null;
      if (!npc) return;
      if (npc.relationType === "boss" || npc.relationType === "coworker") {
        npc.relationType = "acquaintance";
        npc.role = window.GameNpcFactory?.roleByRelation?.acquaintance || "Знакомый";
      }
      npc.tags = [...new Set([...(npc.tags || []), "ex_coworker", "ex_work"])];
      rel()?.addNpcHistory?.(npc, "Перестали работать вместе.");
    });
    if (rel()?.syncLegacy) rel().syncLegacy(state);
    pushHistory(w, reason);
    return w;
  }

  function boss(state) {
    normalize(state);
    return state.workplace.bossId && rel() ? rel().findNpc(state, state.workplace.bossId) : null;
  }

  function coworkers(state) {
    normalize(state);
    if (!rel()) return [];
    return state.workplace.coworkerIds.map((id) => rel().findNpc(state, id)).filter(Boolean);
  }

  function isEmployed(state) {
    return Boolean(state.workplace && state.workplace.active);
  }

  function salaryMultiplier(state) {
    normalize(state);
    const w = state.workplace;
    const position = positionAtLevel(w.field, w.level);
    const companyMult = w.company ? w.company.salaryMult : 1;
    return (position.salaryMult || 1) * (companyMult || 1);
  }

  window.GameWorkplace = {
    normalize,
    emptyWorkplace,
    createCompany,
    positionAtLevel,
    onHire,
    promote,
    leave,
    boss,
    coworkers,
    isEmployed,
    salaryMultiplier,
  };
})();
