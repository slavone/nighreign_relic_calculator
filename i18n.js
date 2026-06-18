const SUPPORTED_LANGS = ['jp', 'kr'];

const I18N = {
  locale: 'en',
  strings: {},

  async init() {
    const urlLang = new URLSearchParams(location.search).get('lang');
    const stored = localStorage.getItem('lang');
    const lang = urlLang || stored || 'en';

    if (SUPPORTED_LANGS.includes(lang)) {
      // Use <script> injection so this works with file:// as well as http://
      await new Promise(resolve => {
        const s = document.createElement('script');
        s.src = `locales/${lang}.js`;
        s.onload = () => {
          const data = window[`__LOCALE_${lang.toUpperCase()}__`];
          if (data) { this.strings = data; this.locale = lang; }
          resolve();
        };
        s.onerror = resolve; // fall back to English silently
        document.head.appendChild(s);
      });
    }

    if (this.locale !== 'en') {
      localStorage.setItem('lang', this.locale);
    } else {
      localStorage.removeItem('lang');
    }

    // Sync URL when locale came from localStorage with no ?lang= param
    if (!urlLang && this.locale !== 'en') {
      const u = new URL(location.href);
      u.searchParams.set('lang', this.locale);
      history.replaceState({}, '', u);
    }
  },

  t(key, fallback) {
    const val = key.split('.').reduce((o, k) => o?.[k], this.strings.ui);
    return val ?? fallback ?? key;
  },

  effectName(en) {
    return this.strings.effects?.[en]?.name ?? en;
  },

  effectDesc(en, fb) {
    return this.strings.effects?.[en]?.desc ?? fb;
  },

  groupName(en) {
    return this.strings.groups?.[en] ?? en;
  },

  poolSummary(nEffects, nGroups) {
    const fmt = this.strings.ui?.pool_summary_format;
    if (fmt) return fmt.replace('{n}', nEffects).replace('{g}', nGroups);
    return `${nEffects} effect${nEffects !== 1 ? 's' : ''} across ${nGroups} group${nGroups !== 1 ? 's' : ''} selected`;
  }
};
