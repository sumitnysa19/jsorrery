// Dev-only shim to suppress DynamoController network loads and errors.
// This disables time-varying motion for any entity using Dynamo, leaving
// their last/initial transforms unchanged (limited visuals).
;(function disableDynamo() {
  function ready(fn) {
    if (document.readyState === 'complete') return fn();
    window.addEventListener('load', fn, { once: true });
  }
  ready(() => {
    const P = window.Pioneer;
    if (!P || !P.DynamoController) return;
    try {
      const DC = P.DynamoController;
      const proto = DC.prototype;
      // Prevent fetching def.dyn and subsequent point loads
      proto._loadDef = async function() {
        try {
          // Give a harmless coverage so dependents don’t crash
          const Interval = P.Interval || function(min, max){ this.min=min; this.max=max; };
          const iv = new Interval(Number.NaN, Number.NaN);
          // super.setCoverage is not easily reachable here; rely on controller tolerating NaN coverage
          this._pointSet = null;
        } catch (_) {}
      };
      // Stop time-stepping from setting NaNs
      proto._getPointsAtTime = function(outArr /*, t */) {
        outArr[0] = null;
        outArr[1] = null;
      };
      if (typeof proto.update === 'function') {
        const origUpdate = proto.update;
        proto.update = function(/* entity, time */) {
          // No-op to keep last known transform (prevents NaN writes)
          return;
        };
      }
      console.log('[Eyes Dev] Dynamo disabled: controllers will not fetch def.dyn');
    } catch (e) {
      console.warn('[Eyes Dev] Failed to disable Dynamo:', e);
    }
  });
})();

