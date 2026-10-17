import Link from 'next/link';
import { Fragment } from 'react';
import { type Lang, localPath } from '@/i18n/lang';

// The front page's scope list: the areas Vizory covers and their EU acts. Each act links to the
// guide that covers it; its full name shows on hover.
const ACTS: Record<string, { title: string; href: string }> = {
  PSD3: { title: 'Payment Services Directive 3', href: '/payments' },
  PSR: { title: 'Payment Services Regulation', href: '/payments' },
  MiCAR: { title: 'Markets in Crypto-Assets Regulation', href: '/mica' },
  'MiFID II': { title: 'Markets in Financial Instruments Directive II', href: '/dlt' },
  MiFIR: { title: 'Markets in Financial Instruments Regulation', href: '/dlt' },
  DLTR: { title: 'DLT Pilot Regime Regulation', href: '/dlt' },
  CSDR: { title: 'Central Securities Depositories Regulation', href: '/dlt' },
  AMLD: { title: 'Anti-Money Laundering Directive', href: '/aml' },
  AMLR: { title: 'Anti-Money Laundering Regulation', href: '/aml' },
};

const AREAS: { en: string; da: string; acts: string[] }[] = [
  { en: 'Payments', da: 'Betalinger', acts: ['PSD3', 'PSR'] },
  { en: 'Crypto-assets', da: 'Kryptoaktiver', acts: ['MiCAR'] },
  { en: 'DLT-based capital markets', da: 'DLT-baserede kapitalmarkeder', acts: ['MiFID II', 'MiFIR', 'DLTR', 'CSDR'] },
  { en: 'AML/CFT', da: 'Hvidvask', acts: ['AMLD', 'AMLR'] },
];

export function ActScope({ lang }: { lang: Lang }) {
  return (
    <dl className="m-0 flex flex-col gap-[3px] text-[14px] leading-[1.6]">
      {AREAS.map((area) => (
        <div key={area.en}>
          <dt className="inline m-0 text-ink-soft">{area[lang]}</dt>
          <dd className="inline m-0 text-signal-text before:content-['·'] before:text-dot before:mx-[.45em]">
            {area.acts.map((key, i) => (
              <Fragment key={key}>
                {i > 0 && ' '}
                <span className="whitespace-nowrap">
                  <Link className="text-inherit no-underline rounded-sm transition-[color] duration-180 ease-[ease] hover:text-ink" href={localPath(ACTS[key].href, lang)} title={ACTS[key].title} data-act={key}>{key}</Link>
                  {i < area.acts.length - 1 && ','}
                </span>
              </Fragment>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
