# Wildwood project guide

## Architecture

Wildwood is a static ES2022 browser game. `index.html` maps `three` to the vendored Three.js 0.160.0 module. `main.js` loads the recovery save and starts `core/Engine.js`. There is no browser framework, bundler, or compilation step.

- `core/`: coordination, input and pointer lock, settings, synthesized audio.
- `world/`: stable block IDs, seed noise, terrain generation, lighting, chunk ownership, streaming.
- `workers/`: module worker combining generation, lighting, and meshing.
- `render/`: procedural atlas, WebGL rendering, chunk mesher, sky cycle, particles and dropped items.
- `player/`: fixed-step movement, swept collision, voxel DDA.
- `ui/`: DOM inventory, recipes, HUD, dialogs and guide content.
- `save/`: browser recovery cache and serialized cloud-save requests.
- `db/schema.ts`: Drizzle source of truth for worlds and sparse edited chunks.
- `netlify/functions/world.mts`: anonymous cookie-scoped save endpoint at `/api/world`.
- `netlify/database/migrations/`: generated migration and snapshot for deployment.
- `vendor/`: pinned Three.js source and license; no runtime CDN request.

## Conventions

Use explicit relative `.js` imports in browser modules. Workers must not import Three.js or DOM modules; browser import maps do not apply inside workers. Preserve stable block IDs because saves store numeric values. Add JSDoc for public methods and keep system responsibilities separate. Do not introduce another browser runtime dependency or a build requirement.

Y points up. Voxel buffers are Y-major: `(y * width + z) * width + x`. Standard chunks are 16 × 16 columns and 128 blocks high. Use floor division and positive modulo for negative world coordinates. Terrain edits must go through `World.setBlock`, which synchronizes collision, increments mesh revisions, records sparse diffs, and schedules neighboring remeshes. Do not mutate generated geometry each frame.

Worker messages transfer ArrayBuffers; job headers contain task ID, chunk X/Z, and revision, followed by edit quadruples. Main-thread upload validates revisions. Worker pool capacity is `max(2, hardwareConcurrency - 1)` and workers start lazily. GPU uploads are limited to two per frame with a four-millisecond scheduling window. This is a scheduling policy, not a measured frame-time guarantee.

Transparent blocks share a separate material/pass. The atlas uses 16px tiles plus one-pixel duplicated gutters, nearest filtering, and no mipmaps. Torch lighting is fully cleared and recomputed over a widened neighborhood so removal does not retain stale light. Ordinary skylight has a narrow halo and needs visual boundary verification.

## Persistence and deployment

Browser localStorage is a recovery cache explicitly required by the game specification. Netlify Database provides the platform-backed durable copy. The browser game does not import the backend packages. Cloud saves use an HttpOnly, same-site anonymous cookie; clients cannot choose another save slot. No accounts or login UI are implemented. Localhost runs without cloud requests.

Keep schema and generated migrations synchronized. Use the beta Drizzle packages required by the Netlify adapter. Never apply deployment migrations manually. Netlify serves the repository as static output and bundles the function separately.

## Product choices and current verification

The initial seed is `wildwood`. A deterministic grassy clearing reduces unsafe first spawns. Creative provides unlimited blocks and flight; survival starts with useful building supplies. Workbench recipes accept a bench in the inventory or within three blocks. Death retains inventory and buildings. Berry drops and cosmetic particles use nondeterministic randomness; terrain does not.

All visual assets and sounds are generated in code. The mining overlay is staged wireframe geometry, not a branching crack texture. Browser runtime and performance acceptance have not been measured. First verify enter/move/mine/craft/place/reload/respawn, then profile render distance eight and five-minute memory stability. Check touch controls, pointer-lock transitions, skylight seams, torch removal, water sorting, and sea-only respawn cases. Do not describe unexecuted checks as passing.
