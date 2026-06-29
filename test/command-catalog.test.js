import test from "node:test";
import assert from "node:assert/strict";
import { loadCommandCatalog } from "../src/command-catalog.js";

test("loads full gh command coverage catalog from docs", async () => {
  const catalog = await loadCommandCatalog();
  assert.ok(catalog.length >= 100);
  assert.ok(catalog.some((entry) => entry.command === "gh release create"));
  assert.ok(catalog.some((entry) => entry.command === "gh api <endpoint>"));
  assert.ok(catalog.every((entry) => entry.argsText && entry.surface && entry.pathType));
});
