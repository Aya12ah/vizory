// Countries for the country and phone fields of the lead form: ISO 3166 code, international dialling
// code, flag and name. Names come from the browser's own translations (Intl.DisplayNames), so they
// read right in Danish and English without a list of our own; the flag is the code's two regional
// indicator letters (some systems, e.g. Windows, show those letters instead of a flag).
import type { Lang } from '../i18n/lang';

const DIAL = 'AD376 AE971 AF93 AG1 AI1 AL355 AM374 AO244 AR54 AS1 AT43 AU61 AW297 AX358 AZ994 BA387 BB1 BD880 BE32 BF226 BG359 BH973 BI257 BJ229 BL590 BM1 BN673 BO591 BQ599 BR55 BS1 BT975 BW267 BY375 BZ501 CA1 CD243 CF236 CG242 CH41 CI225 CK682 CL56 CM237 CN86 CO57 CR506 CU53 CV238 CW599 CY357 CZ420 DE49 DJ253 DK45 DM1 DO1 DZ213 EC593 EE372 EG20 ER291 ES34 ET251 FI358 FJ679 FK500 FM691 FO298 FR33 GA241 GB44 GD1 GE995 GF594 GG44 GH233 GI350 GL299 GM220 GN224 GP590 GQ240 GR30 GT502 GU1 GW245 GY592 HK852 HN504 HR385 HT509 HU36 ID62 IE353 IL972 IM44 IN91 IQ964 IR98 IS354 IT39 JE44 JM1 JO962 JP81 KE254 KG996 KH855 KI686 KM269 KN1 KP850 KR82 KW965 KY1 KZ7 LA856 LB961 LC1 LI423 LK94 LR231 LS266 LT370 LU352 LV371 LY218 MA212 MC377 MD373 ME382 MF590 MG261 MH692 MK389 ML223 MM95 MN976 MO853 MP1 MQ596 MR222 MS1 MT356 MU230 MV960 MW265 MX52 MY60 MZ258 NA264 NC687 NE227 NG234 NI505 NL31 NO47 NP977 NR674 NU683 NZ64 OM968 PA507 PE51 PF689 PG675 PH63 PK92 PL48 PM508 PR1 PS970 PT351 PW680 PY595 QA974 RE262 RO40 RS381 RU7 RW250 SA966 SB677 SC248 SD249 SE46 SG65 SH290 SI386 SK421 SL232 SM378 SN221 SO252 SR597 SS211 ST239 SV503 SX1 SY963 SZ268 TC1 TD235 TG228 TH66 TJ992 TL670 TM993 TN216 TO676 TR90 TT1 TV688 TW886 TZ255 UA380 UG256 US1 UY598 UZ998 VA39 VC1 VE58 VG1 VI1 VN84 VU678 WF681 WS685 XK383 YE967 YT262 ZA27 ZM260 ZW263';

/** Dialling code (without +) by ISO code. */
export const dialCodes: Record<string, string> = Object.fromEntries(DIAL.split(' ').map((x) => [x.slice(0, 2), x.slice(2)]));

/** The flag of an ISO code, as two regional indicator symbols. */
export const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const names = new Map<Lang, Intl.DisplayNames>();
/** The country's name in the language. */
export function countryName(code: string, lang: Lang): string {
  if (!names.has(lang)) names.set(lang, new Intl.DisplayNames([lang], { type: 'region' }));
  try { return names.get(lang)!.of(code) ?? code; } catch { return code; }
}

/** Every country, sorted by its name in the language. */
export function countries(lang: Lang): { code: string; name: string; dial: string }[] {
  return Object.keys(dialCodes)
    .map((code) => ({ code, name: countryName(code, lang), dial: dialCodes[code] }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

/** The main country of a dialling code that several share. */
const MAIN: Record<string, string> = { 1: 'US', 7: 'RU', 39: 'IT', 44: 'GB', 212: 'MA', 262: 'RE', 358: 'FI', 590: 'GP', 599: 'CW' };

/** The country whose dialling code begins a full number (+4512345678 → DK), the longest code first.
 *  Among countries that share a code (+1), `prefer` wins, else the code's main country. */
export function countryOfNumber(full: string, prefer?: string): string | null {
  const digits = full.replace(/[^\d]/g, '');
  for (let n = 4; n >= 1; n--) {
    const code = digits.slice(0, n);
    const hits = Object.keys(dialCodes).filter((c) => dialCodes[c] === code);
    if (hits.length) return prefer && hits.includes(prefer) ? prefer : MAIN[code] ?? hits[0];
  }
  return null;
}
