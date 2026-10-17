// Vizory's "get started" flow, as data for the engine (src/lead/engine.ts): the questions a first
// meeting with Vizory would ask, the conditions that show the follow-up questions per area, the rules
// that tag a brief as urgent or put it on a track, and the sections of the brief. To change the
// flow, change this file; the engine and the form stay as they are.
import type { Flow, Option, Text } from '../engine';

const t = (en: string, da: string): Text => ({ en, da });
const o = (id: string, en: string, da: string, link?: string): Option => ({ id, label: t(en, da), ...(link ? { link } : {}) });
const yesNo = [o('yes', 'Yes', 'Ja'), o('no', 'No', 'Nej')];

export const vizoryFlow: Flow = {
  id: 'vizory',
  subjectQuestion: 'company',
  words: { none: t('Not answered', 'Ikke besvaret'), yes: t('Yes', 'Ja'), no: t('No', 'Nej'), assessment: t('First sorting', 'Første sortering') },
  sections: [
    { id: 'need', title: t('Need', 'Behov') },
    { id: 'crypto', title: t('Crypto-assets (MiCA)', 'Kryptoaktiver (MiCA)') },
    { id: 'stablecoins', title: t('Stablecoins', 'Stablecoins') },
    { id: 'payments', title: t('Payments and e-money', 'Betalinger og e-penge') },
    { id: 'dlt', title: t('DLT and tokenisation', 'DLT og tokenisering') },
    { id: 'aml', title: t('AML/CFT', 'Hvidvask') },
    { id: 'timing', title: t('Timing', 'Tidshorisont') },
    { id: 'company', title: t('Company', 'Virksomhed') },
    { id: 'contact', title: t('Contact', 'Kontakt') },
  ],
  steps: [
    {
      id: 'area', title: t('What is it about?', 'Hvad drejer det sig om?'), intro: t('Choose one or more.', 'Vælg et eller flere.'),
      questions: [{
        id: 'area', type: 'multi', required: true, section: 'need', label: t('Area', 'Område'),
        options: [
          o('crypto', 'Crypto-assets (MiCA)', 'Kryptoaktiver (MiCA)', '/mica'),
          o('stablecoins', 'Stablecoins (EMT and ART)', 'Stablecoins (EMT og ART)', '/stablecoins'),
          o('payments', 'Payments and e-money', 'Betalinger og e-penge', '/payments'),
          o('dlt', 'DLT and tokenisation', 'DLT og tokenisering', '/dlt'),
          o('aml', 'AML/CFT', 'Hvidvask', '/aml'),
          o('unsure', 'Not sure yet', 'Ved ikke endnu'),
        ],
      }],
    },
    {
      id: 'status', title: t('Where are you today?', 'Hvor står I i dag?'),
      questions: [{
        id: 'status', type: 'single', required: true, section: 'need', label: t('Status', 'Status'),
        options: [
          o('new', 'A new firm without an authorisation', 'Ny virksomhed uden tilladelse'),
          o('expand', 'We hold a financial authorisation and want to expand', 'Vi har en finansiel tilladelse og vil udvide'),
          o('strengthen', 'We hold an authorisation and want to strengthen compliance', 'Vi har tilladelse og vil styrke compliance'),
          o('fsa-contact', 'The Danish FSA or another authority has contacted us', 'Finanstilsynet eller en anden myndighed har henvendt sig'),
        ],
      }],
    },
    {
      id: 'crypto', title: t('Crypto-assets', 'Kryptoaktiver'), showIf: { area: { includes: 'crypto' } },
      questions: [
        {
          id: 'cryptoServices', type: 'multi', section: 'crypto', label: t('Which crypto-asset services?', 'Hvilke kryptoaktivtjenester?'),
          options: [
            o('custody', 'Custody and administration on behalf of clients', 'Opbevaring og forvaltning på vegne af kunder'),
            o('platform', 'Operation of a trading platform', 'Drift af en handelsplatform'),
            o('exchange', 'Exchange for funds or other crypto-assets', 'Veksling til penge eller andre kryptoaktiver'),
            o('execution', 'Execution of orders on behalf of clients', 'Udførelse af ordrer på vegne af kunder'),
            o('placing', 'Placing of crypto-assets', 'Placering af kryptoaktiver'),
            o('rto', 'Reception and transmission of orders', 'Modtagelse og formidling af ordrer'),
            o('advice', 'Advice on crypto-assets', 'Rådgivning om kryptoaktiver'),
            o('portfolio', 'Portfolio management', 'Porteføljepleje'),
            o('transfer', 'Transfer services on behalf of clients', 'Overførselstjenester på vegne af kunder'),
          ],
        },
        {
          id: 'cryptoLicence', type: 'single', required: true, section: 'crypto', options: yesNo,
          label: t('Do you already hold another financial authorisation, e.g. as a credit institution, investment firm or e-money institution?', 'Har I allerede en anden finansiel tilladelse, fx som kreditinstitut, investeringsselskab eller e-pengeinstitut?'),
        },
      ],
    },
    {
      id: 'stablecoins', title: t('Stablecoins', 'Stablecoins'), showIf: { area: { includes: 'stablecoins' } },
      questions: [
        {
          id: 'stableRole', type: 'single', required: true, section: 'stablecoins', label: t('Your role', 'Jeres rolle'),
          options: [
            o('emt', 'Issuer of an e-money token (EMT)', 'Udsteder af et e-pengetoken (EMT)'),
            o('art', 'Issuer of an asset-referenced token (ART)', 'Udsteder af et token med aktivreference (ART)'),
            o('casp', 'A CASP offering stablecoins', 'En CASP, der tilbyder stablecoins'),
            o('other', 'Other', 'Andet'),
          ],
        },
        {
          id: 'stableLicence', type: 'single', required: true, section: 'stablecoins', options: yesNo, showIf: { stableRole: { equals: 'emt' } },
          label: t('Do you hold an authorisation as a credit institution or e-money institution?', 'Har I tilladelse som kreditinstitut eller e-pengeinstitut?'),
        },
      ],
    },
    {
      id: 'payments', title: t('Payments and e-money', 'Betalinger og e-penge'), showIf: { area: { includes: 'payments' } },
      questions: [
        {
          id: 'payServices', type: 'multi', section: 'payments', label: t('Which payment services?', 'Hvilke betalingstjenester?'),
          options: [
            o('cash', 'Cash deposits and withdrawals', 'Indbetaling og udbetaling af kontanter'),
            o('execution', 'Execution of payment transactions', 'Udførelse af betalingstransaktioner'),
            o('issuing', 'Issuing and acquiring', 'Udstedelse og indløsning (acquiring)'),
            o('remittance', 'Money remittance', 'Pengeoverførsel'),
            o('pis', 'Payment initiation', 'Betalingsinitiering'),
            o('ais', 'Account information', 'Kontooplysning'),
          ],
        },
        { id: 'payEmoney', type: 'single', required: true, section: 'payments', options: yesNo, label: t('Will you issue electronic money?', 'Vil I udstede elektroniske penge?') },
        {
          id: 'payVolume', type: 'single', required: true, section: 'payments', label: t('Expected monthly payment volume', 'Forventet månedlig betalingsvolumen'),
          options: [o('under3', 'Under EUR 3 million', 'Under 3 mio. euro'), o('over3', 'Over EUR 3 million', 'Over 3 mio. euro'), o('unknown', 'Not sure yet', 'Ved ikke endnu')],
        },
        { id: 'payEu', type: 'single', section: 'payments', options: yesNo, label: t('Do you plan to offer services in other EU countries?', 'Vil I tilbyde tjenester i andre EU-lande?') },
      ],
    },
    {
      id: 'dlt', title: t('DLT and tokenisation', 'DLT og tokenisering'), showIf: { area: { includes: 'dlt' } },
      questions: [{
        id: 'dltRole', type: 'single', required: true, section: 'dlt', label: t('Your role', 'Jeres rolle'),
        options: [
          o('infrastructure', 'Market infrastructure (trading or settlement)', 'Markedsinfrastruktur (handel eller afvikling)'),
          o('issuer', 'Issuer of tokenised instruments', 'Udsteder af tokeniserede instrumenter'),
          o('investment-firm', 'Investment firm', 'Investeringsselskab'),
          o('other', 'Other', 'Andet'),
        ],
      }],
    },
    {
      id: 'aml', title: t('AML/CFT', 'Hvidvask'), showIf: { area: { includes: 'aml' } },
      questions: [{
        id: 'amlChallenge', type: 'multi', required: true, section: 'aml', label: t('Where is the challenge?', 'Hvor ligger udfordringen?'),
        options: [
          o('risk', 'Risk assessment', 'Risikovurdering'),
          o('policies', 'Policies and procedures', 'Politikker og procedurer'),
          o('control', 'Control function', 'Kontrolfunktion'),
          o('supervision', 'Follow-up on supervision', 'Opfølgning på tilsyn'),
          o('other', 'Other', 'Andet'),
        ],
      }],
    },
    {
      id: 'help', title: t('What should Vizory help with?', 'Hvad skal Vizory hjælpe med?'), intro: t('Choose one or more.', 'Vælg et eller flere.'),
      questions: [{
        id: 'help', type: 'multi', required: true, section: 'need', label: t('Help', 'Hjælp'),
        options: [
          o('application', 'Application or notification', 'Ansøgning eller meddelelse'),
          o('gap', 'Gap analysis of policies and governance', 'Gap-analyse af politikker og governance'),
          o('management', 'Preparing the management body', 'Forberedelse af ledelsen'),
          o('mock', 'Mock-inspection', 'Mock-inspektion'),
          o('dialogue', 'Dialogue with the Danish FSA', 'Dialog med Finanstilsynet'),
          o('ongoing', 'Ongoing compliance', 'Løbende compliance'),
        ],
      }],
    },
    {
      id: 'timing', title: t('When?', 'Hvornår?'),
      questions: [
        {
          id: 'timing', type: 'single', required: true, section: 'timing', label: t('Timing', 'Tidshorisont'),
          options: [o('1m', 'Within 1 month', 'Inden for 1 måned'), o('3m', 'Within 3 months', 'Inden for 3 måneder'), o('6m', 'Within 6 months', 'Inden for 6 måneder'), o('later', 'Later', 'Senere')],
        },
        { id: 'deadline', type: 'date', section: 'timing', label: t('Is there a fixed deadline? (optional)', 'Er der en fast frist? (valgfri)') },
      ],
    },
    {
      id: 'company', title: t('About the company', 'Om virksomheden'),
      questions: [
        { id: 'company', type: 'text', required: true, section: 'company', maxLength: 120, autocomplete: 'organization', label: t('Company name', 'Virksomhedens navn') },
        { id: 'country', type: 'country', required: true, section: 'company', autocomplete: 'country', fromGeo: true, label: t('Country', 'Land') },
        {
          id: 'size', type: 'single', section: 'company', label: t('Employees', 'Antal ansatte'),
          options: [o('1-10', '1–10', '1–10'), o('11-50', '11–50', '11–50'), o('51-250', '51–250', '51–250'), o('250+', 'Over 250', 'Over 250')],
        },
        { id: 'website', type: 'text', section: 'company', maxLength: 200, autocomplete: 'url', label: t('Website (optional)', 'Hjemmeside (valgfri)') },
      ],
    },
    {
      id: 'contact', title: t('Contact', 'Kontakt'),
      questions: [
        { id: 'name', type: 'text', required: true, section: 'contact', maxLength: 120, autocomplete: 'name', label: t('Name', 'Navn') },
        { id: 'role', type: 'text', section: 'contact', maxLength: 120, autocomplete: 'organization-title', label: t('Role (optional)', 'Rolle (valgfri)') },
        { id: 'email', type: 'email', required: true, section: 'contact', maxLength: 200, autocomplete: 'email', label: t('Email', 'E-mail') },
        { id: 'phone', type: 'phone', section: 'contact', countryFrom: 'country', autocomplete: 'tel', label: t('Phone (optional)', 'Telefon (valgfri)') },
        { id: 'message', type: 'textarea', section: 'contact', maxLength: 2000, label: t('Anything else we should know? (optional)', 'Andet, vi bør vide? (valgfri)') },
      ],
    },
    {
      id: 'confirm', title: t('Check and send', 'Gennemse og send'), summary: true,
      questions: [{
        id: 'consent', type: 'consent', required: true,
        label: t('I agree that Vizory uses my answers to reply to my request.', 'Jeg accepterer, at Vizory bruger mine svar til at besvare min henvendelse.'),
      }],
    },
  ],
  tags: [
    { id: 'urgent', kind: 'flag', label: t('Urgent', 'Haster') },
    { id: 'casp', kind: 'track', label: t('CASP authorisation', 'Ansøgning om CASP-tilladelse') },
    { id: 'art60', kind: 'track', label: t('Notification under Article 60', 'Meddelelse efter artikel 60') },
    { id: 'emt-licence', kind: 'track', label: t('EMT: needs authorisation as a credit or e-money institution', 'EMT: kræver tilladelse som kredit- eller e-pengeinstitut') },
    { id: 'art-issuer', kind: 'track', label: t('ART: authorisation as issuer under MiCA Title III', 'ART: tilladelse som udsteder efter MiCA afsnit III') },
    { id: 'emi', kind: 'track', label: t('E-money institution', 'E-pengeinstitut') },
    { id: 'limited', kind: 'track', label: t('Payments: a limited authorisation may be enough', 'Betalinger: begrænset tilladelse kan være nok') },
    { id: 'full', kind: 'track', label: t('Payments: full authorisation', 'Betalinger: fuld tilladelse') },
  ],
  rules: [
    { when: { status: { equals: 'fsa-contact' } }, tag: 'urgent' },
    { when: { timing: { in: ['1m', '3m'] } }, tag: 'urgent' },
    { when: { deadline: { withinDays: 92 } }, tag: 'urgent' },
    { when: { area: { includes: 'crypto' }, cryptoLicence: { equals: 'no' } }, tag: 'casp' },
    { when: { area: { includes: 'crypto' }, cryptoLicence: { equals: 'yes' } }, tag: 'art60' },
    { when: { area: { includes: 'stablecoins' }, stableRole: { equals: 'emt' }, stableLicence: { equals: 'no' } }, tag: 'emt-licence' },
    { when: { area: { includes: 'stablecoins' }, stableRole: { equals: 'art' } }, tag: 'art-issuer' },
    { when: { area: { includes: 'payments' }, payEmoney: { equals: 'yes' } }, tag: 'emi' },
    { when: { area: { includes: 'payments' }, payEmoney: { equals: 'no' }, payVolume: { equals: 'under3' } }, tag: 'limited' },
    { when: { area: { includes: 'payments' }, payEmoney: { equals: 'no' }, payVolume: { equals: 'over3' } }, tag: 'full' },
  ],
};
