import { pageMetadata } from '@/site';
import { MicaQaPage } from '@/views/MicaQaPage';

export const metadata = pageMetadata('micaQa', 'da');

export default function Page() {
  return <MicaQaPage lang="da" />;
}
