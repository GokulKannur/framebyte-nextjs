import { Caveat, Josefin_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});

const josefin_sans = Josefin_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-josefin-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '600', '700'],
});

export const metadata = {
  title: 'FrameByte - Wallpapers',
  description: 'Discover and download free, high-quality 4K and HD wallpapers for your desktop and mobile phone. A curated collection of stunning backgrounds from FrameByte.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${caveat.variable} ${josefin_sans.variable}`}>
        {children}
      </body>
    </html>
  );
}