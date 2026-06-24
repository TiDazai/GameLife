(() => {
  const { countries, professions, certificateCatalog, companySectors, skillCatalog, budgetModes, housingCatalog, possessionCatalog, characterCreation, socialClasses } = window.GameData;
  const { clamp } = window.GameRandom;
  const {
    state,
    fmt,
    ageText,
    stageName,
    cityData,
    cityName,
    countryName,
    player,
    livingParentCount,
    housingData,
    netWorth,
    canAct,
    spendAction,
    change,
    familyBond,
    notify,
    improveSkill,
    professionData,
    annualSalary,
    emergencyFundMonths,
    budgetModeData,
    creditLimit,
    borrow,
    personalCost,
    skillAverage,
    hasPossession,
    hasCertificate,
    socialClassData,
    getAppMode,
  } = window.GameState;
  const {
    getActions,
    chooseProfession,
    enroll,
    acquireCertificate,
    moveTo,
    leaveParents,
    supportParents,
    startRelationship,
    marry,
    haveChild,
    startCompany,
    companyAction,
    activityAction,
    careerMove,
    setBudgetMode,
    saveEmergencyFund,
    changeHousing,
    buyPossession,
    investAsset,
    withdrawAsset,
    assetName,
    relationshipAction,
    familyRelationshipAction,
    romanticAction,
    investInChild,
    acquireDocument,
    setInsurance,
    healthHabitAction,
    healthTreatment,
    legalAction,
  } = window.GameActions;

const els = {
  subtitle: document.getElementById("subtitle"),
  stats: document.getElementById("stats"),
  tabs: document.getElementById("tabs"),
  notice: document.getElementById("notice"),
  content: document.getElementById("content"),
  endYear: document.getElementById("endDayButton"),
  save: document.getElementById("saveButton"),
  load: document.getElementById("loadButton"),
  reset: document.getElementById("resetButton"),
  theme: document.getElementById("themeButton"),
  bottomNav: document.getElementById("bottomNav"),
};

const tabs = [
  ["life", "Жизнь"],
  ["activities", "Активности"],
  ["family", "Семья"],
  ["world", "Мир"],
  ["education", "Учеба"],
  ["career", "Карьера"],
  ["health", "Здоровье"],
  ["skills", "Навыки"],
  ["money", "Деньги"],
  ["home", "Дом"],
  ["assets", "Активы"],
  ["business", "Компания"],
  ["relationships", "Отношения"],
  ["docs", "Документы"],
  ["report", "Сводка"],
  ["achievements", "Достижения"],
];

const bottomTabs = [
  ["life", "Жизнь"],
  ["activities", "Действия"],
  ["relationships", "Отношения"],
  ["career", "Карьера"],
  ["money", "Деньги"],
  ["health", "Здоровье"],
  ["report", "Сводка"],
];

const themeKey = "gamelife-ui-theme";

function section(title, text) {
  const node = document.createElement("section");
  node.className = "section";
  const head = document.createElement("div");
  head.className = "section-head";
  const wrap = document.createElement("div");
  const h = document.createElement("h2");
  h.textContent = title;
  wrap.append(h);
  if (text) {
    const p = document.createElement("p");
    p.textContent = text;
    wrap.append(p);
  }
  head.append(wrap);
  node.append(head);
  return node;
}

function button(label, handler, options = {}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  if (options.className) btn.className = options.className;
  if (options.disabled) btn.disabled = true;
  btn.addEventListener("click", handler);
  return btn;
}

function visualKind(text = "") {
  const value = String(text).toLowerCase();
  if (state.deceased || value.includes("смерт") || value.includes("жизнь заверш")) return "death";
  if (value.includes("достижен") || value.includes("открыто")) return "achievement";
  if (value.includes("опас") || value.includes("судим") || value.includes("кримин") || value.includes("поймали")) return "danger";
  if (value.includes("риск") || value.includes("штраф") || value.includes("долг") || value.includes("стресс")) return "risk";
  if (value.includes("событ") || value.includes("родил") || value.includes("получен") || value.includes("наслед")) return "important";
  if (value.includes("улучш") || value.includes("помог") || value.includes("успеш") || value.includes("оплачен")) return "success";
  return "";
}

function applyVisualState(node, text) {
  const kind = visualKind(text);
  if (kind) node.classList.add(`is-${kind}`);
  return node;
}

function card(title, text, meta, actionButton) {
  const node = document.createElement("article");
  node.className = "card";
  applyVisualState(node, `${title} ${text || ""} ${meta || ""}`);
  const h = document.createElement("h3");
  h.textContent = title;
  const m = document.createElement("div");
  m.className = "mini";
  m.textContent = meta;
  node.append(h);
  if (meta) node.append(m);
  if (actionButton) node.append(actionButton);
  return node;
}

function field(label, control) {
  const wrap = document.createElement("label");
  wrap.className = "form-field";
  const text = document.createElement("span");
  text.textContent = label;
  wrap.append(text, control);
  return wrap;
}

function textInput(id, placeholder = "") {
  const input = document.createElement("input");
  input.id = id;
  input.type = "text";
  input.placeholder = placeholder;
  input.autocomplete = "off";
  return input;
}

function selectInput(id, entries) {
  const select = document.createElement("select");
  select.id = id;
  entries.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
  return select;
}

function renderCreator() {
  const root = document.createDocumentFragment();
  const intro = section("Создание персонажа", "");
  const profileGrid = document.createElement("div");
  profileGrid.className = "creator-grid";

  const firstName = textInput("creatorFirstName", "Например: Анна");
  const lastName = textInput("creatorLastName", "Например: Соколова");
  const gender = selectInput("creatorGender", Object.entries(characterCreation.genders));

  const regionNames = {};
  Object.values(countries).forEach((item) => {
    if (item.region) regionNames[item.region] = item.region;
  });
  const regionEntries = [["all", "Все регионы"], ...Object.keys(regionNames).sort().map((r) => [r, r])];
  const region = selectInput("creatorRegion", regionEntries);

  const countryEntriesFor = (regionId) =>
    Object.entries(countries)
      .filter(([, item]) => regionId === "all" || item.region === regionId)
      .map(([id, item]) => [id, item.name]);

  const country = selectInput("creatorCountry", countryEntriesFor("all"));
  const city = selectInput(
    "creatorCity",
    Object.entries(countries[country.value].cities).map(([id, item]) => [id, item.name])
  );

  const fillCities = () => {
    city.replaceChildren(
      ...Object.entries(countries[country.value].cities).map(([id, item]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = item.name;
        return option;
      })
    );
  };

  region.addEventListener("change", () => {
    country.replaceChildren(
      ...countryEntriesFor(region.value).map(([id, name]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        return option;
      })
    );
    fillCities();
  });
  country.addEventListener("change", fillCities);

  profileGrid.append(
    field("Имя", firstName),
    field("Фамилия", lastName),
    field("Пол", gender),
    field("Регион", region),
    field("Страна", country),
    field("Город", city)
  );
  intro.append(profileGrid);
  root.append(intro);

  const goalSection = section("Цель жизни", "Выберите главную мечту персонажа — она задаёт вехи и влияет на итоговую оценку.");
  const goalCatalog = window.GameLifeGoals?.catalog?.() || [];
  const goalEntries = [["random", "Случайная цель"], ...goalCatalog.map((g) => [g.id, g.title])];
  const goal = selectInput("creatorGoal", goalEntries);
  goalSection.append(field("Цель", goal));
  root.append(goalSection);

  const origin = section("Семья и среда", "");
  const classGrid = document.createElement("div");
  classGrid.className = "grid";
  Object.entries(socialClasses).forEach(([id, item]) => {
    const label = document.createElement("label");
    label.className = "choice-card";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "creatorSocialClass";
    radio.value = id;
    radio.checked = id === characterCreation.defaultSocialClass;
    const title = document.createElement("strong");
    title.textContent = item.name;
    const text = document.createElement("span");
    text.textContent = item.text;
    const meta = document.createElement("small");
    meta.textContent = `Бюджет ${fmt(item.familyMoney)}, район ${item.districtQuality}/100, образование ${item.educationAccess}/100`;
    label.append(radio, title, text, meta);
    classGrid.append(label);
  });
  origin.append(classGrid);
  root.append(origin);

  const traits = section("Черты характера", "");
  const traitGrid = document.createElement("div");
  traitGrid.className = "creator-grid";
  Object.entries(characterCreation.traitRanges).forEach(([id, config]) => {
    const input = document.createElement("input");
    input.id = `creatorTrait-${id}`;
    input.type = "range";
    input.min = config.min;
    input.max = config.max;
    input.value = 50;
    const value = document.createElement("output");
    value.value = input.value;
    input.addEventListener("input", () => {
      value.value = input.value;
    });
    const wrap = document.createElement("label");
    wrap.className = "form-field trait-field";
    const top = document.createElement("span");
    top.textContent = config.name;
    wrap.append(top, input, value);
    traitGrid.append(wrap);
  });
  traits.append(traitGrid);
  root.append(traits);

  const actions = section("Старт", "");
  const buttons = document.createElement("div");
  buttons.className = "button-grid";
  buttons.append(
    button("Начать жизнь", () => {
      window.GameStorage.startGame(collectCreatorOptions());
    }, { className: "primary" }),
    button("Случайная жизнь", () => {
      window.GameStorage.startRandomGame();
    }, { className: "money" })
  );
  actions.append(buttons);
  root.append(actions);
  return root;
}

function collectCreatorOptions() {
  const selectedClass = document.querySelector('input[name="creatorSocialClass"]:checked');
  const traits = {};
  Object.keys(characterCreation.traitRanges).forEach((id) => {
    traits[id] = Number(document.getElementById(`creatorTrait-${id}`).value);
  });
  return {
    firstName: document.getElementById("creatorFirstName").value,
    lastName: document.getElementById("creatorLastName").value,
    gender: document.getElementById("creatorGender").value,
    country: document.getElementById("creatorCountry").value,
    city: document.getElementById("creatorCity").value,
    socialClass: selectedClass?.value || characterCreation.defaultSocialClass,
    lifeGoal: (() => {
      const value = document.getElementById("creatorGoal")?.value;
      return value && value !== "random" ? value : undefined;
    })(),
    traits,
  };
}

function renderActionGrid(actions) {
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const item of actions) {
    grid.append(
      card(item.title, "", item.meta, button(item.disabled ? "Недоступно" : item.button, item.run, {
        disabled: item.disabled,
        className: item.disabled ? "" : "primary",
      }))
    );
  }
  return grid;
}

function renderStats() {
  const allStats = [
    ["Возраст", ageText(state.age)],
    ["Этап", stageName()],
    ["Усталость", `${state.actionFatigue || 0}%`],
    ["Действий за год", state.yearlyActionCount || 0],
    ["Личные деньги", fmt(state.personalMoney)],
    ["Бюджет семьи", fmt(state.familyMoney)],
    ["Долг", fmt(state.debt)],
    ["Здоровье", `${state.health}%`],
    ["Психика", `${state.mental}%`],
    ["Энергия", `${state.energy}%`],
    ["Счастье", `${state.happiness}%`],
    ["Внешность", `${state.looks}%`],
    ["Известность", `${state.fame}%`],
    ["Знания", state.knowledge],
    ["Общение", state.social],
    ["Портфолио", state.portfolio],
    ["Связи", state.network],
    ["Кредит", state.creditScore],
    ["Карма", state.karma],
    ["Судимость", state.criminalRecord],
    ["Стресс", `${state.stress}%`],
    ["Город", cityName()],
    ["Семья", socialClassData().name],
    ["Район", `${state.districtQuality}/100`],
    ["Образование", `${state.educationAccess}/100`],
    ["Дом", housingData().name],
    ["Капитал", fmt(netWorth())],
    ["Налоговый долг", fmt(state.taxDebt)],
  ];
  const mobilePriority = new Set(["Возраст", "Усталость", "Личные деньги", "Долг", "Здоровье", "Психика", "Счастье", "Стресс", "Капитал"]);
  const stats = allStats.map((item) => [...item, mobilePriority.has(item[0])]);
  els.stats.replaceChildren(
    ...stats.map(([label, value, priority]) => {
      const node = document.createElement("article");
      node.className = `stat${priority ? " priority" : ""}`;
      applyVisualState(node, `${label} ${value}`);
      node.innerHTML = `<div class="stat-label"></div><div class="stat-value"></div>`;
      node.querySelector(".stat-label").textContent = label;
      node.querySelector(".stat-value").textContent = value;
      return node;
    })
  );
}

function renderTabs() {
  els.tabs.replaceChildren(
    ...tabs.map(([id, label]) => {
      const btn = button(label, () => {
        state.tab = id;
        render();
      });
      const bottom = bottomTabs.some(([bottomId]) => bottomId === id);
      btn.className = `tab${state.tab === id ? " active" : ""}${bottom ? " mobile-primary" : " secondary-tab"}`;
      return btn;
    })
  );
  els.bottomNav.replaceChildren(
    ...bottomTabs.map(([id, label]) => {
      const btn = button(label, () => {
        state.tab = id;
        render();
      });
      btn.className = `bottom-tab${state.tab === id ? " active" : ""}`;
      return btn;
    })
  );
}

function currentTheme() {
  // Dark is the primary theme; light is an explicit opt-in.
  try {
    return localStorage.getItem(themeKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyTheme(theme = currentTheme()) {
  document.body.dataset.theme = theme;
  if (els.theme) {
    els.theme.textContent = theme === "dark" ? "Светлая" : "Тёмная";
    els.theme.setAttribute("aria-pressed", String(theme === "dark"));
  }
}

// ---- Reusable premium UI building blocks ---------------------------------

function sectionHeader(title, text) {
  // Backwards-compatible alias of section(): returns a <section.section> shell.
  return section(title, text);
}

function badge(label, kind = "") {
  const node = document.createElement("span");
  node.className = `badge${kind ? ` is-${kind}` : ""}`;
  node.textContent = label;
  return node;
}

function badgeRow(badges = []) {
  const wrap = document.createElement("div");
  wrap.className = "badge-row";
  badges.forEach(([label, kind]) => wrap.append(badge(label, kind)));
  return wrap;
}

function statusPill(label, kind = "") {
  const node = document.createElement("span");
  node.className = `status-pill${kind ? ` is-${kind}` : ""}`;
  node.textContent = label;
  return node;
}

function progressBar(label, value, max = 100, options = {}) {
  const pct = clamp(Math.round((Number(value) / max) * 100), 0, 100);
  const node = document.createElement("div");
  node.className = `progress${options.tone ? ` tone-${options.tone}` : ""}`;
  const head = document.createElement("div");
  head.className = "progress-head";
  const l = document.createElement("span");
  l.className = "ph-label";
  l.textContent = label;
  const v = document.createElement("span");
  v.className = "ph-value";
  v.textContent = options.valueText || `${Math.round(Number(value))}${options.suffix ?? `/${max}`}`;
  head.append(l, v);
  const track = document.createElement("div");
  track.className = "progress-track";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.setProperty("--value", `${pct}%`);
  track.append(fill);
  node.append(head, track);
  return node;
}

// CSS-only stacked structure bar. segments: [{ label, value, tone }].
function stackedBar(segments = [], options = {}) {
  const items = segments.filter((s) => Number(s.value) > 0);
  const total = items.reduce((sum, s) => sum + Number(s.value), 0) || 1;
  const node = document.createElement("div");
  node.className = "stack-bar-block";
  const bar = document.createElement("div");
  bar.className = "stack-bar";
  items.forEach((s) => {
    const seg = document.createElement("div");
    seg.className = `stack-seg${s.tone ? ` tone-${s.tone}` : ""}`;
    seg.style.setProperty("--w", `${(Number(s.value) / total) * 100}%`);
    seg.title = `${s.label}: ${s.format ? s.format(s.value) : s.value}`;
    bar.append(seg);
  });
  if (!items.length) {
    const seg = document.createElement("div");
    seg.className = "stack-seg tone-muted";
    seg.style.setProperty("--w", "100%");
    bar.append(seg);
  }
  const legend = document.createElement("div");
  legend.className = "stack-legend";
  (items.length ? items : segments).forEach((s) => {
    const item = document.createElement("span");
    item.className = "stack-legend-item";
    const dot = document.createElement("i");
    dot.className = `stack-dot${s.tone ? ` tone-${s.tone}` : ""}`;
    const text = document.createElement("span");
    text.textContent = `${s.label}: ${s.format ? s.format(s.value) : s.value}`;
    item.append(dot, text);
    legend.append(item);
  });
  node.append(bar, legend);
  return node;
}

function statCard(label, value, options = {}) {
  const node = document.createElement("article");
  node.className = `stat-card${options.accent ? ` accent-${options.accent}` : ""}`;
  const top = document.createElement("div");
  top.className = "sc-top";
  const l = document.createElement("div");
  l.className = "sc-label";
  l.textContent = label;
  top.append(l);
  if (options.icon) {
    const icon = document.createElement("div");
    icon.className = "sc-icon";
    icon.textContent = options.icon;
    top.append(icon);
  }
  const v = document.createElement("div");
  v.className = "sc-value";
  v.textContent = value;
  node.append(top, v);
  if (options.sub) {
    const sub = document.createElement("div");
    sub.className = "sc-sub";
    sub.textContent = options.sub;
    node.append(sub);
  }
  return node;
}

function emptyState(title, text, icon = "✦") {
  const node = document.createElement("div");
  node.className = "empty-state";
  const i = document.createElement("div");
  i.className = "es-icon";
  i.textContent = icon;
  const t = document.createElement("div");
  t.className = "es-title";
  t.textContent = title;
  node.append(i, t);
  if (text) {
    const p = document.createElement("div");
    p.className = "mini";
    p.textContent = text;
    node.append(p);
  }
  return node;
}

function filterChips(entries, activeId, onPick) {
  const wrap = document.createElement("div");
  wrap.className = "chips";
  entries.forEach(([id, label]) => {
    const chip = button(label, () => onPick(id));
    chip.className = `chip${activeId === id ? " active" : ""}`;
    wrap.append(chip);
  });
  return wrap;
}

function personCard(name, role, lines = [], actionNode, options = {}) {
  const node = document.createElement("article");
  node.className = "person-card";
  const top = document.createElement("div");
  top.className = "pc-top";
  const avatar = document.createElement("div");
  avatar.className = `avatar${options.tone ? ` tone-${options.tone}` : ""}`;
  avatar.textContent = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const id = document.createElement("div");
  const nm = document.createElement("div");
  nm.className = "person-name";
  nm.textContent = name;
  const rl = document.createElement("div");
  rl.className = "person-role";
  rl.textContent = role;
  id.append(nm, rl);
  top.append(avatar, id);
  node.append(top);
  lines.filter(Boolean).forEach((line) => {
    const d = document.createElement("div");
    d.className = "person-details";
    d.textContent = line;
    node.append(d);
  });
  if (actionNode) node.append(actionNode);
  return node;
}

function modalCard(title, text) {
  const node = section(title, text);
  node.classList.add("event-modal");
  return node;
}

function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(themeKey, next);
  } catch {
    // localStorage can be unavailable in some embedded contexts.
  }
  applyTheme(next);
}

els.theme?.addEventListener("click", toggleTheme);
applyTheme();

function renderEvent() {
  if (!state.event) return document.createDocumentFragment();
  const overlay = document.createElement("div");
  overlay.className = "event-overlay";
  const node = section(state.event.title, state.event.description || state.event.text);
  node.classList.add("event-modal");
  applyVisualState(node, `${state.event.title} ${state.event.description || state.event.text}`);
  const tone = visualKind(`${state.event.title} ${state.event.description || state.event.text}`);
  if (tone) node.append(badgeRow([[tone === "danger" ? "опасно" : tone === "risk" ? "риск" : tone === "success" ? "удача" : "событие", tone === "success" ? "success" : tone === "risk" ? "risk" : tone === "danger" ? "danger" : "important"]]));
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const option of state.event.options) {
    const choice = document.createElement("article");
    choice.className = "card";
    applyVisualState(choice, `${option.label} ${option.description || ""}`);
    const h = document.createElement("h3");
    h.textContent = option.label;
    choice.append(h);
    if (option.description) {
      const p = document.createElement("p");
      p.textContent = option.description;
      choice.append(p);
    }
    choice.append(button("Выбрать", () => {
      window.GameEvents.chooseEventOption(state.event.id, option.id);
    }, { className: "primary" }));
    grid.append(choice);
  }
  node.append(grid);
  overlay.append(node);
  return overlay;
}

function appendTimelineEntry(container, entry) {
  const item = document.createElement("div");
  item.className = "timeline-entry";
  applyVisualState(item, entry);
  const age = document.createElement("div");
  age.className = "timeline-age";
  const text = document.createElement("div");
  text.className = "timeline-text";
  const match = String(entry).match(/^([^:]+):\s*(.*)$/);
  age.textContent = match ? match[1] : "Событие";
  text.textContent = match ? match[2] : entry;
  item.append(age, text);
  container.append(item);
}

function lifeStatusPills() {
  const pills = [];
  const partner = window.GameRelationshipEngine?.activePartner?.(state);
  if (state.health >= 75) pills.push(["Здоров", "good"]);
  else if (state.health < 40) pills.push(["Слабое здоровье", "danger"]);
  if ((state.actionFatigue || 0) >= 60) pills.push(["Устал", "risk"]);
  if (state.stress >= 65) pills.push(["В стрессе", "risk"]);
  if (state.happiness >= 75) pills.push(["Счастлив", "good"]);
  if (partner) pills.push([state.relationship?.married ? "В браке" : "Влюблён", "romance"]);
  if (state.debt > 0) pills.push(["В долгах", "danger"]);
  if (state.career?.jobId && (state.career?.burnout || 0) < 40) pills.push(["Карьерный рост", "money"]);
  if (!pills.length) pills.push(["Спокойная жизнь", ""]);
  return pills.slice(0, 6);
}

function renderLifeHero() {
  const hero = document.createElement("section");
  hero.className = "hero";
  const top = document.createElement("div");
  top.className = "hero-top";
  const avatar = document.createElement("div");
  avatar.className = "hero-avatar";
  avatar.textContent = (state.firstName || "?").charAt(0).toUpperCase();
  const id = document.createElement("div");
  id.className = "hero-id";
  const name = document.createElement("div");
  name.className = "hero-name";
  name.textContent = `${state.firstName} ${state.lastName}`.trim() || "Без имени";
  const meta = document.createElement("div");
  meta.className = "hero-meta";
  const goal = window.GameLifeGoals?.describe?.(state);
  meta.textContent = [
    ageText(state.age),
    `${cityName()}, ${countryName()}`,
    stageName(),
    socialClassData().name,
    goal ? `Цель: ${goal.title}` : null,
  ].filter(Boolean).join(" · ");
  id.append(name, meta);
  top.append(avatar, id);
  hero.append(top);

  const status = document.createElement("div");
  status.className = "hero-status";
  lifeStatusPills().forEach(([label, kind]) => status.append(statusPill(label, kind)));
  hero.append(status);
  return hero;
}

function renderLifeDashboard() {
  const node = section("Главное", "Состояние жизни одним взглядом.");
  const grid = document.createElement("div");
  grid.className = "grid stat-grid";
  grid.append(
    statCard("Капитал", fmt(netWorth()), { icon: "₿", accent: "money", sub: `Наличные ${fmt(state.personalMoney)}` }),
    statCard("Здоровье", `${state.health}%`, { icon: "✚", accent: state.health < 40 ? "bad" : "health", sub: `Психика ${state.mental}%` }),
    statCard("Счастье", `${state.happiness}%`, { icon: "☺", sub: `Стресс ${state.stress}%` }),
    statCard("Карьера", state.career?.jobId ? `ур. ${state.careerLevel}` : "нет работы", { icon: "▲", accent: "career", sub: `Доход ${fmt(annualSalary())}` }),
  );
  node.append(grid);

  const bars = document.createElement("div");
  bars.className = "content";
  bars.append(
    progressBar("Здоровье", state.health, 100, { tone: "health" }),
    progressBar("Энергия", state.energy, 100, { tone: "good" }),
    progressBar("Стресс", state.stress, 100, { tone: state.stress >= 60 ? "bad" : "warn" }),
    progressBar("Усталость года", state.actionFatigue || 0, 100, { tone: "warn" }),
  );
  const goal = window.GameLifeGoals?.describe?.(state);
  if (goal) bars.append(progressBar(`Цель: ${goal.title}`, goal.progress, 100, { tone: "romance", suffix: "%" }));
  node.append(bars);
  return node;
}

function renderLife() {
  const root = document.createDocumentFragment();
  root.append(renderLifeHero());
  root.append(renderLifeDashboard());
  const cc = characterCreation || {};
  const talentNames = (state.talents || []).map((id) => (cc.talents || []).find((t) => t.id === id)?.name).filter(Boolean);
  const weaknessNames = (state.weaknesses || []).map((id) => (cc.weaknesses || []).find((w) => w.id === id)?.name).filter(Boolean);
  const personalityNames = (state.personalityTraits || []).map((id) => (cc.personalityTraits || []).find((p) => p.id === id)?.name).filter(Boolean);
  if (talentNames.length || weaknessNames.length || personalityNames.length) {
    const traitsSection = section("Характер", "");
    const traitsLine = document.createElement("div");
    traitsLine.className = "tagline";
    [
      talentNames.length ? `Таланты: ${talentNames.join(", ")}` : null,
      weaknessNames.length ? `Слабости: ${weaknessNames.join(", ")}` : null,
      personalityNames.length ? `Характер: ${personalityNames.join(", ")}` : null,
    ].filter(Boolean).forEach((text) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = text;
      traitsLine.append(tag);
    });
    traitsSection.append(traitsLine);
    root.append(traitsSection);
  }

  const timeline = section("Жизненный этап", "Доступные решения зависят от возраста, семьи, города, здоровья и накопленных навыков.");
  const line = document.createElement("div");
  line.className = "timeline";
  [
    ["0-2", "Младенец"],
    ["3-6", "Дошкольник"],
    ["7-13", "Школа"],
    ["14-17", "Подросток"],
    ["18-24", "Старт"],
    ["25+", "Взрослая жизнь"],
  ].forEach(([years, label]) => {
    const step = document.createElement("div");
    const active =
      (label === "Младенец" && state.age < 3) ||
      (label === "Дошкольник" && state.age >= 3 && state.age < 7) ||
      (label === "Школа" && state.age >= 7 && state.age < 14) ||
      (label === "Подросток" && state.age >= 14 && state.age < 18) ||
      (label === "Старт" && state.age >= 18 && state.age < 25) ||
      (label === "Взрослая жизнь" && state.age >= 25);
    step.className = `life-step${active ? " active" : ""}`;
    step.innerHTML = `<strong></strong><span></span>`;
    step.querySelector("strong").textContent = years;
    step.querySelector("span").textContent = label;
    line.append(step);
  });
  timeline.append(line);
  root.append(timeline);

  const goalNode = renderLifeGoal();
  if (goalNode) root.append(goalNode);
  const worldNode = renderWorldEvents();
  if (worldNode) root.append(worldNode);
  const arcsNode = renderStoryArcs();
  if (arcsNode) root.append(arcsNode);

  const actions = section("Решения года", "Никаких полей ввода: каждое действие выбирается кнопкой.");
  actions.append(renderActionGrid(getActions()));
  root.append(actions);
  return root;
}

let actionCategoryFilter = "all";

const ACTION_CATEGORY_LABELS = {
  all: "Все",
  education: "Учёба",
  career: "Карьера",
  money: "Деньги",
  health: "Здоровье",
  social: "Общение",
  lifestyle: "Образ жизни",
  family: "Семья",
  risk: "Риск",
  creative: "Творчество",
  civic: "Общество",
  other: "Прочее",
};

function actionBadges(action) {
  const badges = [];
  if (action.adultOnly) badges.push(["18+", "adult"]);
  if (action.risk) badges.push(["риск", "risk"]);
  if (action.cost?.money) badges.push(["платно", "money"]);
  if (action.category === "family" || action.category === "social") badges.push(["отношения", "success"]);
  if (action.category === "health") badges.push(["здоровье", "success"]);
  if (action.category === "career") badges.push(["карьера", "important"]);
  if ((action.countryTags || []).length) badges.push(["страна", ""]);
  return badges;
}

function renderFatigueBar() {
  const info = window.GameActionLoad?.fatigueLabel?.(state) || { text: "", kind: "" };
  const node = section("Энергия года", "Действий в году без ограничений — но усталость накапливается и влияет на эффективность и здоровье.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Состояние: ${info.text}`,
    `Усталость: ${state.actionFatigue || 0}/100`,
    `Действий за год: ${state.yearlyActionCount || 0}`,
    `Нагрузка: ${state.yearlyActivityLoad || 0}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    applyVisualState(tag, info.kind === "danger" ? "опасно" : info.kind === "risk" ? "риск" : "");
    tag.textContent = text;
    tags.append(tag);
  });
  node.append(tags);
  return node;
}

let actionSearchQuery = "";
let actionShowAll = false;
const ACTION_PAGE = 24;

function renderDataActions() {
  const engine = window.GameActionEngine;
  const node = section("Центр действий", "Большой каталог решений. Чем чаще повторяете похожее за год — тем слабее эффект.");
  if (!engine) {
    node.append(emptyState("Каталог недоступен", "Движок действий не загрузился."));
    return node;
  }
  const cats = engine.categories(state);
  const available = new Set(cats.map((c) => c.id));
  if (actionCategoryFilter !== "all" && !available.has(actionCategoryFilter)) actionCategoryFilter = "all";

  const chipEntries = [["all", `${ACTION_CATEGORY_LABELS.all} (${cats.reduce((s, c) => s + c.count, 0)})`]];
  cats.forEach((c) => chipEntries.push([c.id, `${ACTION_CATEGORY_LABELS[c.id] || c.id} (${c.count})`]));
  node.append(filterChips(chipEntries, actionCategoryFilter, (id) => {
    actionCategoryFilter = id;
    actionShowAll = false;
    render();
  }));

  const search = textInput("actionSearch", "Поиск действия по названию");
  search.value = actionSearchQuery;
  node.append(field("Поиск", search));

  const grid = document.createElement("div");
  grid.className = "grid";
  const footer = document.createElement("div");

  const buildGrid = () => {
    grid.replaceChildren();
    footer.replaceChildren();
    const query = actionSearchQuery.trim().toLowerCase();
    let list = engine.getAvailableActions(state, actionCategoryFilter === "all" ? {} : { category: actionCategoryFilter });
    if (query) {
      list = list.filter((a) => (a.title || "").toLowerCase().includes(query) || (a.description || "").toLowerCase().includes(query));
    }
    if (!list.length) {
      grid.append(emptyState("Пусто", "Нет доступных действий по этому фильтру. Попробуйте другую категорию или возраст."));
      return;
    }
    const limit = actionShowAll ? list.length : ACTION_PAGE;
    list.slice(0, limit).forEach((action) => {
      const canDo = engine.canPerform(state, action);
      const adapt = window.GameActionLoad?.adaptActionForAge?.(state, action) || {};
      const moneyMeta = action.cost?.money ? `${fmt(action.cost.money)} · ` : "";
      let reason = "";
      if (!canDo) {
        if (action.cost?.money && (state.personalMoney || 0) < action.cost.money) reason = `Нужно ${fmt(action.cost.money)}.`;
        else reason = adapt.reason || "Сейчас недоступно.";
      } else if (adapt.adapted) {
        reason = adapt.reason || "";
      }
      const node2 = card(action.title, "", `${moneyMeta}${action.description || ""}`, button(canDo ? "Сделать" : "Недоступно", () => {
        window.GameActionEngine.performAction(state, action.id);
        render();
      }, { disabled: !canDo, className: canDo ? "primary" : "" }));
      const badges = actionBadges(action);
      if (adapt.adapted) badges.unshift(["детская версия", "important"]);
      if (badges.length) node2.append(badgeRow(badges));
      if (reason) {
        const r = document.createElement("div");
        r.className = "mini";
        r.textContent = reason;
        node2.append(r);
      }
      grid.append(node2);
    });
    if (!actionShowAll && list.length > ACTION_PAGE) {
      footer.append(button(`Показать ещё (${list.length - ACTION_PAGE})`, () => {
        actionShowAll = true;
        buildGrid();
      }, { className: "wide" }));
    }
  };

  search.addEventListener("input", () => {
    actionSearchQuery = search.value;
    actionShowAll = false;
    buildGrid();
  });
  buildGrid();
  node.append(grid, footer);
  return node;
}

function renderLifeGoal() {
  const goal = window.GameLifeGoals?.describe?.(state);
  if (!goal) return null;
  const node = section("Цель жизни", goal.description);
  const head = document.createElement("div");
  head.className = "tagline";
  const t = document.createElement("span");
  t.className = "tag";
  applyVisualState(t, goal.completed ? "успешно" : "");
  t.textContent = `${goal.title} — ${goal.progress}%${goal.completed ? " (выполнено!)" : ""}`;
  head.append(t);
  node.append(head);
  const list = document.createElement("div");
  list.className = "timeline";
  goal.milestones.forEach((m) => {
    const step = document.createElement("div");
    step.className = `life-step${m.done ? " active" : ""}`;
    step.innerHTML = `<strong></strong><span></span>`;
    step.querySelector("strong").textContent = m.done ? "✓" : "•";
    step.querySelector("span").textContent = m.text;
    list.append(step);
  });
  node.append(list);
  return node;
}

function renderWorldEvents() {
  const events = window.GameWorldEvents?.describe?.(state) || [];
  if (!events.length) return null;
  const node = section("События мира", "Глобальные события влияют на зарплаты, цены и возможности.");
  const grid = document.createElement("div");
  grid.className = "grid";
  events.forEach((we) => {
    grid.append(card(we.title, "", `${we.description} (осталось лет: ${we.remaining})`, null));
  });
  node.append(grid);
  return node;
}

function renderStoryArcs() {
  const arcs = (window.GameStoryArcs?.describe?.(state) || []).filter((a) => a.status === "active");
  if (!arcs.length) return null;
  const node = section("Сюжетные линии", "Длинные истории вашей жизни развиваются год за годом.");
  const grid = document.createElement("div");
  grid.className = "grid";
  arcs.forEach((arc) => {
    grid.append(card(arc.title, "", arc.stepText, null));
  });
  node.append(grid);
  return node;
}

function renderActivities() {
  const root = document.createDocumentFragment();
  root.append(renderFatigueBar());
  root.append(renderDataActions());
  const s = section("Активности", "");
  const grid = document.createElement("div");
  grid.className = "grid";
  const vacationCost = Math.floor(900 * cityData().cost);
  const styleCost = Math.floor(380 * cityData().cost);
  const lawyerCost = Math.floor((900 + Math.max(state.criminalRecord, state.activeCases?.[0]?.severity || 0) * 450) * cityData().cost);
  grid.append(
    activityCard("Игрушки", "Счастье +4, моторика", "toys", !canAct() || state.age >= 3),
    activityCard("Объятия", "Связь с семьей +3", "hug", !canAct() || state.age >= 7),
    activityCard("Прогулка", "Здоровье +2, счастье +3", "walk", !canAct() || state.age < 3),
    activityCard("Книга", "Знания +5, стресс -1", "book", !canAct() || state.age < 5),
    activityCard("Спортзал", "Здоровье +5, внешность +2", "gym", !canAct() || state.age < 12),
    activityCard("Медитация", "Психика +7, карма +2", "meditate", !canAct() || state.age < 10),
    activityCard("Волонтерство", "Карма +6, репутация +2", "volunteer", !canAct() || state.age < 12),
    activityCard("Соцсети", "Известность, связи", "social", !canAct() || state.age < 12),
    activityCard("Стиль", `${fmt(styleCost)}, внешность +6`, "style", !canAct() || state.age < 14 || state.personalMoney < styleCost),
    activityCard("Отпуск", `${fmt(vacationCost)}, счастье +12`, "vacation", !canAct() || state.age < 18 || state.personalMoney < vacationCost),
    activityCard("Лотерея", `${fmt(80)}, шанс выигрыша`, "lottery", state.age < 18 || state.personalMoney < 80 || state.event),
    activityCard("Азартная игра", `${fmt(180)}, риск`, "gamble", state.age < 18 || state.personalMoney < 180 || state.event),
    activityCard("Мелкая кража", "Риск судимости", "theft", !canAct() || state.age < 14),
    activityCard("Интервью", "Известность +5, деньги", "interview", !canAct() || state.fame < 15),
    activityCard("Реклама", "Доход от известности", "ad", !canAct() || state.fame < 25),
    activityCard("Адвокат", `${fmt(lawyerCost)}, смягчить дело или след`, "lawyer", !canAct() || ((state.criminalRecord < 1) && !(state.activeCases || []).length) || state.personalMoney < lawyerCost),
    activityCard("Извиниться", "Карма +4, стресс -3", "apologize", !canAct() || state.age < 7 || state.karma > 80)
  );
  s.append(grid);
  root.append(s);

  const status = section("Статус", "");
  const statusTags = document.createElement("div");
  statusTags.className = "tagline";
  [`Статус: ${window.GameData.legalStatuses?.[state.legalStatus]?.name || state.legalStatus}`, `Штрафы: ${(state.fines || []).filter((fine) => !fine.paid).length}`, `Судимость: ${state.criminalRecord}`, `Кредит: ${state.creditScore}/100`, `Резерв: ${emergencyFundMonths()} мес.`, `Связи: ${state.network}/100`, `Репутация: ${state.reputation}/100`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    statusTags.append(tag);
  });
  status.append(statusTags);
  root.append(status);
  return root;
}

function activityCard(title, meta, type, disabled) {
  return card(title, "", meta, button(disabled ? "Недоступно" : "Сделать", () => activityAction(type), {
    disabled,
    className: disabled ? "" : "primary",
  }));
}


function renderFamily() {
  const root = document.createDocumentFragment();
  const s = section("Семейное дерево", "Поколения связаны в единую схему: старшие, родители, вы с партнером и дети.");
  const tree = document.createElement("div");
  tree.className = "family-tree";
  const npcs = window.GameRelationshipEngine?.list?.(state) || [];
  tree.append(generation("Старшее поколение", npcs.filter((p) => p.relationType === "grandparent"), "elders"));
  tree.append(generation("Родители", npcs.filter((p) => p.relationType === "parent"), "parents"));
  tree.append(generation("Вы и пара", npcs.filter((p) => ["self", "partner", "spouse", "ex_partner"].includes(p.relationType)), "self"));
  tree.append(generation("Дети", npcs.filter((p) => p.relationType === "child"), "children"));
  tree.append(generation("Социальный круг", npcs.filter((p) => ["sibling", "friend", "best_friend", "coworker", "mentor", "enemy", "acquaintance"].includes(p.relationType)), "circle"));
  s.append(tree);
  root.append(s);

  const actions = section("Семейные действия", "Помощь семье, сепарация и забота о родителях влияют на экономику и связи.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const motherAction = state.age < 3 ? ["Быть рядом с мамой", "Ранняя привязанность снижает стресс.", "К маме"] : ["Поговорить с мамой", "Укрепляет связь и снижает стресс.", "Поговорить"];
  const fatherAction = state.age < 3 ? ["Быть рядом с папой", "Ранняя вовлеченность дает чувство безопасности.", "К папе"] : ["Поговорить с папой", "Поддержка отца помогает с уверенностью.", "Поговорить"];
  grid.append(
    card(motherAction[0], motherAction[1], "1 действие", button(motherAction[2], () => {
      relationshipAction("talk", "mother");
    }, { disabled: !canAct() || !state.family.find((p) => p.id === "mother")?.alive, className: "primary" })),
    card(fatherAction[0], fatherAction[1], "1 действие", button(fatherAction[2], () => {
      relationshipAction("talk", "father");
    }, { disabled: !canAct() || !state.family.find((p) => p.id === "father")?.alive, className: "primary" })),
    card("Жить отдельно", "Свобода и расходы на жилье.", `Нужно ${fmt(cityData().housing)}`, button("Съехать", leaveParents, {
      disabled: state.age < 18 || !state.livingWithParents || state.personalMoney < cityData().housing,
    })),
    card("Помочь родителям", "Перевести часть личных денег в семейный бюджет.", fmt(400), button("Помочь", supportParents, {
      disabled: state.age < 18 || state.personalMoney < 400,
    })),
    card("Семейный совет", "Снизить конфликты и согласовать планы семьи.", "1 действие", button("Собрать", () => {
      familyRelationshipAction("council");
    }, {
      disabled: !canAct(),
      className: "primary",
    })),
    card("Забота о старших", "Помочь бабушке или дедушке с делами и здоровьем.", state.age < 12 ? "Доступно с 12 лет" : "1 действие", button("Позаботиться", () => {
      familyRelationshipAction("elders");
    }, {
      disabled: !canAct() || state.age < 12,
    }))
  );
  actions.append(grid);
  root.append(actions);
  return root;
}

function generation(title, people, kind) {
  const wrap = document.createElement("div");
  wrap.className = `generation ${kind}`;
  const h = document.createElement("div");
  h.className = "generation-title";
  h.textContent = title;
  const row = document.createElement("div");
  row.className = "person-row";
  if (!people.length) {
    row.append(card("Пока нет", "Эта ветка появится позже.", "", null));
  } else {
    people.forEach((p) => row.append(personNode(p)));
  }
  wrap.append(h, row);
  return wrap;
}

function partnerPerson() {
  return {
    name: state.relationship.name,
    role: state.relationship.married ? "Супруг/супруга" : "Партнер",
    age: state.relationship.age,
    alive: true,
    job: state.relationship.married ? "семья" : "отношения",
    bond: state.relationship.bond,
    trust: state.relationship.trust,
    romance: state.relationship.romance,
    health: 80,
  };
}

function childPerson(child) {
  return { name: child.name, role: "Ребенок", age: child.age, alive: true, job: "растет", bond: child.bond, health: child.health };
}

function personNode(p) {
  const node = document.createElement("article");
  node.className = `person tree-node${p.alive ? "" : " dead"}`;
  node.innerHTML = `<div class="person-name"></div><div class="person-role"></div><div class="person-details"></div>`;
  node.querySelector(".person-name").textContent = `${p.name}${p.lastName ? ` ${p.lastName}` : ""}`;
  node.querySelector(".person-role").textContent = `${p.role}, ${ageText(p.age)}${p.alive ? "" : " - память"}`;
  const romantic = p.romance > 0 || ["partner", "spouse", "ex_partner"].includes(p.relationType) ? ` · доверие ${p.trust ?? 0}/100 · романтика ${p.romance ?? 0}/100` : ` · доверие ${p.trust ?? 0}/100`;
  node.querySelector(".person-details").textContent = `${p.occupation || p.job || "без занятия"} · связь ${p.bond ?? 0}/100${romantic} · конфликт ${p.conflict ?? 0}/100 · уважение ${p.respect ?? 0}/100 · здоровье ${p.health ?? 0}/100`;
  return node;
}

function renderWorld() {
  const root = document.createDocumentFragment();
  const current = section("Место жизни", `Сейчас: ${cityName()}, ${countryName()}. Город влияет на зарплаты, стоимость жизни, образование и возможности.`);
  const tags = document.createElement("div");
  tags.className = "tagline";
  const city = cityData();
  [`Стоимость x${city.cost}`, `Зарплаты x${city.salary}`, `Образование ${city.education}`, `Безопасность ${city.safety}`, `Возможности ${city.opportunity}`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  current.append(tags);
  root.append(current);

  const moves = section("Переезд", "После 18 лет можно переехать кнопкой, если хватает денег на старт. Используйте регион и поиск, чтобы быстро найти город.");

  // Region + search controls operate on a local filter and rebuild only the list.
  const regionNames = {};
  Object.values(countries).forEach((item) => {
    if (item.region) regionNames[item.region] = true;
  });
  const regionEntries = [["all", "Все регионы"], ...Object.keys(regionNames).sort().map((r) => [r, r])];
  const region = selectInput("worldRegion", regionEntries);
  const search = textInput("worldSearch", "Поиск по стране или городу");

  const controls = document.createElement("div");
  controls.className = "creator-grid";
  controls.append(field("Регион", region), field("Поиск", search));
  moves.append(controls);

  const list = document.createElement("div");
  const MAX_RESULTS = 60;

  const buildList = () => {
    list.replaceChildren();
    const query = search.value.trim().toLowerCase();
    const regionFilter = region.value;
    let shown = 0;
    let matched = 0;
    for (const [countryId, country] of Object.entries(countries)) {
      if (regionFilter !== "all" && country.region !== regionFilter) continue;
      const cityEntries = Object.entries(country.cities).filter(([, c]) => {
        if (!query) return true;
        return c.name.toLowerCase().includes(query) || country.name.toLowerCase().includes(query);
      });
      if (!cityEntries.length) continue;
      matched += cityEntries.length;

      const group = document.createElement("div");
      group.className = "world-group";
      const heading = document.createElement("h3");
      heading.className = "world-group-title";
      heading.textContent = `${country.name} · ${country.region || "—"}`;
      group.append(heading);

      const grid = document.createElement("div");
      grid.className = "grid";
      for (const [cityId, c] of cityEntries) {
        if (shown >= MAX_RESULTS) break;
        shown += 1;
        const active = countryId === state.country && cityId === state.city;
        const cost = Math.floor(c.housing * 1.5);
        const needsPassport = countryId !== state.country && !state.documents.passport;
        grid.append(card(`${c.name}, ${country.name}`, `Возможности ${c.opportunity}, образование ${c.education}, безопасность ${c.safety}.`, active ? "Вы здесь." : `${needsPassport ? "Нужен паспорт. " : ""}Переезд: ${fmt(cost)}.`, button(active ? "Текущий город" : "Переехать", () => moveTo(countryId, cityId), {
          disabled: active || state.age < 18 || state.personalMoney < cost || state.event || needsPassport,
          className: "primary",
        })));
      }
      group.append(grid);
      list.append(group);
      if (shown >= MAX_RESULTS) break;
    }
    if (!matched) {
      const empty = document.createElement("p");
      empty.className = "mini";
      empty.textContent = "Ничего не найдено. Измените регион или запрос.";
      list.append(empty);
    } else if (shown < matched) {
      const more = document.createElement("p");
      more.className = "mini";
      more.textContent = `Показаны первые ${shown} из ${matched}. Уточните поиск.`;
      list.append(more);
    }
  };

  region.addEventListener("change", buildList);
  search.addEventListener("input", buildList);
  buildList();

  moves.append(list);
  root.append(moves);
  return root;
}

function renderEducation() {
  const root = document.createDocumentFragment();
  const s = section("Образование и навыки", `Текущий уровень: ${state.educationLevel}. Оценки: ${state.grades}/100.`);
  s.append(renderActionGrid(getActions().filter((a) => ["Учиться в школе", "Кружок", "Спорт", "Друзья", "Олимпиада", "Мини-проект", "Стажировка", "Личный бренд"].includes(a.title))));
  const tags = document.createElement("div");
  tags.className = "tagline";
  [`Завершено: ${(state.education?.completed || []).length}`, `Курсы: ${state.education?.courses?.length || 0}`, `Самообразование: ${state.education?.selfStudyHours || 0} ч`, `Доступ к образованию: ${state.educationAccess}/100`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  s.append(tags);
  root.append(s);

  const paths = section("Образовательные траектории", "Образование влияет на знания, оценки, навыки, репутацию, стресс, деньги и доступ к должностям.");
  const pathGrid = document.createElement("div");
  pathGrid.className = "grid";
  Object.values(window.GameCareerEngine.levels()).forEach((level) => {
    const cost = Math.floor((level.cost || 0) * cityData().cost);
    const completed = state.education?.completed?.includes(level.id);
    const tooYoung = state.age < level.minAge;
    const disabled = !canAct() || tooYoung || (cost > 0 && state.personalMoney + state.familyMoney < cost);
    const meta = `${level.minAge}+${cost ? `, ${fmt(cost)}` : ""}. Знания ${level.effects.knowledge || 0}, стресс ${level.effects.stress || 0}.`;
    pathGrid.append(card(level.name, completed ? "Этот этап уже есть в истории образования." : "Можно пройти как отдельный образовательный шаг.", meta, button(completed && !["courses", "self"].includes(level.id) ? "Пройдено" : "Учиться", () => window.GameCareerEngine.applyCareerAction(state, "study", level.id), {
      disabled: completed && !["courses", "self"].includes(level.id) ? true : disabled,
      className: completed ? "" : "primary",
    })));
  });
  paths.append(pathGrid);
  root.append(paths);

  const industriesBlock = section("Отрасли", "Отрасль помогает понять, какие навыки будут важны для будущих должностей.");
  const industryGrid = document.createElement("div");
  industryGrid.className = "grid";
  Object.values(window.GameCareerEngine.industries()).forEach((industry) => {
    const count = window.GameCareerEngine.jobs().filter((job) => job.industry === industry.id).length;
    const active = state.profession === industry.profession || state.career?.industry === industry.id;
    industryGrid.append(card(industry.name, `Должностей в каталоге: ${count}. Ключевые навыки: ${industry.skills.join(", ")}.`, active ? "Текущее направление." : "Можно выбрать как карьерный фокус.", button(active ? "Выбрано" : "Выбрать", () => chooseProfession(industry.profession), {
      disabled: active || state.age < 14,
      className: active ? "" : "primary",
    })));
  });
  industriesBlock.append(industryGrid);
  root.append(industriesBlock);

  const certs = section("Сертификаты", "");
  const certGrid = document.createElement("div");
  certGrid.className = "grid";
  for (const [id, cert] of Object.entries(certificateCatalog)) {
    const owned = hasCertificate(id);
    const cost = Math.floor(cert.cost * cityData().cost);
    const disabled = owned || state.age < 16 || state.knowledge < cert.knowledge || state.social < cert.social || state.personalMoney + state.familyMoney < cost || !canAct();
    certGrid.append(card(cert.name, "", owned ? "Получен" : `${fmt(cost)}, знания ${cert.knowledge}, общение ${cert.social}`, button(owned ? "Есть" : "Получить", () => acquireCertificate(id), {
      disabled,
      className: owned ? "" : "primary",
    })));
  }
  certs.append(certGrid);
  root.append(certs);
  return root;
}

function renderCareer() {
  const root = document.createDocumentFragment();
  const currentJob = window.GameCareerEngine.jobById(state.career?.jobId);
  const s = section("Работа и профессия", `Должность: ${currentJob?.title || "нет работы"}. Карьерный уровень: ${state.careerLevel}. Опыт: ${state.experience}.`);
  s.append(renderActionGrid(getActions().filter((a) => ["Подработка", "Работать по профессии", "Фриланс"].includes(a.title))));
  const tags = document.createElement("div");
  tags.className = "tagline";
  [`Статус: ${state.career?.status || "none"}`, `Отрасль: ${currentJob ? window.GameCareerEngine.industryData(currentJob.industry).name : "не выбрана"}`, `Портфолио: ${state.portfolio}/100`, `Связи: ${state.network}/100`, `Выгорание: ${state.career?.burnout || 0}/100`, `Доход: ${fmt(annualSalary())}`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  s.append(tags);
  root.append(s);

  const jobsBlock = section("Вакансии", "Собеседование проверяет возраст, образование, знания, навыки, репутацию, портфолио и связи.");
  const jobGrid = document.createElement("div");
  jobGrid.className = "grid";
  const visibleJobs = window.GameCareerEngine.availableJobs(state)
    .sort((a, b) => window.GameCareerEngine.missingRequirements(state, a).length - window.GameCareerEngine.missingRequirements(state, b).length || a.baseSalary - b.baseSalary)
    .slice(0, 30);
  visibleJobs.forEach((job) => {
    const missing = window.GameCareerEngine.missingRequirements(state, job);
    const salary = window.GameCareerEngine.calculateSalary(state, job.id);
    const industry = window.GameCareerEngine.industryData(job.industry);
    jobGrid.append(card(job.title, `${industry.name}. Престиж ${job.prestige}/100, стресс ${job.stress}/100, риск выгорания ${Math.round(job.burnoutRisk * 100)}%.`, missing.length ? `Не хватает: ${missing.join(", ")}.` : `Ожидаемый доход: ${fmt(salary)}.`, button(missing.length ? "Недоступно" : "Собеседование", () => window.GameCareerEngine.applyCareerAction(state, "interview", job.id), {
      disabled: !canAct() || missing.length > 0,
      className: missing.length ? "" : "primary",
    })));
  });
  jobsBlock.append(jobGrid);
  root.append(jobsBlock);

  const growth = section("Карьерное развитие", "Продвижение зависит от опыта, навыков, репутации и общения.");
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.append(
    card("Портфолио", "Собрать заметные результаты работы.", "1 действие, репутация +3", button("Собрать", () => careerMove("portfolio"), { disabled: !canAct(), className: "primary" })),
    card("Нетворкинг", "Познакомиться с людьми из отрасли.", "1 действие, связи +8", button("Встречаться", () => careerMove("network"), { disabled: !canAct(), className: "primary" })),
    card("Смена позиции", "Найти работу лучше.", `Связи 35, портфолио 25`, button("Искать", () => careerMove("switch"), {
      disabled: !canAct() || state.network < 35 || state.portfolio < 25,
      className: "primary",
    })),
    card("Просить повышение", "Попытаться поднять карьерный уровень.", "Нужны опыт и репутация", button("Попросить", () => {
      careerMove("raise");
    }, { disabled: !canAct() || !state.career?.jobId })),
    card("Ментор", "Учиться у сильного специалиста.", `${fmt(Math.floor(500 * cityData().cost))}`, button("Найти", () => careerMove("mentor"), {
      disabled: !canAct() || state.age < 16 || state.personalMoney < Math.floor(500 * cityData().cost),
    })),
    card("Карьерный перерыв", "Сбросить стресс и риск выгорания.", "1 действие", button("Взять", () => careerMove("rest"), {
      disabled: !canAct() || state.age < 18,
    })),
    card("Конфликт на работе", "Сложный разговор может ударить по стрессу и репутации.", "1 действие", button("Разобрать", () => careerMove("conflict"), {
      disabled: !canAct() || !state.career?.jobId,
    })),
    card("Премия", "Попытаться монетизировать сильный результат.", "Зависит от текущей зарплаты", button("Запросить", () => careerMove("bonus"), {
      disabled: !canAct() || !state.career?.jobId || state.reputation < 10,
    })),
    card("Понижение", "Снизить роль, если нагрузка стала неподъемной.", "Минус уровень", button("Согласиться", () => careerMove("demotion"), {
      disabled: !canAct() || !state.career?.jobId || state.careerLevel < 1,
    }))
  );
  growth.append(grid);
  root.append(growth);
  return root;
}


function renderHealth() {
  window.GameHealthEngine?.normalizeHealthState?.(state, state);
  const profile = state.healthProfile;
  const allConditions = window.GameHealthEngine?.allStateConditions?.(state) || [];
  const root = document.createDocumentFragment();
  const s = section("Здоровье", "Сон, стресс, привычки и игровые состояния влияют на действия, карьеру, деньги, отношения, события и риск смерти.");
  const cards = document.createElement("div");
  cards.className = "grid stat-grid";
  cards.append(
    statCard("Здоровье", `${Math.round(profile.health)}/100`, { icon: "❤", accent: "health", sub: "Физическое состояние" }),
    statCard("Психика", `${Math.round(profile.mental)}/100`, { icon: "🧠", accent: "romance", sub: "Устойчивость" }),
    statCard("Энергия", `${Math.round(profile.energy)}/100`, { icon: "⚡", accent: "career", sub: "Запас сил" }),
    statCard("Иммунитет", `${Math.round(profile.immunity)}/100`, { icon: "🛡", accent: "health", sub: "Сопротивляемость" })
  );
  s.append(cards);
  const bars = document.createElement("div");
  bars.className = "grid";
  bars.append(
    progressBar("Здоровье", profile.health, 100, { tone: "health" }),
    progressBar("Психика", profile.mental, 100, { tone: "romance" }),
    progressBar("Стресс", profile.stress, 100, { tone: "bad" }),
    progressBar("Энергия", profile.energy, 100, { tone: "good" }),
    progressBar("Форма", profile.fitness, 100, { tone: "health" }),
    progressBar("Сон", profile.sleep, 100, { tone: "good" }),
    progressBar("Иммунитет", profile.immunity, 100, { tone: "health" })
  );
  s.append(bars);
  root.append(s);

  const conditions = section("Состояния", allConditions.length ? "" : "Серьезных активных состояний нет.");
  const cgrid = document.createElement("div");
  cgrid.className = "grid";
  allConditions.forEach((entry) => {
    const condition = window.GameHealthEngine?.conditionById?.(entry.id);
    const treatmentText = condition?.treatmentOptions?.length
      ? `Лечение: ${condition.treatmentOptions.map((item) => item.title).join(", ")}.`
      : "Без специальных вариантов лечения.";
    cgrid.append(card(
      entry.title,
      `Серьезность ${entry.severity}/5. Длится ${entry.yearsActive} г.`,
      treatmentText,
      null
    ));
  });
  if (!allConditions.length) {
    cgrid.append(card("Состояний нет", "Сон, питание и стресс все равно влияют на риски следующего года.", "Профилактика доступна ниже.", null));
  }
  conditions.append(cgrid);
  root.append(conditions);

  const treatment = section("Лечение", "Стоимость зависит от страны, города, страховки и самого состояния.");
  const tgrid = document.createElement("div");
  tgrid.className = "grid";
  allConditions.forEach((entry) => {
    const condition = window.GameHealthEngine?.conditionById?.(entry.id);
    (condition?.treatmentOptions || []).forEach((option) => {
      const cost = window.GameHealthEngine.treatmentCost(state, condition, option);
      const canAfford = state.personalMoney + state.familyMoney >= cost;
      tgrid.append(card(
        `${entry.title}: ${option.title}`,
        `Шанс помощи зависит от варианта и иммунитета.`,
        cost ? fmt(cost) : "без расходов",
        button("Выбрать", () => healthTreatment(entry.id, option.id), {
          disabled: !canAct() || !canAfford,
          className: "primary",
        })
      ));
    });
  });
  if (!tgrid.children.length) tgrid.append(card("Лечение не требуется", "Когда появится состояние, здесь будут варианты помощи.", "Страховка: " + (state.documents?.insurance || "none"), null));
  treatment.append(tgrid);
  root.append(treatment);

  const actions = section("Привычки", "Привычки меняют риск состояний и ежегодную динамику здоровья.");
  const agrid = document.createElement("div");
  agrid.className = "grid";
  agrid.append(
    card("Сон", `Текущее качество: ${profile.sleep}/100.`, "1 действие", button("Выспаться", () => healthHabitAction("sleep"), { disabled: !canAct(), className: "primary" })),
    card("Питание", `Качество рациона: ${profile.habits.nutrition}/100.`, state.age < 18 ? `семья ${fmt(Math.floor(160 * cityData().cost))}` : fmt(Math.floor(260 * cityData().cost)), button("Наладить", () => healthHabitAction("nutrition"), { disabled: !canAct(), className: "primary" })),
    card("Активность", `Движение: ${profile.habits.activity}/100.`, "1 действие", button("Заняться", () => healthHabitAction("activity"), { disabled: !canAct(), className: "primary" })),
    card("Спокойный час", `Экранное время: ${profile.habits.screenTime}/100.`, state.age < 18 ? `семья ${fmt(Math.floor(240 * cityData().cost))}` : fmt(Math.floor(420 * cityData().cost)), button("Сделать", () => healthHabitAction("calm"), { disabled: !canAct() })),
    card("Медосмотр", `Страховка: ${state.documents?.insurance || "нет"}.`, state.documents?.insurance === "premium" ? fmt(Math.floor(120 * cityData().cost)) : fmt(Math.floor(350 * cityData().cost)), button("Пройти", () => healthHabitAction("checkup"), { disabled: !canAct() || state.age < 18 }))
  );
  actions.append(agrid);
  root.append(actions);

  const history = section("История лечения", "");
  const list = document.createElement("div");
  list.className = "timeline-list";
  (profile.treatmentHistory || []).slice(0, 8).forEach((text) => {
    appendTimelineEntry(list, text);
  });
  if (!list.children.length) {
    const empty = document.createElement("div");
    empty.className = "mini";
    empty.textContent = "Записей пока нет.";
    list.append(empty);
  }
  history.append(list);
  root.append(history);
  return root;
}

function metricCard(title, value, text) {
  const node = document.createElement("article");
  node.className = "card";
  node.innerHTML = `<h3></h3><div class="meter"><span></span></div><div class="mini"></div>`;
  node.querySelector("h3").textContent = title;
  node.querySelector(".meter span").style.setProperty("--value", `${clamp(value, 0, 100)}%`);
  node.querySelector(".mini").textContent = `${Math.floor(value)} из 100`;
  return node;
}

function renderSkills() {
  const root = document.createDocumentFragment();
  const s = section("Навыки и характер", "Навыки растут от детских занятий, учебы, работы и отдельных тренировок. Они напрямую влияют на доход, отношения, бизнес и переезд.");
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [id, skill] of Object.entries(skillCatalog)) {
    const cost = state.age < 18 ? 0 : 180 + Math.floor((state.skills[id] || 0) * 4);
    const disabled = !canAct() || (state.age >= 18 && state.personalMoney < cost);
    grid.append(card(skill.name, skill.text, `Уровень: ${state.skills[id] || 0}/100. ${state.age < 18 ? "Детское развитие бесплатно." : `Цена: ${fmt(cost)}.`}`, button(state.age < 18 ? skill.childhood : "Тренировать", () => {
      if (disabled) return;
      spendAction();
      if (state.age >= 18) state.personalMoney -= cost;
      const gain = state.age < 18 ? 5 : 4;
      improveSkill(id, gain + Math.floor(state.traits.curiosity / 40));
      if (id === "fitness") change({ health: 3, stress: -2 });
      if (id === "empathy") change({ social: 2, happiness: 1 });
      if (id === "finance") change({ discipline: 2 });
      if (id === "leadership") change({ reputation: 1, social: 1 });
      notify(`${skill.name}: навык вырос.`);
    }, { disabled, className: "primary" })));
  }
  s.append(grid);
  root.append(s);

  const traits = section("Черты характера", "Они задаются при рождении и мягко направляют стиль игры.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Любознательность: ${state.traits.curiosity}`,
    `Риск: ${state.traits.risk}`,
    `Доброта: ${state.traits.kindness}`,
    `Амбиции: ${state.traits.ambition}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  traits.append(tags);
  root.append(traits);
  return root;
}

function renderMoney() {
  const root = document.createDocumentFragment();
  const economy = state.economy || {};
  const expenses = window.GameEconomyEngine?.calculateAnnualExpenses?.(state) || { total: personalCost() };
  const s = section("Личная экономика", `Капитал сейчас: ${fmt(netWorth())}. Плановые годовые расходы: ${fmt(expenses.total)}.`);

  const assets = economy.assets || {};
  const cards = document.createElement("div");
  cards.className = "grid stat-grid";
  cards.append(
    statCard("Капитал", fmt(netWorth()), { icon: "₿", accent: "money", sub: `Рейтинг ${state.creditScore}/100` }),
    statCard("Наличные", fmt(economy.cash ?? state.personalMoney), { icon: "💵", accent: "money", sub: `Банк ${fmt(economy.bankBalance || 0)}` }),
    statCard("Доход года", fmt(economy.yearlyIncome || 0), { icon: "📈", accent: "career", sub: `Расходы ${fmt(economy.yearlyExpenses || 0)}` }),
    statCard("Налоги", fmt(economy.taxDebt ?? state.taxDebt), { icon: "🏛", accent: "bad", sub: `База ${fmt(economy.taxBase ?? state.taxableIncome)}` })
  );
  s.append(cards);

  // CSS-only capital structure bar: where the net worth lives.
  const structure = section("Структура капитала", "Распределение активов и обязательств. Наведите на сегмент для деталей.");
  structure.append(stackedBar([
    { label: "Наличные", value: economy.cash ?? state.personalMoney, tone: "money", format: fmt },
    { label: "Банк/депозиты", value: (economy.bankBalance || 0) + (assets.deposits || 0), tone: "good", format: fmt },
    { label: "Инвестиции", value: (assets.stocks || 0) + (assets.pension || 0), tone: "career", format: fmt },
    { label: "Недвижимость", value: (economy.realEstate || []).reduce((sum, p) => sum + (p.value || 0), 0), tone: "health", format: fmt },
    { label: "Долги", value: (economy.loans || []).reduce((sum, l) => sum + (l.principal || 0) + (l.overdue || 0), 0) + (economy.taxDebt || 0), tone: "bad", format: fmt },
  ]));

  const grid = document.createElement("div");
  grid.className = "grid";
  const loanOffers = [
    ["consumer", 1500],
    ["education", 2200],
    ["mortgage", 9000],
    ["business", 4200],
  ];
  loanOffers.forEach(([type, amount]) => {
    const loanType = window.GameData.loanTypes[type];
    grid.append(card(loanType.name, "Кредит добавляет деньги сейчас, но каждый год начисляет проценты и платеж.", `Ставка ${Math.round(loanType.annualRate * 1000) / 10}%, срок ${loanType.termYears} лет.`, button("Взять", () => {
      const result = window.GameEconomyEngine.takeLoan(state, type, amount);
      notify(result.ok ? `Получен кредит ${fmt(amount)}.` : result.text);
    }, { disabled: state.age < 18 || state.event || state.creditScore < loanType.minCreditScore, className: "money" })));
  });
  (economy.loans || []).forEach((loan) => {
    const amount = Math.min(1000, loan.principal + loan.overdue);
    grid.append(card(loan.name, `Остаток ${fmt(loan.principal)}. Просрочка ${fmt(loan.overdue || 0)}.`, `Ставка ${Math.round(loan.annualRate * 1000) / 10}%`, button(`Погасить ${fmt(amount)}`, () => {
      const result = window.GameEconomyEngine.repayLoan(state, loan.id, amount);
      notify(result.ok ? `Погашено ${fmt(result.paid)}.` : "Платеж не прошел.");
    }, { disabled: state.personalMoney <= 0 })));
  });
  s.append(grid);
  root.append(s);
  root.append(structure);

  const expenseBlock = section("Расходы года", "Расчет включает жилье, еду и быт, детей, партнера и семью, медицину, транспорт, кредиты, налоги, образ жизни и страховку.");
  const expenseTags = document.createElement("div");
  expenseTags.className = "tagline";
  [
    ["Жилье", expenses.housing],
    ["Еда/быт", expenses.foodHousehold],
    ["Дети", expenses.children],
    ["Партнер/семья", expenses.partnerFamily],
    ["Медицина", expenses.medical],
    ["Транспорт", expenses.transport],
    ["Кредиты", expenses.loans],
    ["Налоги", expenses.taxes],
    ["Образ жизни", expenses.lifestyle],
    ["Страховка", expenses.insurance],
  ].forEach(([label, value]) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${label}: ${fmt(value || 0)}`;
    expenseTags.append(tag);
  });
  expenseBlock.append(expenseTags);
  root.append(expenseBlock);

  const budget = section("Бюджет и стиль жизни", "Чем выше быт, тем больше счастья, но расходы могут съесть свободу.");
  const modeGrid = document.createElement("div");
  modeGrid.className = "grid";
  for (const [id, mode] of Object.entries(budgetModes)) {
    modeGrid.append(card(mode.name, "", `Расходы x${mode.cost}`, button(state.budgetMode === id ? "Выбрано" : "Выбрать", () => setBudgetMode(id), {
      disabled: state.budgetMode === id || state.event,
      className: state.budgetMode === id ? "" : "primary",
    })));
  }
  modeGrid.append(card("Резерв", "", `${emergencyFundMonths()} / ${state.emergencyFundTarget} мес.`, button("Отложить", () => saveEmergencyFund(), {
    disabled: state.age < 18 || state.personalMoney < Math.floor(personalCost() * 0.5) || state.event,
    className: "money",
  })));
  budget.append(modeGrid);
  root.append(budget);

  const history = section("Финансовая история", "Последние финансовые записи и годовые сводки.");
  const list = document.createElement("div");
  list.className = "timeline-list";
  (economy.financialHistory || []).slice(0, 8).forEach((entry) => {
    appendTimelineEntry(list, entry);
  });
  if (!list.children.length) {
    const empty = document.createElement("div");
    empty.className = "mini";
    empty.textContent = "История появится после доходов, расходов, кредитов и годовых итогов.";
    list.append(empty);
  }
  history.append(list);
  root.append(history);
  return root;
}


function renderHome() {
  const root = document.createDocumentFragment();
  const home = section("Дом и быт", `Текущее жилье: ${housingData().name}. Качество: ${housingData().quality}/100. Годовая стоимость: ${fmt(Math.floor(housingData().annual * cityData().cost))}.`);
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const [id, item] of Object.entries(housingCatalog)) {
    if (id === "parents" && state.age >= 18) continue;
    const active = state.housing === id;
    const annual = Math.floor(item.annual * cityData().cost);
    const buy = item.buy ? Math.floor(item.buy * cityData().cost) : 0;
    const needed = buy || annual;
    grid.append(card(item.name, `Счастье ${item.happiness >= 0 ? "+" : ""}${item.happiness}, стресс ${item.stress >= 0 ? "+" : ""}${item.stress}.`, item.buy ? `Покупка: ${fmt(buy)}. Содержание: ${fmt(annual)}.` : `Годовая стоимость: ${fmt(annual)}.`, button(active ? "Вы здесь" : item.buy ? "Купить" : "Переехать", () => changeHousing(id), {
      disabled: active || state.age < item.minAge || state.personalMoney < needed || state.event,
      className: "primary",
    })));
  }
  home.append(grid);
  root.append(home);

  const estate = section("Недвижимость", "Недвижимость может расти или падать в цене, требовать содержания, сдаваться в аренду, продаваться или покупаться через ипотеку.");
  const estateGrid = document.createElement("div");
  estateGrid.className = "grid";
  Object.entries(window.GameData.realEstateTypes || {}).forEach(([type, item]) => {
    const price = Math.floor(item.baseValue * cityData().cost * (0.9 + cityData().opportunity / 700));
    estateGrid.append(card(item.name, `Содержание около ${Math.round(item.maintenanceRate * 1000) / 10}% в год. Аренда около ${Math.round(item.rentRate * 1000) / 10}% стоимости.`, `Цена: ${fmt(price)}. Первый взнос: ${fmt(Math.ceil(price * 0.2))}.`, (() => {
      const wrap = document.createElement("div");
      wrap.className = "button-grid";
      wrap.append(button("Купить", () => {
        const result = window.GameEconomyEngine.buyRealEstate(state, type, { primary: false });
        notify(result.ok ? `Куплена недвижимость: ${result.property.name}.` : result.text || "Покупка недоступна.");
      }, { disabled: state.age < item.minAge || state.personalMoney < price || state.event, className: "primary" }));
      wrap.append(button("Ипотека", () => {
        const result = window.GameEconomyEngine.buyRealEstate(state, type, { mortgage: true, primary: false });
        notify(result.ok ? `Оформлена ипотека на ${result.property.name}.` : result.text || "Ипотека недоступна.");
      }, { disabled: state.age < item.minAge || state.personalMoney < Math.ceil(price * 0.2) || state.creditScore < 45 || state.event, className: "money" }));
      return wrap;
    })()));
  });
  (state.economy?.realEstate || []).forEach((item) => {
    estateGrid.append(card(item.name, `${item.rented ? "Сдается в аренду." : item.primary ? "Основное жилье." : "Не сдается."} Содержание к оплате: ${fmt(item.maintenanceDue || 0)}.`, `Стоимость: ${fmt(item.value)}.`, (() => {
      const wrap = document.createElement("div");
      wrap.className = "button-grid";
      wrap.append(button(item.rented ? "Не сдавать" : "Сдавать", () => {
        const result = window.GameEconomyEngine.setRealEstateRent(state, item.id, !item.rented);
        notify(result.ok ? "Статус аренды изменен." : "Не удалось изменить аренду.");
      }, { disabled: item.primary || state.event }));
      wrap.append(button("Продать", () => {
        const result = window.GameEconomyEngine.sellRealEstate(state, item.id);
        notify(result.ok ? `Недвижимость продана: ${fmt(result.amount)}.` : "Продажа недоступна.");
      }, { disabled: state.event, className: "money" }));
      return wrap;
    })()));
  });
  estate.append(estateGrid);
  root.append(estate);

  const possessions = section("Вещи и инструменты", "Покупки дают постоянные маленькие бонусы, но деньги уходят сразу.");
  const pgrid = document.createElement("div");
  pgrid.className = "grid";
  for (const [id, item] of Object.entries(possessionCatalog)) {
    const owned = hasPossession(id);
    pgrid.append(card(item.name, item.text, owned ? "Уже куплено." : `Цена: ${fmt(item.cost)}.`, button(owned ? "Есть" : "Купить", () => buyPossession(id), {
      disabled: owned || state.personalMoney < item.cost || state.event,
    })));
  }
  possessions.append(pgrid);
  root.append(possessions);
  return root;
}


function renderAssets() {
  const root = document.createDocumentFragment();
  const s = section("Активы и капитал", "Деньги можно держать в наличных, вкладах, акциях, пенсионном капитале и недвижимости. Риск зависит от финансового навыка.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const assetRows = [
    ["deposits", "Вклад", "Низкий риск, небольшой процент каждый год."],
    ["stocks", "Акции", "Доходность плавает: можно заработать или потерять."],
    ["pension", "Пенсионный капитал", "Длинные деньги: лучше для поздней жизни."],
    ["property", "Недвижимость", "Стоимость купленных объектов с учетом рынка."],
    ["business", "Бизнес-активы", "Оценка компании, если она есть."],
  ];
  for (const [id, title, text] of assetRows) {
    const passive = id === "property" || id === "business";
    grid.append(card(title, text, `Сейчас: ${fmt(state.assets[id])}.`, passive ? null : assetButtons(id)));
  }
  grid.append(card("Капитал", "Сумма денег, активов, компании и жилья минус долг.", `Итого: ${fmt(netWorth())}.`, null));
  s.append(grid);
  root.append(s);
  return root;
}

function assetButtons(id) {
  const wrap = document.createElement("div");
  wrap.className = "button-grid";
  [300, 1000].forEach((amount) => {
    wrap.append(button(`Вложить ${fmt(amount)}`, () => investAsset(id, amount), {
      disabled: state.personalMoney < amount || state.event,
      className: "primary",
    }));
  });
  wrap.append(button("Вывести 25%", () => withdrawAsset(id), {
    disabled: state.assets[id] <= 0 || state.event,
  }));
  return wrap;
}


function renderBusiness() {
  const root = document.createDocumentFragment();
  const s = section("Создание компании", "Компания становится отдельной экономикой: касса, сотрудники, репутация, прибыль и стресс.");
  if (!state.company) {
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const [id, sector] of Object.entries(companySectors)) {
      const disabled = state.age < 18 || state.personalMoney < sector.cost || state.knowledge < sector.knowledge || state.social < sector.social;
      grid.append(card(sector.name, `Базовая выручка: ${fmt(sector.baseRevenue)}. Стресс: ${sector.stress}.`, `Нужно ${fmt(sector.cost)}, знания ${sector.knowledge}, общение ${sector.social}.`, button("Открыть", () => startCompany(id), {
        disabled: disabled || !canAct(),
        className: "primary",
      })));
    }
    s.append(grid);
  } else {
    const sector = companySectors[state.company.sector];
    const grid = document.createElement("div");
    grid.className = "grid";
    grid.append(
      card(sector.name, `Касса: ${fmt(state.company.cash)}. Репутация: ${state.company.reputation}. Сотрудники: ${state.company.employees}.`, `Уровень ${state.company.level}.`, null),
      card("Продажи", "Активно искать клиентов и заказы.", "1 действие", button("Продавать", () => companyAction("sell"), { disabled: !canAct(), className: "primary" })),
      card("Найм", "Сотрудники увеличивают годовую мощность.", `${fmt(900)} из кассы компании`, button("Нанять", () => companyAction("hire"), { disabled: !canAct() || state.company.cash < 900 })),
      card("Улучшение", "Процессы, продукт, оборудование.", `${fmt(1300)} из кассы компании`, button("Улучшить", () => companyAction("improve"), { disabled: !canAct() || state.company.cash < 1300 })),
      card("Маркетинг", "", `${fmt(700)} из кассы`, button("Запустить", () => companyAction("marketing"), { disabled: !canAct() || state.company.cash < 700 })),
      card("Качество", "", `${fmt(1000)} из кассы`, button("Усилить", () => companyAction("quality"), { disabled: !canAct() || state.company.cash < 1000 })),
      card("Автоматизация", "", `${fmt(1800)} из кассы`, button("Внедрить", () => companyAction("automation"), { disabled: !canAct() || state.company.cash < 1800 })),
      card("Филиал", "", `${fmt(3200)} из кассы`, button("Открыть", () => companyAction("branch"), { disabled: !canAct() || state.company.cash < 3200 })),
      card("Бизнес-кредит", "", `Долг: ${fmt(state.company.debt || 0)}`, button("Взять", () => companyAction("loan"), { disabled: !canAct() || state.creditScore < 35, className: "money" })),
      card("Погасить долг", "", `До ${fmt(1200)}`, button("Погасить", () => companyAction("repay"), { disabled: !state.company.debt || state.company.cash <= 0 })),
      card("Дивиденды", "Вывести четверть кассы в личные деньги.", `Минимум ${fmt(500)} в кассе`, button("Вывести", () => companyAction("withdraw"), { disabled: state.company.cash < 500, className: "money" }))
    );
    s.append(grid);
  }
  root.append(s);
  return root;
}

function renderRelationships() {
  const root = document.createDocumentFragment();
  const s = section("Отношения и своя семья", "Партнер, брак и дети влияют на счастье, расходы, стресс и семейное дерево.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const activePartner = window.GameRelationshipEngine?.activePartner?.(state);
  const spouseNpc = window.GameRelationshipEngine?.spouse?.(state);
  grid.append(
    card("Новое знакомство", "Шанс зависит от социальности, настроения и возраста.", activePartner ? `Уже есть: ${activePartner.name}` : "Возраст 16+", button("Познакомиться", startRelationship, {
      disabled: state.age < 16 || Boolean(activePartner) || !canAct(),
      className: "primary",
    })),
    card("Провести время", activePartner ? `Связь: ${activePartner.bond ?? 0}/100.` : "Сначала нужно познакомиться.", "1 действие", button("Вместе", () => relationshipAction("spend_time", activePartner?.id), {
      disabled: !activePartner || !canAct(),
      className: "primary",
    })),
    card("Глубокий разговор", activePartner ? `Доверие: ${activePartner.trust ?? 0}/100.` : "Сначала нужно познакомиться.", "1 действие", button("Поговорить", () => relationshipAction("talk", activePartner?.id), {
      disabled: !activePartner || !canAct(),
      className: "primary",
    })),
    card("Поддержать", activePartner ? `Стресс и доверие зависят от качества связи.` : "Нужен близкий человек.", "1 действие", button("Поддержать", () => relationshipAction("support", activePartner?.id), {
      disabled: !activePartner || !canAct(),
    })),
    card("Подарок", "Не заменяет доверие, но хорошо работает вместе с вниманием.", `${fmt(Math.floor(420 * cityData().cost))}`, button("Подарить", () => relationshipAction("gift", activePartner?.id), {
      disabled: !activePartner || !canAct() || state.personalMoney < Math.floor(420 * cityData().cost),
    })),
    card("Поссориться", activePartner ? `Конфликт: ${activePartner.conflict ?? 0}/100.` : "Нужен близкий человек.", "1 действие", button("Высказать", () => relationshipAction("argue", activePartner?.id), {
      disabled: !activePartner || !canAct(),
    })),
    card("Извиниться", activePartner ? `Конфликт: ${activePartner.conflict ?? 0}/100.` : "Нужен близкий человек.", "1 действие", button("Извиниться", () => relationshipAction("apologize", activePartner?.id), {
      disabled: !activePartner || !canAct() || (activePartner.conflict ?? 0) < 8,
    })),
    card("Предложение", "Серьезный разговор о браке.", `Нужны связь 62 и доверие 50.`, button("Предложить", () => relationshipAction("proposal", activePartner?.id), {
      disabled: !activePartner || activePartner.relationType !== "partner" || activePartner.bond < 62 || activePartner.trust < 50 || state.age < 18 || !canAct(),
    })),
    card("Брак", "Создать свою семью.", `Нужно связь 70 и ${fmt(Math.floor(1100 * cityData().cost))}.`, button("Пожениться", marry, {
      disabled: !activePartner || activePartner.relationType !== "partner" || activePartner.bond < 70 || activePartner.trust < 55 || state.age < 18 || state.personalMoney < Math.floor(1100 * cityData().cost) || !canAct(),
    })),
    card("Общий бюджет", "После брака можно объединить часть денег и снизить бытовые трения.", state.relationship?.sharedBudget ? "Уже включен." : "Требуется брак", button("Объединить", () => romanticAction("budget"), {
      disabled: !state.relationship || !state.relationship.married || state.relationship.sharedBudget || !canAct(),
    })),
    card("Ребенок", "Новая ветка семьи и новые расходы.", `Детей: ${state.children.length}.`, button("Завести ребенка", haveChild, {
      disabled: !spouseNpc || state.age < 20 || state.children.length >= 4 || !canAct(),
    })),
    card("Расстаться", "Завершить отношения без брака.", activePartner?.relationType === "partner" ? "1 действие" : "Только до брака", button("Расстаться", () => relationshipAction("breakup", activePartner?.id), {
      disabled: !activePartner || activePartner.relationType !== "partner" || !canAct(),
    })),
    card("Развод", "Завершить брак юридически и эмоционально.", `${fmt(Math.floor(700 * cityData().cost))}`, button("Развестись", () => relationshipAction("divorce", spouseNpc?.id), {
      disabled: !spouseNpc || state.personalMoney + state.familyMoney < Math.floor(700 * cityData().cost) || !canAct(),
    }))
  );
  s.append(grid);
  root.append(s);

  const people = (window.GameRelationshipEngine?.list?.(state) || []).filter((npc) => npc.alive && npc.relationType !== "self" && npc.relationType !== "spouse" && npc.relationType !== "partner");
  if (people.length) {
    const social = section("Близкие и знакомые", "Каждый человек хранит отдельные доверие, конфликт, уважение и историю.");
    const pg = document.createElement("div");
    pg.className = "grid";
    people.forEach((npc) => {
      const tone = ["friend", "best_friend"].includes(npc.relationType) ? "good" : npc.relationType === "enemy" ? "bad" : "family";
      const lines = [
        npc.occupation || npc.role,
        `Связь ${npc.bond}/100 · Доверие ${npc.trust}/100`,
        `Конфликт ${npc.conflict}/100 · Уважение ${npc.respect}/100`,
      ];
      const actions = document.createElement("div");
      actions.className = "button-grid two";
      actions.append(
        button("Поговорить", () => relationshipAction("talk", npc.id), { disabled: !canAct(), className: "primary" }),
        button("Поддержать", () => relationshipAction("support", npc.id), { disabled: !canAct() }),
        button("Помочь деньгами", () => relationshipAction("help_money", npc.id), {
          disabled: !canAct() || state.personalMoney + state.familyMoney < Math.floor(400 * cityData().cost),
          className: "money",
        }),
        button("Попросить помощь", () => relationshipAction("ask_help", npc.id), {
          disabled: !canAct() || npc.bond < 38 || npc.trust < 30,
        })
      );
      pg.append(personCard(`${npc.name} ${npc.lastName || ""}`.trim(), npc.role, lines, actions, { tone }));
    });
    social.append(pg);
    root.append(social);
  }

  if (state.children.length) {
    const kids = section("Развитие детей", "Каждый ребенок растет отдельно. Вложения в детей повышают связь, здоровье и будущую устойчивость семьи.");
    const kg = document.createElement("div");
    kg.className = "grid";
    state.children.forEach((child, index) => {
      kg.append(card(child.name, `Возраст: ${ageText(child.age)}. Связь ${child.bond}/100. Здоровье ${child.health}/100.`, "Действия родителя", button("Вложиться в ребенка", () => investInChild(index), {
        disabled: !canAct() || state.personalMoney + state.familyMoney < 350,
        className: "primary",
      })));
    });
    kids.append(kg);
    root.append(kids);
  }

  const adultNode = renderAdultRelationships();
  if (adultNode) root.append(adultNode);
  return root;
}

function renderAdultRelationships() {
  const engine = window.GameAdultRelationships;
  if (!engine?.isUnlocked?.(state)) return null;
  const info = engine.describe(state);
  const stats = info?.stats || {};
  const node = section("Близость 18+", "Взрослые отношения по взаимному согласию. Без откровенных деталей — игра уважает приватность.");
  node.querySelector(".section-head > div")?.prepend(badgeRow([["18+", "adult"]]));
  const bars = document.createElement("div");
  bars.className = "grid";
  [
    ["Близость", stats.intimacy, "romance"], ["Страсть", stats.passion, "romance"], ["Доверие", stats.trust, "good"],
    ["Романтика", stats.romance, "romance"], ["Ревность", stats.jealousy, "warn"], ["Общее будущее", stats.sharedFuture, "money"],
  ].forEach(([label, value, tone]) => bars.append(progressBar(label, value ?? 0, 100, { tone })));
  node.append(bars);
  const grid = document.createElement("div");
  grid.className = "grid";
  engine.getActions(state).forEach((action) => {
    const cost = action.cost?.money ? `${fmt(action.cost.money)} · ` : "";
    grid.append(card(action.title, "", `${cost}${action.description}`, button("Сделать", () => {
      engine.performAction(state, action.id);
      render();
    }, { disabled: !canAct(), className: canAct() ? "primary" : "" })));
  });
  node.append(grid);
  return node;
}


function renderDocuments() {
  window.GameLegalEngine?.normalizeLegalState?.(state, state);
  const root = document.createDocumentFragment();
  const s = section("Документы и статус", "Документы открывают работу, переезд, налоги, страховку и часть взрослых решений.");
  const grid = document.createElement("div");
  grid.className = "grid";
  const docs = [
    ["birthCertificate", "Свидетельство о рождении", "Есть с рождения. Нужно для школы, семьи и базовых прав.", 0, 0],
    ["passport", "Паспорт", "Нужен для международного переезда и части взрослых действий.", 14, 220],
    ["taxId", "Налоговый номер", "Снижает налоговые штрафы и делает доходы официальными.", 16, 120],
    ["driverLicense", "Водительские права", "Нужны для автомобиля и некоторых карьерных возможностей.", 18, 650],
    ["workPermit", "Разрешение на работу", "После переезда в другую страну его нужно оформить заново.", 18, 900],
  ];
  for (const [id, title, text, age, cost] of docs) {
    const owned = Boolean(state.documents[id]);
    const legalCheck = window.GameLegalEngine?.canAcquireDocument?.(state, id) || { ok: true };
    const disabled = owned || state.age < age || state.personalMoney < cost || state.event || !legalCheck.ok;
    grid.append(card(title, text, owned ? "Оформлено." : `${legalCheck.ok ? `Возраст: ${age}+. Цена: ${fmt(cost)}.` : legalCheck.text}`, button(owned ? "Есть" : "Оформить", () => acquireDocument(id, cost), {
      disabled,
      className: owned ? "" : "primary",
    })));
  }
  s.append(grid);
  root.append(s);

  const insurance = section("Страховка", "Страховка снижает медицинские риски и делает здоровье дешевле.");
  const ig = document.createElement("div");
  ig.className = "grid";
  [
    ["none", "Без страховки", 0, "Лечение дорогое, риск долгов выше."],
    ["basic", "Базовая страховка", 360, "Умеренные платежи, часть лечения дешевле."],
    ["premium", "Расширенная страховка", 900, "Дороже каждый год, но кризисы мягче."],
  ].forEach(([id, title, cost, text]) => {
    const active = state.documents.insurance === id;
    ig.append(card(title, text, active ? "Текущий вариант." : `Взнос: ${fmt(cost)}.`, button(active ? "Выбрано" : "Выбрать", () => setInsurance(id, cost), {
      disabled: active || state.age < 18 || state.personalMoney < cost || state.event,
    })));
  });
  insurance.append(ig);
  root.append(insurance);

  const legal = section("Правовой статус и репутация", "Штрафы, дела, доверие и публичная репутация влияют на карьеру, документы, отношения и события.");
  const legalGrid = document.createElement("div");
  legalGrid.className = "grid";
  const unpaidFines = window.GameLegalEngine?.unpaidFines?.(state) || [];
  const firstFine = unpaidFines[0];
  const firstCase = (state.activeCases || [])[0];
  const statusData = window.GameData.legalStatuses?.[state.legalStatus] || { name: state.legalStatus, text: "" };
  legalGrid.append(
    card(statusData.name, statusData.text, `Доверие ${state.publicTrust}/100, положение ${state.socialStanding}/100.`, null),
    card("Штрафы", unpaidFines.length ? `${firstFine.reason}: ${fmt(firstFine.amount)}.` : "Неоплаченных штрафов нет.", `Всего: ${unpaidFines.length}`, button("Оплатить", () => legalAction("pay_fine", firstFine?.id), {
      disabled: !firstFine || !canAct() || state.personalMoney + state.familyMoney < (firstFine?.amount || 0),
      className: "primary",
    })),
    card("Юрист", firstCase ? `${firstCase.title}, серьезность ${firstCase.severity}/5.` : "Можно смягчить открытое дело или старый след.", firstCase ? "Активное дело" : `Судимость: ${state.criminalRecord}`, button("Нанять", () => legalAction("lawyer", firstCase?.id), {
      disabled: !canAct() || (!firstCase && state.criminalRecord < 1),
    })),
    card("Восстановить репутацию", "Публичная работа над доверием и объяснение старых ошибок.", `${fmt(Math.floor(420 * cityData().cost))}`, button("Начать", () => legalAction("restore"), {
      disabled: !canAct() || state.age < 14 || state.personalMoney < Math.floor(420 * cityData().cost),
    })),
    card("Волонтерство", "Помогает карме, доверию и социальному положению.", "1 действие", button("Помочь", () => legalAction("volunteer"), {
      disabled: !canAct() || state.age < 12,
    })),
    card("Публичное извинение", "Полезно после скандалов и потери доверия.", "1 действие", button("Извиниться", () => legalAction("apology"), {
      disabled: !canAct() || state.age < 12 || state.publicTrust > 82,
    })),
    card("Налоговая проблема", "Закрыть налоговый долг и связанные дела.", `Долг: ${fmt(state.taxDebt)}`, button("Закрыть", () => legalAction("close_tax"), {
      disabled: !canAct() || state.age < 16 || (state.taxDebt <= 0 && !(state.activeCases || []).some((item) => item.tags.includes("tax"))),
    }))
  );
  legal.append(legalGrid);
  root.append(legal);

  if ((state.activeCases || []).length || (state.pastCases || []).length || (state.legalHistory || []).length) {
    const cases = section("История статуса", "");
    const list = document.createElement("div");
    list.className = "timeline-list";
    (state.activeCases || []).slice(0, 4).forEach((item) => {
      appendTimelineEntry(list, `Активно: ${item.title}, серьезность ${item.severity}/5${item.lawyer ? ", есть юрист" : ""}.`);
    });
    (state.legalHistory || []).slice(0, 6).forEach((text) => {
      appendTimelineEntry(list, text);
    });
    cases.append(list);
    root.append(cases);
  }

  const status = section("Налоги и разрешения", "Налоги и разрешения влияют на репутацию и стресс.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [`Налоговая база: ${fmt(state.taxableIncome)}`, `Уплачено налогов: ${fmt(state.taxesPaid)}`, `Налоговый долг: ${fmt(state.taxDebt)}`, `Визы: ${state.documents.visas.length || 0}`, `Разрешение на работу: ${state.documents.workPermit ? "есть" : "нет"}`, `Правовой риск: ${window.GameLegalEngine?.legalRisk?.(state) || 0}/100`].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  status.append(tags);
  root.append(status);
  return root;
}


function renderReport() {
  const root = document.createDocumentFragment();
  const s = section("Сводка жизни", "Цель не одна: можно стать счастливым, богатым, семейным, известным, образованным или построить бизнес.");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Год: ${state.year}`,
    `Возраст: ${state.age}`,
    `Имя: ${state.firstName} ${state.lastName}`.trim(),
    `Место: ${cityName()}, ${countryName()}`,
    `Стартовая семья: ${socialClassData().name.toLowerCase()}`,
    `Район: ${state.districtQuality}/100`,
    `Доступ к образованию: ${state.educationAccess}/100`,
    `Образование: ${state.educationLevel}`,
    `Профессия: ${professionData().name}`,
    `Доход работы: ${fmt(annualSalary())}`,
    `Капитал: ${fmt(netWorth())}`,
    `Жилье: ${housingData().name}`,
    `Психика: ${state.mental}/100`,
    `Энергия: ${state.energy}/100`,
    `Внешность: ${state.looks}/100`,
    `Известность: ${state.fame}/100`,
    `Карма: ${state.karma}/100`,
    `Судимость: ${state.criminalRecord}`,
    `Кредит: ${state.creditScore}/100`,
    `Портфолио: ${state.portfolio}/100`,
    `Связи: ${state.network}/100`,
    `Вклад: ${fmt(state.assets.deposits)}`,
    `Акции: ${fmt(state.assets.stocks)}`,
    `Пенсия: ${fmt(state.assets.pension)}`,
    `Навыки: ${Math.floor(skillAverage(Object.keys(skillCatalog)))}/100`,
    `Документы: ${state.documents.passport ? "паспорт" : "без паспорта"}, ${state.documents.taxId ? "налоговый номер" : "нет налогового номера"}`,
    `Семья: родители ${livingParentCount()}/2, детей ${state.children.length}`,
    `Компания: ${state.company ? `${companySectors[state.company.sector].name}, филиалов ${state.company.branches || 0}` : "нет"}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  s.append(tags);
  root.append(s);

  const logSection = section("Журнал жизни", "Все ключевые решения и события по годам.");
  const log = document.createElement("div");
  log.className = "timeline-list";
  state.log.forEach((entry) => {
    appendTimelineEntry(log, entry);
  });
  logSection.append(log);
  root.append(logSection);
  return root;
}

function renderAchievements() {
  const root = document.createDocumentFragment();
  const unlocked = window.GameLifeSummaryEngine?.readAchievements?.() || state.achievements || [];
  const unlockedIds = new Set(unlocked.map((item) => item.id));
  const s = section("Достижения", "Достижения сохраняются между жизнями и поколениями.");
  const grid = document.createElement("div");
  grid.className = "grid";
  (window.GameLifeSummaryEngine?.achievementRules?.() || []).forEach((achievement) => {
    const item = unlocked.find((entry) => entry.id === achievement.id);
    grid.append(card(
      achievement.name,
      achievement.description,
      unlockedIds.has(achievement.id) ? `Открыто: ${item?.lifeName || "семейная история"}` : "Пока не открыто.",
      null
    ));
  });
  s.append(grid);
  root.append(s);

  const scores = section("Текущий профиль", "Оценка предварительная: финальный тип жизни считается после смерти.");
  const scoreTags = document.createElement("div");
  scoreTags.className = "tagline";
  const currentScores = window.GameLifeSummaryEngine?.calculateScores?.(state) || {};
  Object.entries(currentScores).forEach(([key, value]) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${scoreName(key)}: ${value}/100`;
    scoreTags.append(tag);
  });
  scores.append(scoreTags);
  root.append(scores);
  return root;
}

function scoreName(key) {
  return {
    money: "Деньги",
    family: "Семья",
    career: "Карьера",
    education: "Образование",
    health: "Здоровье",
    happiness: "Счастье",
    reputation: "Репутация",
    karma: "Карма",
    legal: "Право",
    fame: "Известность",
    business: "Бизнес",
    relationships: "Отношения",
  }[key] || key;
}

function renderDeathSummary() {
  const root = document.createDocumentFragment();
  const summary = state.lifeSummary || window.GameLifeSummaryEngine?.createLifeSummary?.(state, { persistAchievements: false }) || state.legacySnapshot || {};

  const hero = document.createElement("section");
  hero.className = "section death-hero";
  const heroName = summary.name || `${state.firstName} ${state.lastName}`.trim();
  const heroAge = summary.age ?? state.deathAge ?? state.age;
  const heroCause = summary.deathCause || window.GameLifeSummaryEngine?.gameDeathCause?.(state) || state.deathCause || "естественный финал";
  const heroType = summary.lifeType?.name || state.lifeType?.name || "Тихая гавань";
  const dh = document.createElement("div");
  dh.className = "death-hero-top";
  dh.innerHTML = `<div class="death-mark">✦</div>`;
  const dhText = document.createElement("div");
  const dhName = document.createElement("h2");
  dhName.className = "death-name";
  dhName.textContent = heroName;
  const dhMeta = document.createElement("p");
  dhMeta.className = "death-meta";
  dhMeta.textContent = `${heroAge} лет · ${heroType} · ${heroCause}`;
  dhText.append(dhName, dhMeta);
  dh.append(dhText);
  hero.append(dh);
  const heroCards = document.createElement("div");
  heroCards.className = "grid stat-grid";
  heroCards.append(
    statCard("Капитал", fmt(summary.netWorth ?? netWorth()), { icon: "₿", accent: "money" }),
    statCard("Счастье", `${summary.happiness ?? state.happiness}/100`, { icon: "☺", accent: "romance" }),
    statCard("Карма", `${summary.karma ?? state.karma}/100`, { icon: "☯", accent: "health" }),
    statCard("Поколение", `${summary.generation || state.generation || 1}`, { icon: "⛓", accent: "career" })
  );
  hero.append(heroCards);
  root.append(hero);

  const title = section("Итоги жизни", "");
  const tags = document.createElement("div");
  tags.className = "tagline";
  [
    `Имя: ${summary.name || `${state.firstName} ${state.lastName}`.trim()}`,
    `Поколение: ${summary.generation || state.generation || 1}`,
    `Возраст смерти: ${summary.age ?? state.deathAge ?? state.age}`,
    `Причина: ${summary.deathCause || window.GameLifeSummaryEngine?.gameDeathCause?.(state) || state.deathCause || "естественный финал"}`,
    `Тип жизни: ${summary.lifeType?.name || state.lifeType?.name || "Тихая гавань"}`,
    `Капитал: ${fmt(summary.netWorth ?? netWorth())}`,
    `Семья: родителей ${summary.family?.livingParents ?? livingParentCount()}/2`,
    `Дети: ${summary.family?.children ?? state.children.length}`,
    `Партнеры: ${summary.family?.partners ?? 0}`,
    `Карьера: ${summary.career?.title || professionData().name}, уровень ${summary.career?.level ?? state.careerLevel}`,
    `Образование: ${summary.education || state.educationLevel}`,
    `Бизнес: ${summary.business ? `${summary.business.name}, филиалов ${summary.business.branches || 0}` : "нет"}`,
    `Здоровье: ${summary.health ?? state.health}/100`,
    `Психика: ${summary.mental ?? state.mental}/100`,
    `Счастье: ${summary.happiness ?? state.happiness}/100`,
    `Известность: ${summary.fame ?? state.fame}/100`,
    `Карма: ${summary.karma ?? state.karma}/100`,
    `Репутация: ${summary.reputation ?? state.reputation}/100`,
    `Правовой статус: ${summary.legalStatus || window.GameData.legalStatuses?.[state.legalStatus]?.name || state.legalStatus}`,
    `Поколений в истории: ${(summary.generations?.history || state.familyHistory || []).length + 1}`,
  ].forEach((text) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    tags.append(tag);
  });
  title.append(tags);
  root.append(title);

  const scoreSection = section("Профиль жизни", "");
  const scoreTags = document.createElement("div");
  scoreTags.className = "tagline";
  Object.entries(summary.scores || {}).forEach(([key, value]) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `${scoreName(key)}: ${value}/100`;
    scoreTags.append(tag);
  });
  scoreSection.append(scoreTags);
  root.append(scoreSection);

  const achievements = section("Открытые достижения", "");
  const achievementGrid = document.createElement("div");
  achievementGrid.className = "grid";
  const unlocked = summary.achievements?.length ? summary.achievements : (state.unlockedAchievements || []);
  if (unlocked.length) {
    unlocked.forEach((item) => achievementGrid.append(card(item.name, item.description || "", "Новое достижение", null)));
  } else {
    achievementGrid.append(card("Новых достижений нет", "Уже открытые достижения доступны в отдельном экране.", "", null));
  }
  achievements.append(achievementGrid);
  root.append(achievements);

  const events = section("Ключевые события", "");
  const log = document.createElement("div");
  log.className = "timeline-list";
  (summary.keyEvents || state.log.slice(0, 10)).forEach((entry) => {
    appendTimelineEntry(log, entry);
  });
  events.append(log);
  root.append(events);

  const succession = section("Наследие", "");
  const childGrid = document.createElement("div");
  childGrid.className = "grid";
  if (state.children.length) {
    state.children.forEach((child) => {
      childGrid.append(card(child.name, "", `Возраст: ${ageText(child.age)}. Связь ${child.bond}/100.`, button("Продолжить жизнь", () => {
        window.GameStorage.continueAsChild(child.id);
      }, { className: "primary" })));
    });
  } else {
    childGrid.append(card("Наследников нет", "", "Можно начать новую историю с экрана создания персонажа.", button("Новая жизнь", () => {
      window.GameStorage.resetGame();
    })));
  }
  succession.append(childGrid);
  root.append(succession);

  const historyItems = window.GameStorage.readGenerationHistory();
  if (historyItems.length) {
    const history = section("История поколений", "");
    const historyLog = document.createElement("div");
    historyLog.className = "timeline-list";
    historyItems.slice(0, 8).forEach((item) => {
      appendTimelineEntry(historyLog, `${item.generation || 1} поколение: ${item.name}, ${item.age} лет, ${item.lifeType?.name || "Ровное пламя"}, капитал ${fmt(item.netWorth || 0)}.`);
    });
    history.append(historyLog);
    root.append(history);
  }
  return root;
}

function renderContent() {
  const views = {
    life: renderLife,
    activities: renderActivities,
    family: renderFamily,
    world: renderWorld,
    education: renderEducation,
    career: renderCareer,
    health: renderHealth,
    skills: renderSkills,
    money: renderMoney,
    home: renderHome,
    assets: renderAssets,
    business: renderBusiness,
    relationships: renderRelationships,
    docs: renderDocuments,
    report: renderReport,
    achievements: renderAchievements,
  };
  const root = document.createDocumentFragment();
  if (state.event) root.append(renderEvent());
  root.append(views[state.tab]());
  els.content.replaceChildren(root);
}

function render() {
  const app = document.querySelector(".app");
  const isCreator = getAppMode() === "creator";
  const isDeath = getAppMode() === "death";
  app.classList.toggle("creator-mode", isCreator);
  app.classList.toggle("death-mode", isDeath);
  if (isCreator) {
    els.subtitle.textContent = "Настройте новую жизнь или доверьте старт случайности.";
    els.notice.textContent = "";
    els.save.disabled = true;
    els.endYear.disabled = true;
    els.content.replaceChildren(renderCreator());
    return;
  }
  if (isDeath) {
    els.save.disabled = false;
    els.subtitle.textContent = `Жизнь завершена: ${state.deathAge ?? state.age} лет.`;
    els.notice.textContent = state.lifeType ? `Тип жизни: ${state.lifeType.name}.` : "";
    els.endYear.disabled = true;
    els.content.replaceChildren(renderDeathSummary());
    return;
  }
  els.save.disabled = false;
  els.subtitle.textContent = `${ageText(state.age)}. ${cityName()}, ${countryName()}.`;
  els.notice.textContent = state.event ? `${state.event.title}: ${state.event.description || state.event.text}` : state.message;
  els.endYear.disabled = Boolean(state.event);
  els.endYear.textContent = state.event ? "Сначала выберите событие" : "Прожить год";
  renderStats();
  renderTabs();
  renderContent();
}

  window.GameUI = { els, render };
})();
