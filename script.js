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
    // The button shows the flag of the language it switches to (see the .flag rules in styles.css).
    langBtn.setAttribute('aria-label', l === 'en' ? 'Skift til dansk' : 'Switch to English');
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
    "MiCAR": { en: "EU regulation 2023/1114 on crypto-assets. It sets authorisation and conduct rules for crypto-asset service providers and issuers of tokens.", da: "EU-forordning 2023/1114 om kryptoaktiver. Den fastsætter krav til tilladelse og adfærd for udbydere af kryptoaktivtjenester og udstedere af tokens." },
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
    pop(themeBtn);
  });

})();
