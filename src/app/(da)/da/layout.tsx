import type { ReactNode } from 'react';
import { RootLayout, rootMetadata, rootViewport } from '@/components/RootLayout';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout lang="da">{children}</RootLayout>;
}
