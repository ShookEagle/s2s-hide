# HidePlayers s2script port

The requested deliverable is a working port of edgegamers/CS2-HidePlayers as-is,
using s2script client preferences. This is a new plugin in an empty workspace.

Reference: HidePlayers 1.3.2, commit d9b6ce0008be45ecd983f3c7fa402b0286721e20.
API reference: s2script commit 86d1de3ba7366b08f7e8bb0db34ca2a1e84415d7;
published SDK 0.28.0 and CS2 types 0.19.3.

Preserve `css_hidemodels;css_hide`, chat aliases, root-only `css_hide_reload`,
`cmds`, `who_hidden`, `ConfigVersion: 3`, the three modes, unknown-mode fallback
to all, English/Russian feedback, and public cookie `hide_player_status` with
`True`/`False` values. Hiding defaults off. Self and observer viewers see models;
targets include bots and dead/dying pawns, matching the upstream condition.
Only player-pawn transmission is changed, not damage, collisions or sounds.

Use raw `configs/HidePlayers.json` through the public config API to retain the
original JSON format and explicit reload behavior. Command changes need a plugin
reload, as upstream registers them at startup. Malformed reloads retain the last
working configuration. Register unprefixed chat aliases because s2script does
not strip `css_` automatically.

Use `Cookies.register/get/set/areCached` with the bundled clientprefs module as
the sole persistence writer. Save on toggle because disconnect handles cannot
be written in s2script. An admission failure leaves the toggle session-local,
reports the failure, and retries while that connection remains alive. Cookie
loads must not overwrite a pending choice. Accepted writes are host-owned.

Read all connected players after simulation. Use the controller's actual
`m_hPawn` via `wrapEntity` for observer detection, and `playerPawn` for targets.
Apply native `Transmit.setVisibleTo` rules only when their allowed viewer set
changes, and remove obsolete rules. Clean up on map transitions and unload.

Validation: test actual bundled plugin callbacks with engine API test doubles,
covering modes, spectators, commands, cookie lifecycle, recycled slots/entities,
config errors and cleanup; run TypeScript and the official SDK build. A live CS2
server is still required to verify actual network transmission and database IO.
