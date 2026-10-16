import { pageMetadata } from '@/site';
import { PaymentsPage } from '@/views/PaymentsPage';

export const metadata = pageMetadata('payments', 'da');

export default function Page() {
  return <PaymentsPage lang="da" />;
}
