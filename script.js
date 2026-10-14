// Vercel Web Analytics queue: cookieless, no consent needed.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

(function () {
  var root = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Language: each page exists in English (/, /people) and Danish (/da, /da/people), so search
  // engines can index both. The visitor's own choice wins. Otherwise visitors in Denmark,
  // Greenland and the Faroe Islands who land on an English page are sent to the Danish one
  // (country from Vercel). Without the location lookup (opened locally) the browser language decides.
  var DA_COUNTRIES = ['DK', 'GL', 'FO'];
  var path = location.pathname.replace(/\/index\.html$/, '/');
  var pageLang = /^\/da(\/|$)/.test(path) ? 'da' : 'en';
  function otherUrl() {
    if (pageLang === 'da') return path.replace(/^\/da\/?/, '/');
    return '/da' + (path === '/' ? '' : path.replace(/\/$/, ''));
  }
  function browserLang() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) if (/^(da|kl|fo)\b/i.test(langs[i])) return 'da';
    try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Copenhagen') return 'da'; } catch (e) {}
    return 'en';
  }
  var onWeb = location.protocol.indexOf('http') === 0;
  function goTo(l) { if (onWeb && l !== pageLang) location.replace(otherUrl() + location.search + location.hash); }
  var chosen = get('vz-lang');
  if (chosen === 'en' || chosen === 'da') {
    goTo(chosen);
  } else if (pageLang === 'en') {
    if (onWeb && window.fetch) {
      fetch('/api/geo').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (get('vz-lang')) return;
        goTo(d && d.country ? (DA_COUNTRIES.indexOf(d.country) > -1 ? 'da' : 'en') : browserLang());
      }).catch(function () { if (!get('vz-lang')) goTo(browserLang()); });
    } else {
      goTo(browserLang());
    }
  }

  function pop(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  var langBtn = document.getElementById('langBtn');
  langBtn.addEventListener('click', function () {
    var next = pageLang === 'en' ? 'da' : 'en';
    set('vz-lang', next); pop(langBtn);
    location.href = otherUrl() + location.hash;
  });

  // Email: assembled here from reversed parts, so the address is not in the page source
  // as plain text or as a mailto link that simple harvesting bots read.
  var mail = document.getElementById('mail');
  function rev(x) { return x.split('').reverse().join(''); }
  var addr = rev(mail.getAttribute('data-u')) + '@' + rev(mail.getAttribute('data-d'));
  mail.href = 'mailto:' + addr; mail.textContent = addr; mail.hidden = false;

  // Google Analytics was removed. Clear the cookies and stored choice it left with earlier visitors.
  (function clearGA() {
    var host = location.hostname, parts = host.split('.');
    var domains = ['', host, '.' + host, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
    try { localStorage.removeItem('vz-consent'); } catch (e) {}
  })();

  // Scope list: tap an act to read what it covers. Tap it again, or press Escape, to close.
  var ACTS = {
    "PSD3": { en: "EU directive on the authorisation and supervision of payment institutions and e-money institutions. It replaces PSD2 and the E-Money Directive.", da: "EU-direktiv om tilladelse til og tilsyn med betalingsinstitutter og e-pengeinstitutter. Det afløser PSD2 og e-pengedirektivet." },
    "PSR": { en: "EU regulation with the rules for providing payment services: transparency, rights and obligations, fraud prevention and access to accounts.", da: "EU-forordning med reglerne for udbud af betalingstjenester: gennemsigtighed, rettigheder og pligter, forebyggelse af svindel og adgang til konti." },
    "MiCAR": { en: "EU regulation 2023/1114 on crypto-assets. It sets authorisation and conduct rules for crypto-asset service providers and issuers of tokens.", da: "EU-forordning 2023/1114 om kryptoaktiver. Den fastsætter krav til tilladelse og adfærd for udbydere af kryptoaktivtjenester og udstedere af tokens.", page: { href: "/mica", en: "MiCA and CASP authorisation", da: "MiCA og CASP-tilladelse" } },
    "MiFID II": { en: "EU directive 2014/65/EU on investment services and trading venues. It applies to tokenised financial instruments as to any other.", da: "EU-direktiv 2014/65/EU om investeringsservice og handelspladser. Det gælder for tokeniserede finansielle instrumenter som for alle andre." },
    "MiFIR": { en: "EU regulation 600/2014 on transparency, transaction reporting and trading obligations for financial instruments.", da: "EU-forordning 600/2014 om gennemsigtighed, transaktionsindberetning og handelsforpligtelser for finansielle instrumenter." },
    "DLTR": { en: "EU regulation 2022/858. It lets market infrastructures trade and settle tokenised securities on DLT with targeted exemptions.", da: "EU-forordning 2022/858. Den lader markedsinfrastrukturer handle og afvikle tokeniserede værdipapirer på DLT med målrettede undtagelser." },
    "CSDR": { en: "EU regulation 909/2014 on securities settlement and the central securities depositories that run it.", da: "EU-forordning 909/2014 om afvikling af værdipapirer og de værdipapircentraler, der står for den." },
    "AMLD": { en: "EU directive on the national side of anti-money laundering: supervisors, financial intelligence units and registers.", da: "EU-direktiv om den nationale del af hvidvaskreglerne: tilsyn, finansielle efterretningsenheder og registre." },
    "AMLR": { en: "EU regulation 2024/1624 with one directly applicable rulebook for obliged entities on customer due diligence, reporting and internal controls.", da: "EU-forordning 2024/1624 med ét direkte gældende regelsæt for omfattede virksomheder om kundekendskab, indberetning og interne kontroller." }
  };
  var actInfo = document.getElementById('actInfo');
  // Only the front page has the scope list.
  var actButtons = actInfo ? document.querySelectorAll('.act') : [];
  var openAct = null;
  // One block per act, both languages; the page's language rule hides the other one.
  actButtons.forEach(function (b) {
    var key = b.getAttribute('data-act');
    if (actInfo.querySelector('[data-act="' + key + '"]')) return;
    var item = document.createElement('div');
    item.className = 'act-item'; item.setAttribute('data-act', key);
    var name = document.createElement('p'); name.className = 'act-name';
    name.textContent = key + ' · ' + b.querySelector('abbr').title;
    item.appendChild(name);
    ['en', 'da'].forEach(function (l) {
      var t = document.createElement('p'); t.className = 'act-text ' + l;
      if (l === 'da') t.lang = 'da';
      t.textContent = ACTS[key][l];
      item.appendChild(t);
    });
    // Acts with their own page get a link to it, in the page's language.
    if (ACTS[key].page) {
      var a = document.createElement('a'); a.className = 'act-link';
      a.href = (pageLang === 'da' ? '/da' : '') + ACTS[key].page.href;
      a.textContent = ACTS[key].page[pageLang];
      item.appendChild(a);
    }
    actInfo.appendChild(item);
  });
  if (actInfo) window.renderAct = function () {
    actButtons.forEach(function (b) { b.setAttribute('aria-expanded', String(b.getAttribute('data-act') === openAct)); });
    actInfo.querySelectorAll('.act-item').forEach(function (it) {
      it.classList.toggle('open', it.getAttribute('data-act') === openAct);
    });
  };
  actButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-act');
      openAct = openAct === key ? null : key;
      window.renderAct();
    });
  });
  if (actInfo) document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openAct) { openAct = null; window.renderAct(); } });

  // ESMA Q&A: only one Q&A is open at a time (name="qa" on <details>). When a long
  // answer above closes, the page shifts up, so bring the opened question back into view.
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d.classList || !d.classList.contains('qa') || !d.open) return;
    // The topic heading above sticks to the top of the screen, so keep the question below it.
    var h = d.previousElementSibling;
    while (h && h.tagName !== 'H2') h = h.previousElementSibling;
    var offset = h ? h.offsetHeight : 0;
    if (d.getBoundingClientRect().top < offset) window.scrollBy(0, d.getBoundingClientRect().top - offset - 8);
  }, true);

  // ESMA Q&A: each topic heading opens a dropdown with all topics (built from the table of
  // contents), so a reader deep in one topic can jump to another from the sticky heading.
  var qaPage = document.querySelector('.qa-page');
  var qaToc = qaPage && qaPage.querySelector('.toc ol');
  if (qaToc) {
    var menu = document.createElement('nav');
    menu.className = 'qa-topic-menu'; menu.id = 'qa-topic-menu'; menu.hidden = true;
    menu.setAttribute('aria-label', pageLang === 'da' ? 'Emner' : 'Topics');
    menu.appendChild(qaToc.cloneNode(true));
    document.body.appendChild(menu);
    var openBtn = null;
    var closeMenu = function (focus) {
      if (!openBtn) return;
      menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false');
      if (focus) openBtn.focus();
      openBtn = null;
    };
    qaPage.querySelectorAll('.qa-topic h2').forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'qa-topic-btn';
      b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'qa-topic-menu');
      while (h.firstChild) b.appendChild(h.firstChild);
      b.insertAdjacentHTML('beforeend', '<svg class="qa-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      h.appendChild(b);
      b.addEventListener('click', function () {
        if (openBtn === b) { closeMenu(false); return; }
        closeMenu(false);
        var r = h.getBoundingClientRect();
        menu.style.top = Math.max(r.bottom, 0) + 6 + 'px';
        menu.style.left = r.left + 'px'; menu.style.width = r.width + 'px';
        menu.querySelectorAll('a').forEach(function (a) {
          if (a.getAttribute('href') === '#' + h.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        menu.hidden = false; b.setAttribute('aria-expanded', 'true'); openBtn = b;
      });
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    document.addEventListener('click', function (e) {
      if (openBtn && !menu.contains(e.target) && !openBtn.contains(e.target)) closeMenu(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
    window.addEventListener('scroll', function () { closeMenu(false); }, { passive: true });
    window.addEventListener('resize', function () { closeMenu(false); });
  }

  // Regulation menu: mark the link to the page being shown.
  document.querySelectorAll('.reg-nav a').forEach(function (a) {
    if (a.getAttribute('href').replace(/\/$/, '') === path.replace(/\/$/, '')) a.setAttribute('aria-current', 'page');
  });

  // Theme: Fresh light and Fresh dark. The script in <head> picks it before the page paints:
  // the visitor's own choice, else light in daytime (07–19 on their clock) and dark otherwise.
  var themeBtn = document.getElementById('themeBtn');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function syncThemeBtn() {
    var d = isDark();
    themeBtn.setAttribute('aria-pressed', String(d));
    themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncThemeBtn();
  requestAnimationFrame(function () { requestAnimationFrame(function () { themeBtn.classList.add('ready'); }); });
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next); set('vz-theme', next); syncThemeBtn();
    pop(themeBtn);
  });

})();
