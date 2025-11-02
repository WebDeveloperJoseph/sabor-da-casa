import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sabor-da-casa.vercel.app'),
  title: "Sabor da Casa",
  description: "Cardápio digital - Sabor da Casa",
  icons: {
    icon: '/img/logoSaborDaCasa.jpg',
    apple: '/img/logoSaborDaCasa.jpg',
    shortcut: '/img/logoSaborDaCasa.jpg'
  },
  openGraph: {
    title: 'Sabor da Casa',
    description: 'Cardápio digital - Sabor da Casa',
    url: '/',
    siteName: 'Sabor da Casa',
    images: [
      {
        url: '/img/logoSaborDaCasa.jpg',
        width: 1200,
        height: 630,
        alt: 'Logo Sabor da Casa'
      }
    ],
    type: 'website',
    locale: 'pt_BR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sabor da Casa',
    description: 'Cardápio digital - Sabor da Casa',
    images: ['/img/logoSaborDaCasa.jpg']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
