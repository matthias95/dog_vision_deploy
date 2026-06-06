(function () {
  var FALLBACK = 'de';
  var SUPPORTED = ['de', 'en'];
  var STORAGE_KEY = 'dog-vision-lang';

  var translations = {};

  function t(key) {
    var keys = key.split('.');
    var val = translations;
    for (var i = 0; i < keys.length; i++) {
      if (val && typeof val === 'object' && keys[i] in val) {
        val = val[keys[i]];
      } else {
        return key;
      }
    }
    return typeof val === 'string' ? val : key;
  }

  var _resolve;
  window._i18nReady = new Promise(function (resolve) { _resolve = resolve; });
  window.t = t;

  (async function init() {
    var lang = detectLang();

    try {
      var url = resolveLocaleURL(lang);
      var res = await fetch(url);
      translations = await res.json();
    } catch (e) {
      var res = await fetch(resolveLocaleURL('en'));
      translations = await res.json();
      lang = 'en';
    }

    document.documentElement.lang = lang;

    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) titleEl.textContent = t(titleEl.getAttribute('data-i18n'));

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('html.description');

    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === 'TITLE') continue;
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val && val !== key) el.innerHTML = val;
    }

    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    for (var i = 0; i < ariaEls.length; i++) {
      var el = ariaEls[i];
      var key = el.getAttribute('data-i18n-aria');
      var val = t(key);
      if (val && val !== key) el.setAttribute('aria-label', val);
    }

    var switcher = document.getElementById('langSwitcher');
    if (switcher) switcher.value = lang;

    _resolve();
  })();

  function detectLang() {
    var m = window.location.pathname.match(/^\/(de|en)\//);
    if (m) return m[1];
    var lang = localStorage.getItem(STORAGE_KEY);
    if (lang) return lang;
    lang = (navigator.language || '').split('-')[0];
    return SUPPORTED.indexOf(lang) !== -1 ? lang : FALLBACK;
  }

  function resolveLocaleURL(lang) {
    var scriptEl = document.querySelector('script[src*="i18n.js"]');
    if (scriptEl) {
      var base = scriptEl.src.substring(0, scriptEl.src.lastIndexOf('/') + 1);
      return base + 'locales/' + lang + '.json';
    }
    return 'locales/' + lang + '.json';
  }

  window.switchLang = function (lang) {
    var m = window.location.pathname.match(/^\/(de|en)\//);
    if (m) {
      window.location.href = window.location.pathname.replace(/^\/(de|en)\//, '/' + lang + '/');
    } else {
      localStorage.setItem(STORAGE_KEY, lang);
      location.reload();
    }
  };
})();
