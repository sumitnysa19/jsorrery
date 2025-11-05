// Readable SolarSystemApp shell intended for a future migration away from the bundled app.js
// Not wired into index.html yet; safe to import in dev contexts.

/*
  Design goals
  - Mirror the high-level lifecycle: init -> managers -> scene -> components -> routes
  - Rely on window.Pioneer for core framework classes until we fully de-bundle
  - Keep this file side-effect free (no auto-init) so it won’t interfere with prod
*/

export class SolarSystemAppShell {
  constructor({ Pioneer = window.Pioneer } = {}) {
    if (!Pioneer || !Pioneer.BaseApp) {
      throw new Error('Pioneer BaseApp not available. Ensure bundles are loaded.');
    }
    this.Pioneer = Pioneer;

    // Create a minimal BaseApp-compatible wrapper delegating to Pioneer
    const BaseApp = Pioneer.BaseApp;
    const self = this;
    this.AppClass = class SolarSystemApp extends BaseApp {
      constructor() {
        super(self.Pioneer.Types);
        // Wire registries here when migrating (timeInfo, sceneInfo, views, components)
        this._timeInfo = undefined;
        this._sceneInfo = undefined;
        this._viewClasses = {};
        this._viewInfo = undefined;
        this._componentInfo = undefined;
      }

      async init() {
        await super.init();
        // Hook: run app-specific tweaks after base is ready
        // e.g., self.getPreload().hideLoadingScreen();
        const preload = self.getPreload();
        preload?.updateEmbedLoadPercent?.(50);
      }

      setUpRoutes() {
        const router = this.getManager('router');
        if (!router) return;
        router.addRoutes([
          { route: router.homeRoute, view: 'home' },
          { route: '/story/:id', view: 'story' },
          { route: '/:object', view: 'object' },
          { route: '/:object/telescope', view: 'object' },
          { route: '/:object/compare', view: 'compare' },
          { route: '/:object/events/:child?', view: 'events' },
        ]);
      }

      async setUpManagers() {
        // Example wiring; adjust when migrating real registries
        // this.addManager('content', Pioneer.ContentManager, /* data */);
        // this.addManager('search', Pioneer.SearchManager);
        // this.addManager('title', Pioneer.TitleManager, /* parseFn */);
        // this.addManager('cameraFollow', Pioneer.CameraFollowManager);
      }

      async setUpComponents() {
        // Toggle default layers / set initial UI component state here when migrating
        // const lyr = this.getManager('layer');
        // lyr.toggleLayer('planets', true);
      }
    };
  }

  getPreload() {
    // Access the bundled PreloadManager instance if available via module 743
    // In the minified app, an instance is used and methods are called directly.
    // Here we try to use what app.js exposed:
    return window.app ? null : null; // placeholder; usable after migration
  }

  // For dev use: create and init the shell without replacing prod app
  async startDev() {
    const App = this.AppClass;
    const app = new App();
    await app.init();
    return app;
  }
}

export default SolarSystemAppShell;

