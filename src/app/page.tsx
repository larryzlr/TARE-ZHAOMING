import {routing} from '@/lib/i18n/routing';
import {redirect} from 'next/navigation';

// This page only renders when the `/` route is requested (/en and /de don't)
export default function RootPage() {
  // Redirect to the default locale
  redirect(`/${routing.defaultLocale}`);
}