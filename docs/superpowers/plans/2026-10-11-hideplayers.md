# HidePlayers Implementation Plan

**Goal:** Port HidePlayers 1.3.2 to s2script with native clientprefs.
**Architecture:** One plugin adapter plus a config parser; native engine filtering
and cookie storage, packaged with translations and installation instructions.
**Tech stack:** TypeScript, SDK 0.28.0, CS2 0.19.3, Node test runner and esbuild.
**Spec:** `../specs/2026-10-11-hideplayers-design.md`.

## Constraints and review focus

Keep upstream behavior and GPL license. No custom database or engine gamedata.
Check observer pawn versus player pawn, cookie-load races, stale connection
handles, reused entity indices, and malformed reloads. These cases need tests.

## Steps

- [x] Write failing behavioral tests in `test/plugin.test.mjs` with the engine
  boundary in `test/harness.mjs`; demonstrate missing command/visibility behavior.
- [x] Implement config parsing in `src/config.ts` and lifecycle, command, cookie,
  and visibility handling in `src/plugin.ts`; run `npm test`.
- [x] Preserve translations and license, document installation and live checks,
  and create `scripts/package.mjs` for a ready-to-extract archive.
- [x] Run `npm test`, `npm run typecheck`, and `npm run package`; inspect archive.
- [x] Get an independent review, resolve functional findings and rerun checks.

## Execution notes

Work proceeds in the requested empty project directory. It has no Git history;
there is no existing branch to isolate or commit. No server deployment is requested.

22 tests failed against the empty entry point, then passed against the port.
TypeScript and the official SDK build pass. The install ZIP was checked for its
manifest, translation JSON, matching source contents and absence of an operator
config overwrite. Tests use Node's in-process runner because this environment
rejects subprocess test reporting. Packaging uses fflate to avoid that same
subprocess restriction with external ZIP tools.

Review found expensive per-frame schema wrapper allocation. Added a failing
regression test and cached the live wrappers by connection/controller/pawn
identity, with map cleanup. Disabled viewers do not create observer views.

Final review found no further actionable issues. Its real-schema benchmark of
64 enabled viewers measured 0.051 ms per stable frame for observer views versus
9.65 ms before caching (not a full server tick benchmark). All 23 tests,
typechecking, SDK build, packaging and final archive checks pass. No live CS2
server test was performed.
