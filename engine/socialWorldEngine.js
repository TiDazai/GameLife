(() => {
  // SocialWorld orchestrates the NPC-first world: it makes sure every life stage
  // (family, childhood/neighbourhood, school, university, work) is populated with
  // CONCRETE people, and it guards against generating duplicates every render or
  // every year. It reuses GameNpcFactory / GameRelationshipEngine / GamePlaces and
  // never invents people that already exist.

  const F = () => window.GameNpcFactory;
  const R = () => window.GameRelationshipEngine;
  const P = () => window.GamePlaces;

  function roll(n) {
    return Math.floor(Math.random() * n);
  }

  // ---- state.socialWorld bookkeeping -------------------------------------
  function normalizeSocialWorld(state) {
    const raw = state.socialWorld && typeof state.socialWorld === "object" ? state.socialWorld : {};
    state.socialWorld = {
      version: 1,
      familyGenerated: Boolean(raw.familyGenerated),
      childhoodGenerated: Boolean(raw.childhoodGenerated),
      neighborhoodGenerated: Boolean(raw.neighborhoodGenerated),
      schoolGenerated: Boolean(raw.schoolGenerated),
      // keyed sets so multiple institutions/companies are tracked independently
      universities: raw.universities && typeof raw.universities === "object" ? { ...raw.universities } : {},
      workplaces: raw.workplaces && typeof raw.workplaces === "object" ? { ...raw.workplaces } : {},
      groups: Array.isArray(raw.groups) ? [...new Set(raw.groups)] : [],
    };
    return state.socialWorld;
  }

  function sw(state) {
    if (!state.socialWorld) normalizeSocialWorld(state);
    return state.socialWorld;
  }

  // ---- dedup helpers ------------------------------------------------------
  // True if the world already contains at least one NPC matching a context key.
  function hasNpcByContext(state, contextKey) {
    if (!contextKey) return false;
    const [kind, value] = String(contextKey).split(":");
    return (state.npcs || []).some((npc) => {
      if (!npc || !npc.alive) return false;
      if (kind === "school") return npc.schoolId && (!value || npc.schoolId === value);
      if (kind === "work") return npc.workplaceId && (!value || npc.workplaceId === value);
      if (kind === "context") return npc.metContext === value;
      if (kind === "relation") return npc.relationType === value;
      return false;
    });
  }

  // Run factoryFn() (returns an array of NPCs) at most once per groupKey, ever.
  function ensureNpcGroup(state, groupKey, factoryFn) {
    const flags = sw(state);
    if (flags.groups.includes(groupKey)) return [];
    flags.groups.push(groupKey);
    const created = [];
    (factoryFn() || []).forEach((npc) => {
      if (!npc) return;
      const added = R().addNpc(state, npc);
      if (added) created.push(added);
    });
    return created;
  }

  // Returns an existing NPC that looks like a duplicate (same person, same role
  // and context) so callers can reuse it instead of spawning another one.
  function avoidDuplicateNpc(state, npc) {
    if (!npc) return null;
    return (state.npcs || []).find((other) =>
      other &&
      other.alive &&
      other.id !== npc.id &&
      other.relationType === npc.relationType &&
      (other.metContext || "") === (npc.metContext || "") &&
      (other.name || "") === (npc.name || "") &&
      (other.lastName || "") === (npc.lastName || "")
    ) || null;
  }

  // ---- meeting memory -----------------------------------------------------
  function rememberMeeting(state, npc, info = {}) {
    if (!npc) return npc;
    if (info.context && !npc.metContext) npc.metContext = info.context;
    if (info.placeId && !npc.metAtPlaceId) npc.metAtPlaceId = info.placeId;
    if (npc.metYear == null) npc.metYear = info.year != null ? info.year : state.age || 0;
    if (info.placeId) P()?.attachNpc?.(state, info.placeId, npc.id);
    if (info.history) R()?.addNpcHistory?.(npc, info.history);
    return npc;
  }

  function getNpcContext(state, npc) {
    if (!npc) return null;
    const place = npc.metAtPlaceId ? P()?.findPlace?.(state, npc.metAtPlaceId) : null;
    return {
      context: npc.metContext || "",
      label: F()?.metContextLabel?.(npc.metContext) || "",
      year: npc.metYear,
      place: place || null,
      placeName: place ? place.name : "",
    };
  }

  // Add a freshly-built NPC into the world with meeting memory in one step.
  function induct(state, npc, info = {}) {
    if (!npc) return null;
    rememberMeeting(state, npc, info);
    return R().addNpc(state, npc);
  }

  // ---- circle builders ----------------------------------------------------
  // Family is created in createNewLife; this only stamps meeting memory on the
  // already-present relatives so their cards read "родился(ась) в семье".
  function ensureFamilyCircle(state) {
    const flags = sw(state);
    if (flags.familyGenerated) return [];
    (state.npcs || [])
      .filter((npc) => ["parent", "grandparent", "sibling"].includes(npc.relationType))
      .forEach((npc) => rememberMeeting(state, npc, { context: npc.relationType === "sibling" ? "family" : "family", year: 0 }));
    flags.familyGenerated = true;
    return [];
  }

  // 1-2 childhood contacts (kids the player grew up with). Once per life.
  function ensureChildhoodCircle(state) {
    const flags = sw(state);
    if (flags.childhoodGenerated) return [];
    flags.childhoodGenerated = true;
    const count = 1 + roll(2);
    return ensureNpcGroup(state, "childhood", () =>
      Array.from({ length: count }, () => {
        const npc = F().createFriendNpc(state, {
          age: Math.max(0, (state.age || 0) + roll(3) - 1),
          relationType: "friend",
          bond: 40 + roll(20),
          tags: ["childhood"],
        });
        rememberMeeting(state, npc, { context: "childhood", history: "Дружили с раннего детства." });
        return npc;
      })
    );
  }

  // Neighbours: a couple of people who live nearby. Anchored to the local
  // apartment building place. Once per life.
  function ensureNeighborhoodCircle(state) {
    const flags = sw(state);
    if (flags.neighborhoodGenerated) return [];
    flags.neighborhoodGenerated = true;
    const venue = P()?.ensureVenue?.(state, "apartment_building", {});
    const count = 1 + roll(2);
    return ensureNpcGroup(state, "neighborhood", () =>
      Array.from({ length: count }, () => {
        const npc = F().createAcquaintanceNpc(state, {
          age: Math.max(6, (state.age || 0) + roll(40) - 12),
          tags: ["neighbor"],
        });
        rememberMeeting(state, npc, { context: "neighborhood", placeId: venue?.id, history: "Соседи по дому." });
        return npc;
      })
    );
  }

  // School as a social environment: 4-8 classmates + 1-3 teachers, all tagged to
  // a concrete school place. Generated ONCE (state.socialWorld.schoolGenerated).
  function ensureSchoolCircle(state) {
    const flags = sw(state);
    if (flags.schoolGenerated) return [];
    if ((state.age || 0) < 7) return [];
    flags.schoolGenerated = true;
    const school = P()?.ensureVenue?.(state, "school", {});
    const schoolId = school?.id || null;
    const classmateCount = 4 + roll(5); // 4..8
    const teacherCount = 1 + roll(3); // 1..3
    return ensureNpcGroup(state, "school:" + (schoolId || "default"), () => {
      const people = [];
      for (let i = 0; i < classmateCount; i++) {
        const npc = F().createClassmateNpc(state, {
          age: Math.max(6, (state.age || 7) + roll(3) - 1),
          schoolId,
          education: { level: "school", institutionId: schoolId, specialtyId: null },
        });
        rememberMeeting(state, npc, { context: "school", placeId: schoolId, history: "Учились вместе в школе." });
        people.push(npc);
      }
      for (let i = 0; i < teacherCount; i++) {
        const npc = F().createTeacherNpc(state, {
          age: 30 + roll(28),
          schoolId,
        });
        rememberMeeting(state, npc, { context: "school", placeId: schoolId, history: "Школьный учитель." });
        people.push(npc);
      }
      return people;
    });
  }

  // Stamp meeting memory + context on an institution cohort that the education
  // engine already created (enroll() spawns classmates/teachers). Idempotent per
  // institution id.
  function ensureUniversityCircle(state, institutionId, contextKind) {
    const flags = sw(state);
    const id = institutionId || state.educationPath?.institutionId;
    if (!id || flags.universities[id]) return [];
    flags.universities[id] = true;
    const context = contextKind || (state.educationPath?.institutionType === "college" ? "college" : "university");
    const place = P()?.findPlace?.(state, id);
    (state.npcs || [])
      .filter((npc) => npc.schoolId === id && !npc.metContext && ["classmate", "teacher", "professor"].includes(npc.relationType))
      .forEach((npc) => rememberMeeting(state, npc, {
        context,
        placeId: place ? place.id : null,
        history: npc.relationType === "classmate" ? "Учимся вместе." : "Преподаватель.",
      }));
    return [];
  }

  // Stamp meeting memory + context on the workplace team the workplace engine
  // already created (onHire spawns boss/coworkers). Idempotent per company id.
  function ensureWorkCircle(state, companyId) {
    const flags = sw(state);
    const wId = state.workplace?.workplaceId || null;
    const id = companyId || state.workplace?.company?.id || wId;
    if (!id || flags.workplaces[id]) return [];
    flags.workplaces[id] = true;
    const place = wId ? P()?.findPlace?.(state, wId) : null;
    (state.npcs || [])
      .filter((npc) => npc.workplaceId && npc.workplaceId === wId && !npc.metContext && ["coworker", "boss"].includes(npc.relationType))
      .forEach((npc) => rememberMeeting(state, npc, {
        context: "work",
        placeId: place ? place.id : null,
        history: npc.relationType === "boss" ? "Мой руководитель." : "Работаем вместе.",
      }));
    return [];
  }

  // ---- on-demand people (social actions) ----------------------------------
  function createRandomFriend(state, input = {}) {
    const npc = F().createFriendNpc(state, input);
    return induct(state, npc, { context: input.metContext || "random_event", history: "Подружились." });
  }

  function createAcquaintance(state, input = {}) {
    const npc = F().createAcquaintanceNpc(state, input);
    return induct(state, npc, { context: input.metContext || "random_event", history: "Познакомились." });
  }

  function createDatingNpc(state, input = {}) {
    if ((state.age || 0) < 18) return null;
    const npc = F().createDateNpc(state, input);
    return induct(state, npc, { context: "dating", history: "Сходили на свидание." });
  }

  function createNightlifeEncounter(state, input = {}) {
    if ((state.age || 0) < 18) return null;
    const venue = input.placeId ? null : P()?.ensureVenue?.(state, input.venueType || "nightclub", {});
    const placeId = input.placeId || venue?.id || null;
    const type = input.relationType || "acquaintance";
    let npc;
    if (type === "date" || type === "hookup_18_plus") npc = F().createDateNpc(state, { relationType: type, tags: ["romance", "18+"] });
    else if (type === "friend") npc = F().createFriendNpc(state, {});
    else npc = F().createAcquaintanceNpc(state, {});
    return induct(state, npc, { context: "nightlife", placeId, history: "Познакомились в ночной жизни." });
  }

  // Services: reuse the existing permanent provider if there already is one.
  function ensureServiceNpc(state, relationType, factory, context, history) {
    const existing = (state.npcs || []).find((npc) => npc.alive && npc.relationType === relationType && npc.metContext === context);
    if (existing) return existing;
    const npc = factory(state, {});
    return induct(state, npc, { context, history });
  }

  function createDoctorNpc(state, input = {}) {
    const venue = P()?.ensureVenue?.(state, "clinic", {});
    const existing = (state.npcs || []).find((npc) => npc.alive && npc.relationType === "doctor");
    if (existing) return existing;
    const npc = F().createDoctorNpc(state, input);
    return induct(state, npc, { context: "clinic", placeId: venue?.id, history: "Лечащий врач." });
  }

  function createTherapistNpc(state, input = {}) {
    return ensureServiceNpc(state, "therapist", F().createTherapistNpc, "clinic", "Мой психолог.");
  }

  function createLawyerNpc(state, input = {}) {
    return ensureServiceNpc(state, "lawyer", F().createLawyerNpc, "legal", "Мой юрист.");
  }

  function createServiceNpc(state, relationType, input = {}) {
    const factory = {
      doctor: F().createDoctorNpc,
      therapist: F().createTherapistNpc,
      lawyer: F().createLawyerNpc,
      landlord: F().createLandlordNpc,
      police_officer: F().createPoliceNpc,
    }[relationType];
    if (!factory) return null;
    const npc = factory(state, input);
    return induct(state, npc, { context: input.metContext || "random_event", history: "Появился в жизни как контакт." });
  }

  // ---- data-action hook ---------------------------------------------------
  // Lets the catalog actions (data/actions/*) spawn concrete people without the
  // data files needing to know about the NPC engine. Best-effort, dedup-safe.
  const FRIEND_ACTIONS = new Set(["child_make_friend", "child_birthday_party", "child_chess_club", "child_sleepover", "teen_join_club", "adult_reconnect_old_friend"]);
  const DATING_ACTIONS = new Set(["adult_dating_app", "teen_first_date"]);
  const NIGHTLIFE_ACTIONS = new Set(["adult_nightclub", "teen_first_party"]);
  const THERAPY_ACTIONS = new Set(["adult_therapy"]);

  function onDataAction(state, action, info = {}) {
    if (!state || !action || info.failed) return null;
    const id = action.id;
    try {
      if (THERAPY_ACTIONS.has(id)) return createTherapistNpc(state, {});
      if (FRIEND_ACTIONS.has(id)) {
        if (Math.random() < 0.6) return createRandomFriend(state, { metContext: "random_event" });
        return null;
      }
      if (DATING_ACTIONS.has(id)) {
        if ((state.age || 0) >= 18) return Math.random() < 0.55 ? createDatingNpc(state, {}) : null;
        return Math.random() < 0.5 ? createAcquaintance(state, { metContext: "random_event" }) : null;
      }
      if (NIGHTLIFE_ACTIONS.has(id)) {
        if ((state.age || 0) >= 18) return createNightlifeEncounter(state, {});
        return Math.random() < 0.5 ? createAcquaintance(state, { metContext: "random_event" }) : null;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  // ---- yearly tick --------------------------------------------------------
  // Called from simulation.endYear after the player NPC is synced. Lazily fills
  // in age-appropriate circles; every builder is dedup-guarded so repeated ticks
  // never duplicate people.
  function tick(state) {
    if (!state || state.deceased) return;
    normalizeSocialWorld(state);
    ensureFamilyCircle(state);
    if ((state.age || 0) >= 4 && !sw(state).childhoodGenerated) ensureChildhoodCircle(state);
    if ((state.age || 0) >= 5 && !sw(state).neighborhoodGenerated) ensureNeighborhoodCircle(state);
    if ((state.age || 0) >= 7 && (state.age || 0) <= 18) ensureSchoolCircle(state);
    if (state.educationPath?.institutionId) ensureUniversityCircle(state);
    if (state.workplace?.active) ensureWorkCircle(state);
  }

  window.GameSocialWorld = {
    normalizeSocialWorld,
    hasNpcByContext,
    ensureNpcGroup,
    avoidDuplicateNpc,
    rememberMeeting,
    getNpcContext,
    ensureFamilyCircle,
    ensureChildhoodCircle,
    ensureNeighborhoodCircle,
    ensureSchoolCircle,
    ensureUniversityCircle,
    ensureWorkCircle,
    createRandomFriend,
    createAcquaintance,
    createDatingNpc,
    createNightlifeEncounter,
    createDoctorNpc,
    createTherapistNpc,
    createLawyerNpc,
    createServiceNpc,
    onDataAction,
    tick,
  };
})();
