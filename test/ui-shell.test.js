import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

test("Electron renderer uses relative assets for file loading", () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.doesNotMatch(html, /href="\//);
  assert.doesNotMatch(html, /src="\//);
});

test("primary workspace exposes grouped accessible tabs", () => {
  const expectedTabs = [
    "home",
    "work",
    "repository",
    "automation",
    "security",
    "explore",
    "advanced",
    "activity",
    "settings"
  ];

  for (const tab of expectedTabs) {
    assert.match(html, new RegExp(`data-tab="${tab}"[^>]+role="tab"`));
    assert.match(html, new RegExp(`id="${tab}"[^>]+role="tabpanel"`));
  }
  assert.match(html, /role="tablist" aria-label="Primary workspace"/);
});
