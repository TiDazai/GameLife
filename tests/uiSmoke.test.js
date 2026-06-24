const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const render = fs.readFileSync("ui/render.js", "utf8");

function test(name, run) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("layout exposes theme toggle and bottom navigation", () => {
  assert(html.includes('id="themeButton"'));
  assert(html.includes('id="bottomNav"'));
  assert(render.includes("bottomTabs"));
  ["Жизнь", "Действия", "Отношения", "Карьера", "Деньги", "Здоровье", "Сводка"].forEach((label) => {
    assert(render.includes(label));
  });
});

test("events render as modal cards", () => {
  assert(render.includes("event-overlay"));
  assert(render.includes("event-modal"));
  assert(css.includes(".event-overlay"));
  assert(css.includes(".event-modal"));
});

test("timeline and visual state classes are present", () => {
  ["is-success", "is-risk", "is-danger", "is-important", "is-death", "is-achievement"].forEach((name) => {
    assert(css.includes(name));
  });
  assert(render.includes("appendTimelineEntry"));
  assert(css.includes(".timeline-list"));
});

test("dark theme and responsive breakpoints are present", () => {
  assert(css.includes('body[data-theme="dark"]'));
  assert(render.includes("gamelife-ui-theme"));
  assert(css.includes("@media (min-width: 720px)"));
  assert(css.includes("@media (min-width: 1080px)"));
  assert(css.includes("@media (max-width: 520px)"));
});

test("dark theme is the default and light is an opt-in", () => {
  // currentTheme() returns "dark" unless the user explicitly stored "light".
  assert(render.includes('=== "light" ? "light" : "dark"'));
  assert(css.includes('body[data-theme="light"]'));
});

test("reusable premium UI helpers are defined", () => {
  ["function statCard", "function progressBar", "function badge", "function badgeRow", "function personCard", "function emptyState", "function filterChips", "function stackedBar", "function modalCard"].forEach((sig) => {
    assert(render.includes(sig), `missing helper: ${sig}`);
  });
  [".stat-card", ".progress", ".badge", ".person-card", ".empty-state", ".chip", ".stack-bar"].forEach((klass) => {
    assert(css.includes(klass), `missing css: ${klass}`);
  });
});

test("adult 18+ relationship block is gated behind isUnlocked", () => {
  // The block only renders when the engine reports it unlocked (adult partner, 18+).
  assert(render.includes("function renderAdultRelationships"));
  assert(render.includes("isUnlocked"));
  assert(render.includes("return null"));
  assert(render.includes("Близость 18+"));
  assert(render.includes('badgeRow([["18+", "adult"]])'));
});

test("action center renders catalog with search, filters and badges", () => {
  assert(render.includes("function renderDataActions"));
  assert(render.includes("actionSearch"));
  assert(render.includes("filterChips"));
  assert(render.includes("actionBadges"));
  assert(render.includes("Показать ещё"));
  // age-adapted "child version" badge wiring
  assert(render.includes("детская версия"));
});

test("world tab supports region + search filters without breaking render", () => {
  assert(render.includes("function renderWorld"));
  assert(render.includes("worldRegion"));
  assert(render.includes("worldSearch"));
  assert(render.includes("buildList"));
});

test("money tab shows a CSS-only capital structure bar", () => {
  assert(render.includes("Структура капитала"));
  assert(render.includes("stackedBar"));
  assert(css.includes(".stack-seg"));
});

test("death summary renders a premium hero with stat cards", () => {
  assert(render.includes("function renderDeathSummary"));
  assert(render.includes("death-hero"));
  assert(render.includes("Итоги жизни"));
  assert(css.includes(".death-hero"));
});

test("creator screen renders character creation", () => {
  assert(render.includes("function renderCreator"));
});

test("scroll preservation helpers exist and wrap render", () => {
  // render() saves/restores window scroll so same-tab actions don't jump to top.
  assert(render.includes("function renderApp"));
  assert(render.includes("scrollToContentStart"));
  assert(render.includes("requestScrollReset"));
  assert(render.includes("window.scrollTo"));
  assert(render.includes("lifeIdentity"));
});

test("creator name placeholder follows the selected country", () => {
  assert(render.includes("updateNamePlaceholders"));
  assert(render.includes("placeholderFor"));
});

test("action center surfaces contextual recommended actions", () => {
  assert(render.includes("function getRecommendedActions"));
  assert(render.includes("function renderRecommendedActions"));
  assert(render.includes("Рекомендуем сейчас"));
  // each recommendation explains why it is shown
  assert(render.includes("reco-why"));
  assert(render.includes("потому что"));
});

test("life screen shows prioritized 'what matters now' alerts", () => {
  assert(render.includes("function getLifeAlerts"));
  assert(render.includes("function renderLifeAlerts"));
  assert(render.includes("Что важно сейчас"));
  assert(css.includes(".alert-list"));
  assert(css.includes(".alert-item"));
});

test("creator is a stepped wizard with quick start + live preview", () => {
  assert(render.includes("creator-stepper"));
  assert(render.includes("creator-step-panel"));
  assert(render.includes("Быстрый старт"));
  assert(render.includes("Случайная жизнь"));
  assert(render.includes("creator-preview"));
  // five named steps
  ["Кто вы", "Где вы родились", "Семья и среда", "Характер", "Цель жизни"].forEach((s) => {
    assert(render.includes(s), `missing creator step: ${s}`);
  });
  assert(css.includes(".creator-stepper"));
  assert(css.includes(".creator-step-panel"));
});

test("palette is calmer: graphite/blue/cyan with named severity tokens", () => {
  // the neon indigo-violet primary is gone
  assert(!css.includes("#7c6cff"), "old violet accent still present");
  // explicit semantic severity tokens exist (risk=orange, danger=red, success=green)
  assert(css.includes("--risk:"));
  assert(css.includes("--danger:"));
  assert(css.includes("--success:"));
});

test("sticky live-year footer shows a compact year preview", () => {
  assert(html.includes('id="yearPreview"'));
  assert(render.includes("function renderYearPreview"));
  assert(render.includes("Действий за год"));
  // active event blocks living and prompts a choice
  assert(render.includes("Сначала выберите событие"));
  assert(css.includes(".year-preview"));
  assert(css.includes(".year-pill"));
  assert(css.includes("position: sticky")); // footer stays in view
});

test("activities tab is a single action surface, not a duplicate grid", () => {
  // renderActivities must only compose recommendations + the data-driven catalog,
  // with no parallel legacy "manual activities" grid.
  const start = render.indexOf("function renderActivities");
  assert(start >= 0, "renderActivities missing");
  const body = render.slice(start, start + 600);
  assert(body.includes("renderRecommendedActions"));
  assert(body.includes("renderDataActions"));
  assert(!body.includes("activityCard("), "legacy activityCard grid still present in renderActivities");
});
