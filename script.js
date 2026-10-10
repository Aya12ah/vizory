// Vercel Web Analytics queue: cookieless, no consent needed.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

(function () {
  var root = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Language: the visitor's own choice wins. Otherwise Danish for visitors in Denmark,
  // Greenland and the Faroe Islands (country from Vercel), English elsewhere.
  // Without the location lookup (opened locally) the browser language decides.
  var DA_COUNTRIES = ['DK', 'GL', 'FO'];
  function browserLang() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) if (/^(da|kl|fo)\b/i.test(langs[i])) return 'da';
    try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Copenhagen') return 'da'; } catch (e) {}
    return 'en';
  }
  var langBtn = document.getElementById('langBtn');
  function applyLang(l) {
    root.setAttribute('data-lang', l); root.lang = l;
    langBtn.textContent = l === 'en' ? 'DA' : 'EN';
    langBtn.setAttribute('aria-label', l === 'en' ? 'Skift til dansk' : 'Switch to English');
    // Full names of the acts follow the language
    document.querySelectorAll('abbr[data-da]').forEach(function (a) {
      if (!a.hasAttribute('data-en')) a.setAttribute('data-en', a.title);
      a.title = a.getAttribute(l === 'da' ? 'data-da' : 'data-en');
    });
  }
  var chosen = get('vz-lang');
  if (chosen === 'en' || chosen === 'da') {
    applyLang(chosen);
  } else {
    applyLang(browserLang());
    if (location.protocol.indexOf('http') === 0 && window.fetch) {
      fetch('/api/geo').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (!d || !d.country || get('vz-lang')) return;
        applyLang(DA_COUNTRIES.indexOf(d.country) > -1 ? 'da' : 'en');
      }).catch(function () {});
    }
  }

  function pop(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  langBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-lang') === 'en' ? 'da' : 'en';
    applyLang(next); set('vz-lang', next); pop(langBtn);
  });

  // Email: assembled here from reversed parts, so the address is not in the page source
  // as plain text or as a mailto link that simple harvesting bots read.
  var mail = document.getElementById('mail');
  function rev(x) { return x.split('').reverse().join(''); }
  var addr = rev(mail.getAttribute('data-u')) + '@' + rev(mail.getAttribute('data-d'));
  mail.href = 'mailto:' + addr; mail.textContent = addr; mail.hidden = false;

  // Google Analytics: loaded only after the visitor accepts cookies.
  var GA_ID = 'G-FTP7V0WX8K';
  var gaLoaded = false;
  // Theme as GA sees it: the visitor's choice, else their system setting.
  function themeNow() {
    var t = root.getAttribute('data-theme');
    return t || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function loadGA() {
    if (gaLoaded || location.protocol.indexOf('http') !== 0) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    window.gtag('set', 'user_properties', { theme: themeNow() });
    window.gtag('event', 'theme_view', { theme: themeNow() });
    var sc = document.createElement('script'); sc.async = true;
    sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(sc);
  }
  function clearGACookies() {
    var host = location.hostname, parts = host.split('.');
    var domains = ['', host, '.' + host, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }
  function showChoice(c) {
    document.getElementById('consentYes').setAttribute('aria-pressed', String(c === 'yes'));
    document.getElementById('consentNo').setAttribute('aria-pressed', String(c === 'no'));
  }
  function setConsent(yes) {
    set('vz-consent', yes ? 'yes' : 'no');
    showChoice(yes ? 'yes' : 'no');
    if (yes) { loadGA(); }
    else { clearGACookies(); if (gaLoaded) location.reload(); }
  }
  var consent = get('vz-consent');
  showChoice(consent);
  if (consent === 'yes') loadGA();
  document.getElementById('consentYes').addEventListener('click', function () { setConsent(true); });
  document.getElementById('consentNo').addEventListener('click', function () { setConsent(false); });
  mail.addEventListener('click', function () { if (window.gtag) window.gtag('event', 'contact_email_click'); });

  // Theme: Fresh light and Fresh dark, following the system until the visitor chooses.
  var themeBtn = document.getElementById('themeBtn');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : mq.matches; }
  function syncThemeBtn() {
    var d = isDark();
    themeBtn.setAttribute('aria-pressed', String(d));
    themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
  }
  var st = get('vz-theme'); if (st === 'dark' || st === 'light') root.setAttribute('data-theme', st);
  syncThemeBtn();
  requestAnimationFrame(function () { requestAnimationFrame(function () { themeBtn.classList.add('ready'); }); });
  mq.addEventListener && mq.addEventListener('change', syncThemeBtn);
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next); set('vz-theme', next); syncThemeBtn();
    if (window.gtag) {
      window.gtag('set', 'user_properties', { theme: next });
      window.gtag('event', 'theme_change', { theme: next });
    }
    pop(themeBtn);
  });

})();
