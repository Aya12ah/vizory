import { pageMetadata } from '@/site';
import { PeoplePage } from '@/views/PeoplePage';

export const metadata = pageMetadata('people', 'da');

export default function Page() {
  return <PeoplePage lang="da" />;
}
