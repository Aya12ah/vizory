import { pageMetadata } from '@/site';
import { RegulationPage } from '@/views/RegulationPage';

export const metadata = pageMetadata('regulation', 'da');

export default function Page() {
  return <RegulationPage lang="da" />;
}
