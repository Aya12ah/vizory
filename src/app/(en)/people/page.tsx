import { pageMetadata } from '@/site';
import { PeoplePage } from '@/views/PeoplePage';

export const metadata = pageMetadata('people', 'en');

export default function Page() {
  return <PeoplePage lang="en" />;
}
