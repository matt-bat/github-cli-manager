import test from "node:test";
import assert from "node:assert/strict";
import { buildAuthLoginArgs } from "../src/setup.js";

test("builds browser-based GitHub CLI auth command for novice setup", () => {
  assert.deepEqual(buildAuthLoginArgs(), [
    "auth",
    "login",
    "--web",
    "--git-protocol",
    "https",
    "--hostname",
    "github.com"
  ]);
});
