import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  // The App Router's root layout writes <head> itself; the rule is for the Pages Router.
  { files: ['src/components/RootLayout.tsx'], rules: { '@next/next/no-head-element': 'off' } },
];

export default config;
