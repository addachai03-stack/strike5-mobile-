# STRIKE 5 V6 — Tactical Inspection + Combat Polish

## New playable prototype improvements
- Separate 3D tactical operator inspection inside 5v5 bot lobby (12 Indian character palettes and role-based gear shapes).
- 3D weapon inspection mode for 17 original fictional guns (type-sensitive procedural silhouettes).
- Drag/swipe horizontally to rotate operator or weapon; auto-spins when idle.
- 2D fallback drawing when WebGL is unavailable, instead of a blank inspector.
- Loadout bridge updates selected operator, weapon and armor labels in lobby.
- AI bot arm/leg swing animation during movement.
- Visible first-person weapon recoil during firing/reloading.
- During menus, game battlefield rendering pauses to reduce mobile GPU load while the inspector is visible.
- Offline Android and PWA assets include preview scripts/styles and bundled Babylon engine.

## Tested and limitations
- Local Chromium test of prototype navigation and fallback paths passed; headless environment has no WebGL support.
- Procedural low-poly characters and guns; custom realistic 3D assets/textures/rigged animations remain future work.
- No online multiplayer. One human player + 9 bots in a local 5v5 match.
- Android and iOS real-device FPS/gesture quality require device testing; don't claim photorealism.
