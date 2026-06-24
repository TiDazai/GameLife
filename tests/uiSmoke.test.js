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
