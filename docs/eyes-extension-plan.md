# jsOrrery Extension Plan (Eyes‑Style)

This plan extends jsOrrery with a modern, route‑driven UX inspired by NASA’s Eyes, while keeping jsOrrery’s analytic ephemerides (no Dynamo assets). It is organized into phases that can be implemented incrementally.

## Goals
- Route‑driven UI with shareable links and readable titles
- Layer toggles, telescope/compare/events views, search over entities
- Story/tour playback with deep‑links
- Progressive preload and optional embed gate
- Maintain performance and modularity via small “manager” modules

## Guiding Principles
- Inversion of control: managers/components registered by key and looked up via a lightweight registry
- Route‑driven state: URL is the source of truth; managers derive and sync state
- Content as data: entities and stories defined in JSON/ES modules
- Progressive UX: preload screen and optional embed interaction gate

## Phases

1) Registry + Public API
- Add a lightweight app registry (Types) for managers/components
- Expose a small public API: `initReady`, `navigate`, `selectEntity`, `toggleLayer`, `setTime`, `goToEntity`, `followEntity`

2) Routing + Titles
- RouterManager: hash routes for `home`, `object`, `telescope`, `distance`, `compare`, `events`, `story`
- TitleManager: builds document titles from routes + entity metadata

3) Layers + Panel
- LayerManager: named layers mapped to jsOrrery features (ui, planets, trails, labels, icons, optional asteroids/comets/dwarfs/constellations)
- LayerPanel: UI to toggle layers with sensible defaults per view

4) Entities + Search
- EntityRegistry: normalize jsOrrery bodies (id, names, category, radii, parents)
- SearchManager: text search across entity metadata; integrates with selection and routing

5) Preload + Embed
- PreloadManager: starfield loading + progress; `?embed=true` or `?interactPrompt=true` gate
- Public helpers: `hideLoadingScreen()`, `updateProgress(%)`, `showEmbedViewButton()`, `showEmbedInteraction()`

6) Camera Follow + Presets
- CameraFollowManager: follow selected/explicit entity, toast/undo, reframe, simple presets
- `goToEntity()` transitions with duration, distance, up vector, easing

7) Views
- Object: entity info, layer defaults, quick actions
- Telescope: entity‑locked camera with simplified UI
- Compare: side‑by‑side stats/scale compare; camera transitions
- Events: dated entries per entity; selecting focuses camera/time
- Distance: readouts between bodies (optional)

8) Stories/Tours
- Data: `STORY_LIST` + `STORIES` with slides (description, images, camera script, time)
- AutoplayManager: next/prev slide, scripted time/camera/layer changes; deep‑link via `?slide=slide_X`

9) Performance + Assets
- Keep analytic motion (no Dynamo); reuse jsOrrery resources
- Progressive loading for heavy visuals (labels/trails)
- Device heuristics for label/trail density by DPI/viewport

10) QA + Docs
- Acceptance tests for routing, titles, selection/follow, layers, stories, preload
- Developer docs for managers, routes, story format, and public API

## Concrete Mapping (proposed paths)
- `src/app/registry/Types.js`
- `src/app/router/RouterManager.js`
- `src/app/title/TitleManager.js`
- `src/app/layers/LayerManager.js`, `src/ui/LayerPanel.js`
- `src/app/content/EntityRegistry.js`
- `src/app/search/SearchManager.js`
- `src/app/preload/PreloadManager.js` (+ `src/styles/preload.scss`)
- `src/app/camera/CameraFollowManager.js`
- `src/views/{home,object,telescope,compare,events,story}/index.js`
- `src/content/stories/index.{js,json}`
- `src/app/api.js`

## Milestones (6–8 weeks)
- W1: Registry + Router + Title (home/object routes)
- W2: Layers + Panel + defaults per view
- W3: Entities + Search + selection workflow
- W4: Preload + Camera Follow + UX polish
- W5–6: Views (telescope/compare/events) + route integration
- W7: Stories/Tours + deep‑links + autoplay
- W8: Performance pass + docs + acceptance polish

## Acceptance Criteria (examples)
- `#/mars` focuses camera on Mars; title “Mars”
- `#/mars/telescope` locks camera; UI adapts to telescope mode
- `#/earth/compare?id=mars` renders scale/metadata compare
- `#/jupiter/events` lists events; selecting moves time/camera
- `#/story/voyager?slide=slide_3` loads that slide and positions time/camera
- `?embed=true` shows “View 3D” gate and hides on interaction
- Public API methods work consistently across views

## Optional Enhancements
- Persist layer defaults and camera prefs (localStorage)
- Short share links
- Accessibility pass (keyboard, focus, reduced motion)
- Analytics hooks behind a config flag

---
This plan keeps jsOrrery self‑contained and asset‑independent while delivering “Eyes”‑like UX. Phases are decoupled so we can ship incremental value and validate along the way.
