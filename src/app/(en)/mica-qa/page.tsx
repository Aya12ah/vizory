import { pageMetadata } from '@/site';
import { MicaQaPage } from '@/views/MicaQaPage';

export const metadata = pageMetadata('micaQa', 'en');

export default function Page() {
  return <MicaQaPage lang="en" />;
}
