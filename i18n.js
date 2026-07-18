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

  // Build-mode condition text (e.g. "On critical hits", "Katana hits
  // only"). Most conditions are static strings looked up directly; the two
  // per-weapon-type conditions (generated from a template in
  // effect_multipliers.mjs, one per weapon) are matched by pattern and
  // rebuilt from a translated template + a translated weapon-type name,
  // rather than needing one translated entry per weapon per condition.
  condition(en) {
    if (this.strings.conditions?.[en]) return this.strings.conditions[en];
    let m = en.match(/^(.+) hits only$/);
    if (m && this.strings.weaponTypes?.[m[1]] && this.strings.conditionTemplates?.hitsOnly) {
      return this.strings.conditionTemplates.hitsOnly.replace('{w}', this.strings.weaponTypes[m[1]]);
    }
    m = en.match(/^3\+ (.+) Equipped$/);
    if (m && this.strings.weaponTypes?.[m[1]] && this.strings.conditionTemplates?.equipped3Plus) {
      return this.strings.conditionTemplates.equipped3Plus.replace('{w}', this.strings.weaponTypes[m[1]]);
    }
    return en;
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
