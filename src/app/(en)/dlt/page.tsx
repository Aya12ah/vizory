import { pageMetadata } from '@/site';
import { DltPage } from '@/views/DltPage';

export const metadata = pageMetadata('dlt', 'en');

export default function Page() {
  return <DltPage lang="en" />;
}
