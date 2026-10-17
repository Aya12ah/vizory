import { pageMetadata } from '@/site';
import { StablecoinsPage } from '@/views/StablecoinsPage';

export const metadata = pageMetadata('stablecoins', 'da');

export default function Page() {
  return <StablecoinsPage lang="da" />;
}
