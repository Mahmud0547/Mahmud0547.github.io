/*
 * Language switcher — EN / RU / TJ
 *
 * How it works:
 *   1. Fetch the translation dictionary from data/i18n.json
 *   2. Read the saved language from localStorage (falls back to 'en')
 *   3. Walk the DOM and apply translations via data-i18n / data-i18n-html attributes
 *   4. Wire up the EN/RU/TJ buttons so clicking them switches language live
 *   5. Call window.restartTyping (set by main.js) to swap the hero phrases too
 *
 * data-i18n="key"      → el.textContent = translation
 * data-i18n-html="key" → el.innerHTML   = translation  (use for paragraphs with <strong> etc.)
 */
(async function initI18n() {

  // Load all translations from the single JSON file
  let translations = null;
  try {
    const res = await fetch('data/i18n.json');
    if (res.ok) translations = await res.json();
  } catch {
    // Network error or file missing — just keep the default English and stop
    return;
  }
  if (!translations) return;

  // Current language — persists across visits
  let lang = localStorage.getItem('lang') || 'en';

  // Apply a given language to the whole page
  function apply(l) {
    const t = translations[l];
    if (!t) return;

    // Plain text — safe for everything without HTML markup
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined && !Array.isArray(t[key])) {
        el.textContent = t[key];
      }
    });

    // innerHTML — only used for about paragraphs that contain <strong> tags
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Switch the typing effect phrases (function lives in main.js)
    if (Array.isArray(t['hero.typed']) && typeof window.restartTyping === 'function') {
      window.restartTyping(t['hero.typed']);
    }

    // Highlight the active language button (both in nav and mobile menu)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('lang-btn--active', btn.dataset.lang === l);
    });

    // Keep the <html lang="..."> accurate for screen readers
    document.documentElement.lang = l === 'tj' ? 'tg' : l;

    lang = l;
  }

  // Apply on first load
  apply(lang);

  // Button click handlers — works for both nav and mobile menu buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === lang) return; // already showing this language
      localStorage.setItem('lang', newLang);
      apply(newLang);
    });
  });

})();
