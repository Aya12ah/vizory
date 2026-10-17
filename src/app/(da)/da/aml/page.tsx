import { pageMetadata } from '@/site';
import { AmlPage } from '@/views/AmlPage';

export const metadata = pageMetadata('aml', 'da');

export default function Page() {
  return <AmlPage lang="da" />;
}
