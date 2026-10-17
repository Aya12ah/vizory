import { pageMetadata } from '@/site';
import { StablecoinsPage } from '@/views/StablecoinsPage';

export const metadata = pageMetadata('stablecoins', 'en');

export default function Page() {
  return <StablecoinsPage lang="en" />;
}
