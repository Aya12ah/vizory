import { pageMetadata } from '@/site';
import { LeadPage } from '@/views/LeadPage';

export const metadata = pageMetadata('getStarted', 'da');

export default function Page() {
  return <LeadPage lang="da" />;
}
