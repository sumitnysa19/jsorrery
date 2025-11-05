// Lightweight public API over the prebuilt Eyes app (window.app)
// Exposes stable helpers to script the app without touching minified internals.
;(function initEyesAPI() {
  if (window.Eyes) return; // idempotent

  function waitFor(check, { interval = 50, timeout = 20000 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        try {
          const val = check();
          if (val) return resolve(val);
        } catch (e) {
          // ignore and keep polling
        }
        if (Date.now() - start > timeout) {
          return reject(new Error('Eyes waitFor() timeout'));
        }
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  async function waitForAppReady() {
    // Wait for window.app to exist
    await waitFor(() => window.app);
    const app = window.app;
    // Wait for the scene manager and its load barrier if available
    const sceneMgr = app?.getManager && app.getManager('scene');
    if (sceneMgr?.getLoadedPromise) {
      try {
        await sceneMgr.getLoadedPromise();
      } catch (_) {
        // If getLoadedPromise throws, continue; app may still be usable
      }
    }
    return app;
  }

  const Eyes = {
    // Resolve when the app and main scene are ready
    initReady: () => waitForAppReady(),

    // Access raw app instance (after it exists)
    get app() { return window.app; },

    // Routing
    navigate(to) {
      const r = window.app?.getManager('router');
      if (!r || typeof r.navigate !== 'function') throw new Error('Router not available');
      return r.navigate(to);
    },

    // Selection
    selectEntity(id) {
      const sel = window.app?.getManager('selection');
      if (!sel || typeof sel.selectEntity !== 'function') throw new Error('Selection manager not available');
      return sel.selectEntity(id);
    },
    unselect() {
      const sel = window.app?.getManager('selection');
      if (!sel || typeof sel.unselect !== 'function') throw new Error('Selection manager not available');
      return sel.unselect();
    },

    // Layers
    toggleLayer(name, visible, opts = {}) {
      const lyr = window.app?.getManager('layer');
      if (!lyr || typeof lyr.toggleLayer !== 'function') throw new Error('Layer manager not available');
      return lyr.toggleLayer(name, opts, visible);
    },

    // Time
    setTime(time) {
      const tm = window.app?.getManager('time');
      if (!tm || typeof tm.setTime !== 'function') throw new Error('Time manager not available');
      const val = time instanceof Date ? time.toISOString() : time;
      return tm.setTime(val);
    },

    // Camera
    async goToEntity(id, options = {}) {
      const cm = window.app?.getManager('camera');
      if (!cm || typeof cm.goToEntity !== 'function') throw new Error('Camera manager not available');
      return cm.goToEntity(id, options);
    },

    // Camera follow
    async followEntity(id) {
      const cf = window.app?.getManager('cameraFollow');
      if (!cf || typeof cf.follow !== 'function') throw new Error('CameraFollow manager not available');
      return cf.follow(id);
    },
    unfollow() {
      const cf = window.app?.getManager('cameraFollow');
      if (!cf || typeof cf.unfollow !== 'function') throw new Error('CameraFollow manager not available');
      return cf.unfollow();
    },
  };

  Object.defineProperty(Eyes, 'version', { value: 'api-0.1', enumerable: true });
  window.Eyes = Eyes;
})();

