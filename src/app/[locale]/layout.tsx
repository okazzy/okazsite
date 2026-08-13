import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Cinzel, Lato, Noto_Kufi_Arabic } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioProvider } from '@/contexts/AudioContext';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import MiniPlayer from '@/components/layout/MiniPlayer';
import CookieBanner from '@/components/ui/CookieBanner';
import SmartAppBanner from '@/components/ui/SmartAppBanner';
import '@/app/globals.css';
import '@/components/layout/layout.css';
import CanonicalLink from '@/components/layout/CanonicalLink';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.okaz.io'),
  title: 'عكاظ | Okaz',
  description: 'Okaz - Mindfulness, meditation, and healing frequencies',
  itunes: {
    appId: '6780990007',
  },
};

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });
const lato = Lato({ weight: ['300', '400', '700', '900'], subsets: ['latin'], variable: '--font-lato', display: 'swap' });
const notoKufi = Noto_Kufi_Arabic({ subsets: ['arabic'], variable: '--font-arabic', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${cinzel.variable} ${lato.variable} ${notoKufi.variable}`}>
      <head>
        <CanonicalLink />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AudioProvider>
              <div className="app-layout">
                <SmartAppBanner />
                <Navbar locale={locale} />
                <main className="main-content">{children}</main>
                <MiniPlayer locale={locale} />
                <BottomNav locale={locale} />
                <CookieBanner />
              </div>
            </AudioProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
