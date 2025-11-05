// Readable PreloadManager extracted from the bundled preload.js semantics.
// This module is not wired into the app runtime yet; it mirrors behavior for future migration.

export class PreloadManager {
  static instance;

  constructor(options = {}) {
    if (PreloadManager.instance) return PreloadManager.instance;

    this._isTouch = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
    this._canHover = !matchMedia('(hover: none)').matches;

    const {
      embedEl = document.getElementById('embed-overlay'),
      loadingEl = document.getElementById('loading-screen'),
      storyList = null, // optional: { stories: { id: { title } } }
      entityInfo = null, // optional: { id: { altName, displayName, iauName } }
    } = options;

    this._embedEl = embedEl;
    this._loadingScreenEl = loadingEl;
    this._storyList = storyList;
    this._entityInfo = entityInfo;

    const hashTail = (window.location.hash.split('#/')[1] ?? '').split('?');
    this._urlParams = new URLSearchParams(hashTail[1]);
    this._hashRoute = hashTail[0];

    if (this._isEmbed() || this._isInteractPrompt()) {
      this._showEmbedScreen();
      this._loadingScreenEl?.remove?.();
    } else {
      this._showLoadingScreen();
      this._embedEl?.remove?.();
    }

    PreloadManager.instance = this;
  }

  // Mode checks
  _isEmbed() {
    return this._urlParams.get('embed') === 'true';
  }
  _isInteractPrompt() {
    return this._urlParams.get('interactPrompt') === 'true';
  }

  // Loading screen DOM
  _showLoadingScreen() {
    if (!this._loadingScreenEl) return;

    const wrap = document.createElement('div');
    wrap.id = 'loading-screen-wrapper';
    this._loadingScreenEl.appendChild(wrap);

    const stars1 = document.createElement('div');
    stars1.id = 'loading-screen-stars1';
    wrap.appendChild(stars1);

    const stars2 = document.createElement('div');
    stars2.id = 'loading-screen-stars2';
    wrap.appendChild(stars2);

    const logo = document.createElement('div');
    logo.id = 'loading-screen-logo';
    wrap.appendChild(logo);

    const container = document.createElement('div');
    container.id = 'loading-screen-container';
    wrap.appendChild(container);

    const text = document.createElement('div');
    text.id = 'loading-screen-text';
    text.innerText = 'Loading';
    container.appendChild(text);

    const bar = document.createElement('div');
    bar.id = 'loading-screen-bar';
    container.appendChild(bar);

    // Random star fields
    let s1 = '';
    for (let i = 0; i < 8; i++) {
      s1 += `${parseInt(Math.random() * window.innerWidth)}px ${parseInt(Math.random() * window.innerHeight)}px hsl(0deg, 0%, ${parseInt(80 * Math.random()) + 20}%), `;
    }
    stars1.style.boxShadow = s1.slice(0, -2);

    let s2 = '';
    for (let i = 0; i < 24; i++) {
      s2 += `${parseInt(Math.random() * window.innerWidth)}px ${parseInt(Math.random() * window.innerHeight)}px hsl(0deg, 0%, ${parseInt(80 * Math.random()) + 20}%), `;
    }
    stars2.style.boxShadow = s2.slice(0, -2);

    this._loadingScreenEl.classList.add('show');
  }

  // Embed overlay DOM
  _showEmbedScreen() {
    if (!this._embedEl) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'embed-wrapper';
    this._embedEl.appendChild(wrapper);

    const img = document.createElement('img');
    img.src = './assets/svg/embed_interact.svg';
    img.className = 'embed-interact';
    wrapper.appendChild(img);

    const interact = document.createElement('span');
    interact.className = 'interact-text';
    interact.innerHTML = (this._isTouch ? 'touch' : 'click') + ' & drag<br>to rotate';
    wrapper.appendChild(interact);

    const btn = document.createElement('button');
    btn.className = 'clickable view-btn';
    btn.innerText = 'View 3D';
    wrapper.appendChild(btn);

    const loaderText = document.createElement('span');
    loaderText.className = 'loader-text';

    const title = this._getTitleFromURL();
    const multiline = title?.length > 20;
    const br = multiline ? '<br>' : ' ';
    const content = title && title !== 'Home' ? `Loading${br}${title}${br}in 3D` : 'Loading 3D';
    if (multiline) loaderText.innerHTML = content; else loaderText.innerText = content;
    wrapper.appendChild(loaderText);

    const loaderBar = document.createElement('div');
    loaderBar.className = 'embed-loader';
    wrapper.appendChild(loaderBar);

    this._embedEl.classList.add('show', 'loading');
    // Force reflow
    // eslint-disable-next-line no-unused-expressions
    this._embedEl.offsetWidth;
    this.updateEmbedLoadPercent(10);
  }

  showEmbedInteraction() {
    const onEnd = (ev) => {
      ev.preventDefault?.();
      this._embedEl.className = '';
      document.removeEventListener('touchstart', onEnd);
      document.removeEventListener('mousedown', onEnd);
    };
    this._embedEl.classList.remove('view');
    this._embedEl.classList.add('interact');
    if (this._isTouch) document.addEventListener('touchstart', onEnd);
    if (this._canHover) document.addEventListener('mousedown', onEnd);
  }

  showEmbedViewButton() {
    this._embedEl.classList.remove('loading');
    this._embedEl.classList.add('view');
    const onUp = (ev) => {
      ev.preventDefault?.();
      document.removeEventListener('touchend', onUp);
      document.removeEventListener('mouseup', onUp);
      this.showEmbedInteraction();
    };
    if (this._isTouch) document.addEventListener('touchend', onUp);
    if (this._canHover) document.addEventListener('mouseup', onUp);
  }

  _getTitleFromURL() {
    if (this._hashRoute === 'home') return 'Home';
    let obj = this._hashRoute;
    const storyPrefix = 'story/';
    const moonsSuffix = '/moons';
    const telescopeSuffix = '/telescope';
    const eventsSuffix = '/events';
    const compareSuffix = '/compare';

    // story/:id?slide=
    if (this._hashRoute?.includes(storyPrefix) && this._storyList?.stories) {
      const storyId = this._hashRoute.split(storyPrefix)[1];
      const story = this._storyList.stories[storyId];
      const slideParam = this._urlParams.get('slide');
      const slideNo = slideParam ? slideParam.replace('slide_', '') : 1;
      if (story?.title && slideNo) return `${story.title} - Slide ${slideNo}`;
    }

    // :object/moons
    if (this._hashRoute?.includes(moonsSuffix)) {
      const parts = this._hashRoute.split(moonsSuffix);
      const moonId = parts[1].slice(1);
      const moonName = this._getNameFromEntityInfo(moonId);
      if (moonName) return moonName;
      obj = parts[0];
      const base = this._getNameFromEntityInfo(obj);
      if (base) return `${base}'${base.endsWith('s') ? '' : 's'} Moons`;
    }

    // :object/telescope
    if (this._hashRoute?.includes(telescopeSuffix)) {
      obj = this._hashRoute.split(telescopeSuffix)[0];
      const name = this._getNameFromEntityInfo(obj);
      if (name) return `${name} Telescope Mode`;
    }

    // :object/events[/child]
    if (this._hashRoute?.includes(eventsSuffix)) {
      const parts = this._hashRoute.split(eventsSuffix);
      obj = parts[0];
      const name = this._getNameFromEntityInfo(obj);
      if (name) return parts[1].slice(1) ? `${name} Event` : null;
    }

    // :object/compare?id=...
    if (this._hashRoute?.includes(compareSuffix)) {
      obj = this._hashRoute.split(compareSuffix)[0];
      const left = this._getNameFromEntityInfo(obj);
      const right = this._getNameFromEntityInfo(this._urlParams.get('id'));
      if (left) return right ? `${left} compared to ${right}` : `${left} Comparison`;
    }

    return this._getNameFromEntityInfo(obj) || 'Home';
  }

  _getNameFromEntityInfo(id) {
    const info = this._entityInfo?.[id];
    if (!info) return null;
    const { altName, displayName, iauName } = info;
    return altName || displayName || iauName || null;
  }

  // Public helpers used by app code
  hideLoadingScreen() {
    if (!this._loadingScreenEl) return;
    this._loadingScreenEl.classList.remove('show');
    this._loadingScreenEl.style.transition = 'opacity 0.4s ease-out';
    this._loadingScreenEl.style.opacity = '0';
    setTimeout(() => {
      this._loadingScreenEl?.remove?.();
    }, 400);
  }

  updateEmbedLoadPercent(pct) {
    this._embedEl?.style?.setProperty('--load-percent', `${pct}%`);
  }
}

// No default export/instantiation to avoid interfering with the bundled preload.
// Consumers should import { PreloadManager } and instantiate explicitly in dev-only code.
