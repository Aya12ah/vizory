import { pageMetadata } from '@/site';
import { AmlPage } from '@/views/AmlPage';

export const metadata = pageMetadata('aml', 'en');

export default function Page() {
  return <AmlPage lang="en" />;
}
