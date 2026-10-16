import { pageMetadata } from '@/site';
import { HomePage } from '@/views/HomePage';

export const metadata = { ...pageMetadata('home', 'da'), verification: { google: 'qSQEl-wBBD4fcWXEHEgUzhLuOM6K78mVQNNcSX2fXgI' } };

export default function Page() {
  return <HomePage lang="da" />;
}
