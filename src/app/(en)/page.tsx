import { pageMetadata } from '@/site';
import { HomePage } from '@/views/HomePage';

export const metadata = { ...pageMetadata('home', 'en'), verification: { google: 'qSQEl-wBBD4fcWXEHEgUzhLuOM6K78mVQNNcSX2fXgI' } };

export default function Page() {
  return <HomePage lang="en" />;
}
