import { pageMetadata } from '@/site';
import { MicaPage } from '@/views/MicaPage';

export const metadata = pageMetadata('mica', 'en');

export default function Page() {
  return <MicaPage lang="en" />;
}
