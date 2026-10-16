import { pageMetadata } from '@/site';
import { MicaPage } from '@/views/MicaPage';

export const metadata = pageMetadata('mica', 'da');

export default function Page() {
  return <MicaPage lang="da" />;
}
