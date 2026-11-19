import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  trailingSlash: false,
  poweredByHeader: false,
  // Danny's law lookup app is a finished static app in public/lov/ (not built by Next), shown in a
  // window on the front page (src/components/LawShortcut.tsx). It is kept out of search engines
  // with a header, so its own files stay unchanged.
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/lov/:path*', headers: noindex },
    ];
  },
};

export default createMDX()(nextConfig);
