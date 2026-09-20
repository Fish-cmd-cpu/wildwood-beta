# Wildwood

A desktop-first browser voxel sandbox with an infinite seeded wilderness, a live world behind its welcome screen, survival and creative modes, crafting, and persistent player edits.

## DEVLOG

The game uses vanilla ES2022 modules and a local HTML import map. Three.js 0.160.0 is vendored with its license; no CDN, image, font, or sound requests are required for gameplay. Textures and sound are generated at runtime. A static server runs the client without installation or a build.

Coordinates are Y-up; chunks span 16 × 16 × 128 Y, with bedrock at zero and sea level 62. Floor division handles negative coordinates. Mulberry32-seeded value noise drives terrain, climate, caves, and ores. A small deterministic clearing makes the first spawn approachable.

A lazily allocated worker pool allows max(2, hardwareConcurrency − 1) jobs. Workers transfer voxel and interleaved mesh buffers. Padded terrain sampling includes neighboring tree roots. Each chunk has separate opaque and transparent meshes, hidden-face culling, corner AO, column skylight with flood propagation, and recalculated torch lighting. Clearing the old light field is the removal pass. The main thread uploads at most two chunks per frame, subject to a four-millisecond scheduling window, and disposes distant geometry.

Physics uses swept per-axis AABB collision at 60 Hz, interpolated camera positions, coyote time, and solid boundaries around unloaded terrain. Rendering does not regenerate meshes each frame.

The proposed module layout is retained, with Audio.js added for synthesized sound. Browser localStorage provides save persistence. Death retains belongings. Simple recipe-based crafting avoids a complex crafting grid.

## Run locally

Use any local static server at the repository root, for example:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Do not open `index.html` directly with a `file:` URL: module workers require HTTP. Browser gameplay needs no npm install or build. Saves are stored in browser localStorage.

## Playing

Choose Survival or Creative and select **Enter the world**. The opening scene is the generated game world.

- WASD: move; Space: jump or swim up; Shift: sprint; Ctrl: crouch.
- Mouse: look; hold left click: mine; right click: place or eat selected berries.
- Number keys or wheel: select a hotbar slot; middle click: pick a block.
- E: inventory and recipes; drag stacks between slots, or click two slots to swap.
- Q: drop an item; F: toggle flight in Creative; Space/Ctrl: fly up/down.
- Esc: pause and settings; F3: actual FPS, coordinates, chunks, and draw calls.
- Touch: left stick moves, dragging the world looks, tapping mines, and holding places.

Logs make planks; planks make a workbench. Keep the workbench in your inventory or place it nearby to unlock advanced recipes. Mine coal for torches and gather berries from leaves. Creative mode has a block palette and unlimited placement. Saves run after edits, every 30 seconds, and when pausing. All save data is stored in browser localStorage.

## FILE MANIFEST

```text
.
├── index.html
├── styles.css
├── main.js
├── README.md
├── AGENTS.md
├── package.json
├── core/
│   ├── Engine.js
│   ├── Input.js
│   ├── Settings.js
│   └── Audio.js
├── world/
│   ├── World.js
│   ├── Chunk.js
│   ├── TerrainGen.js
│   ├── Noise.js
│   ├── Blocks.js
│   └── Lighting.js
├── workers/
│   └── chunkWorker.js
├── render/
│   ├── Renderer.js
│   ├── ChunkMesher.js
│   ├── TextureAtlas.js
│   ├── Sky.js
│   └── Particles.js
├── player/
│   ├── Player.js
│   ├── Physics.js
│   └── Raycast.js
├── ui/
│   ├── HUD.js
│   ├── Inventory.js
│   └── Menus.js
├── save/
│   └── SaveManager.js
└── vendor/
    ├── three.module.js
    └── THREE-LICENSE.txt
```

All source is in the listed files. Third-party browser code is limited to the pinned Three.js module.

## ACCEPTANCE REPORT

Implementation was reviewed by reading source. No browser, development server, build, or test suite was run. Consequently, runtime acceptance is not represented as a measured PASS.

1. **NOT VERIFIED** — Static imports and module paths were reviewed; console-clean loading still needs browser verification.
2. **IMPLEMENTED; NOT VERIFIED** — Radial chunk streaming, deterministic padded boundaries, and cross-boundary tree sampling are present; inspect seams while walking.
3. **IMPLEMENTED; NOT VERIFIED** — Swept collision, fixed steps, spawn checks, and solid unloaded boundaries are present; exercise corners, ceilings, and low frame rates.
4. **IMPLEMENTED; NOT VERIFIED** — Collision edits apply synchronously; worker meshes update asynchronously. Sparse browser saves exist; reload checks remain.
5. **IMPLEMENTED; NOT VERIFIED** — The active-play solar cycle uses 600 seconds and updates light, sky, and fog.
6. **IMPLEMENTED; NOT VERIFIED** — Terrain includes five biome categories, trees, caves, coal, and iron; discoverability requires playtesting.
7. **NOT VERIFIED** — No target-laptop 1080p/render-distance-eight benchmark has been collected.
8. **NOT VERIFIED** — Distant GPU disposal and bounded transient pools are implemented; a five-minute memory profile remains necessary.
9. **IMPLEMENTED; NOT VERIFIED** — Nine hotbar slots, a 36-slot inventory, recipes, creative palette, and starter building supplies are present; interaction testing remains.
10. **IMPLEMENTED; NOT VERIFIED** — Terrain derives from seeded coordinate hashes rather than generation order; compare repeated seed samples in a browser.

The mining effect currently uses a staged wireframe overlay, rather than a branching crack texture. Boundary skylight continuity, torch removal, transparent sorting, pointer-lock fallback, touch gestures, and long-session playability need focused browser review. The first follow-up should be an end-to-end browser session covering enter, move, mine, craft, place, reload, and respawn before performance tuning.
