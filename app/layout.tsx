import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-1380756274291827" crossOrigin="anonymous" strategy="afterInteractive" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
