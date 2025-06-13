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

export const metadata = {
  title: 'Weather Forecast - Real-time Weather Updates',
  description: 'Get accurate weather forecasts for any city worldwide. Real-time temperature, humidity, wind speed, and more. Stay informed with our modern weather app.',
  keywords: 'weather forecast, weather app, temperature, humidity, wind speed, weather updates, real-time weather',
  openGraph: {
    title: 'Weather Forecast - Real-time Weather Updates',
    description: 'Get accurate weather forecasts for any city worldwide. Real-time temperature, humidity, wind speed, and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Weather Forecast',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Forecast - Real-time Weather Updates',
    description: 'Get accurate weather forecasts for any city worldwide. Real-time temperature, humidity, wind speed, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
