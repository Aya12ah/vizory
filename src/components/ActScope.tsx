'use client';
import { Fragment, useEffect, useState } from 'react';
import { type Lang, localPath } from '@/i18n/lang';

// The front page's scope list: the areas Vizory covers and their EU acts. Tap an act to read
// what it covers; tap it again, or press Escape, to close.
type Act = { title: string; en: string; da: string; page?: { href: string; en: string; da: string } };

const ACTS: Record<string, Act> = {
  PSD3: { title: 'Payment Services Directive 3', en: 'EU directive on the authorisation and supervision of payment institutions and e-money institutions. It replaces PSD2 and the E-Money Directive.', da: 'EU-direktiv om tilladelse til og tilsyn med betalingsinstitutter og e-pengeinstitutter. Det afløser PSD2 og e-pengedirektivet.' },
  PSR: { title: 'Payment Services Regulation', en: 'EU regulation with the rules for providing payment services: transparency, rights and obligations, fraud prevention and access to accounts.', da: 'EU-forordning med reglerne for udbud af betalingstjenester: gennemsigtighed, rettigheder og pligter, forebyggelse af svindel og adgang til konti.' },
  MiCAR: { title: 'Markets in Crypto-Assets Regulation', en: 'EU regulation 2023/1114 on crypto-assets. It sets authorisation and conduct rules for crypto-asset service providers and issuers of tokens.', da: 'EU-forordning 2023/1114 om kryptoaktiver. Den fastsætter krav til tilladelse og adfærd for udbydere af kryptoaktivtjenester og udstedere af tokens.', page: { href: '/mica', en: 'MiCA and CASP authorisation', da: 'MiCA og CASP-tilladelse' } },
  'MiFID II': { title: 'Markets in Financial Instruments Directive II', en: 'EU directive 2014/65/EU on investment services and trading venues. It applies to tokenised financial instruments as to any other.', da: 'EU-direktiv 2014/65/EU om investeringsservice og handelspladser. Det gælder for tokeniserede finansielle instrumenter som for alle andre.' },
  MiFIR: { title: 'Markets in Financial Instruments Regulation', en: 'EU regulation 600/2014 on transparency, transaction reporting and trading obligations for financial instruments.', da: 'EU-forordning 600/2014 om gennemsigtighed, transaktionsindberetning og handelsforpligtelser for finansielle instrumenter.' },
  DLTR: { title: 'DLT Pilot Regime Regulation', en: 'EU regulation 2022/858. It lets market infrastructures trade and settle tokenised securities on DLT with targeted exemptions.', da: 'EU-forordning 2022/858. Den lader markedsinfrastrukturer handle og afvikle tokeniserede værdipapirer på DLT med målrettede undtagelser.' },
  CSDR: { title: 'Central Securities Depositories Regulation', en: 'EU regulation 909/2014 on securities settlement and the central securities depositories that run it.', da: 'EU-forordning 909/2014 om afvikling af værdipapirer og de værdipapircentraler, der står for den.' },
  AMLD: { title: 'Anti-Money Laundering Directive', en: 'EU directive on the national side of anti-money laundering: supervisors, financial intelligence units and registers.', da: 'EU-direktiv om den nationale del af hvidvaskreglerne: tilsyn, finansielle efterretningsenheder og registre.' },
  AMLR: { title: 'Anti-Money Laundering Regulation', en: 'EU regulation 2024/1624 with one directly applicable rulebook for obliged entities on customer due diligence, reporting and internal controls.', da: 'EU-forordning 2024/1624 med ét direkte gældende regelsæt for omfattede virksomheder om kundekendskab, indberetning og interne kontroller.' },
};

const AREAS: { en: string; da: string; acts: string[] }[] = [
  { en: 'Payments', da: 'Betalinger', acts: ['PSD3', 'PSR'] },
  { en: 'Crypto-assets', da: 'Kryptoaktiver', acts: ['MiCAR'] },
  { en: 'DLT-based capital markets', da: 'DLT-baserede kapitalmarkeder', acts: ['MiFID II', 'MiFIR', 'DLTR', 'CSDR'] },
  { en: 'AML/CFT', da: 'Hvidvask', acts: ['AMLD', 'AMLR'] },
];

export function ActScope({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="scope-wrap">
      <dl className="scope">
        {AREAS.map((area) => (
          <div key={area.en}>
            <dt>{area[lang]}</dt>
            <dd>
              {area.acts.map((key, i) => (
                <Fragment key={key}>
                  {i > 0 && ' '}
                  <span className="nw">
                    <button className="act" type="button" data-act={key} aria-controls="actInfo" aria-expanded={open === key}
                      onClick={() => setOpen(open === key ? null : key)}>
                      <abbr title={ACTS[key].title}>{key}</abbr>
                    </button>
                    {i < area.acts.length - 1 && ','}
                  </span>
                </Fragment>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      {/* Every description sits in the same grid cell, so the space is reserved for the longest
          one and opening one never moves the page. Only the open one is visible. */}
      <aside className="act-info" id="actInfo" aria-live="polite">
        {Object.entries(ACTS).map(([key, act]) => (
          <div key={key} className={'act-item' + (open === key ? ' open' : '')} data-act={key}>
            <p className="act-name">{`${key} · ${act.title}`}</p>
            <p className="act-text">{act[lang]}</p>
            {act.page && <a className="act-link" href={localPath(act.page.href, lang)}>{act.page[lang]}</a>}
          </div>
        ))}
      </aside>
    </div>
  );
}
