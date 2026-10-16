import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  trailingSlash: false,
  poweredByHeader: false,
};

export default createMDX()(nextConfig);
