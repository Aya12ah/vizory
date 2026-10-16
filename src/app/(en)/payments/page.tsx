import { pageMetadata } from '@/site';
import { PaymentsPage } from '@/views/PaymentsPage';

export const metadata = pageMetadata('payments', 'en');

export default function Page() {
  return <PaymentsPage lang="en" />;
}
