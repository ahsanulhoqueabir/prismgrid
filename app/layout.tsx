import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CentralDataInitializer } from "@/components/shared/central-initializer";
import { brand } from "@/config/brand.config";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: brand.seo.title,
    template: brand.seo.titleTemplate,
  },
  description: brand.seo.description,
  keywords: [...brand.seo.keywords],
  authors: [{ name: brand.seo.author }],
  creator: brand.metadata.creator,
  publisher: brand.metadata.publisher,
  metadataBase: new URL(brand.seo.metadataBase),
  openGraph: {
    type: brand.openGraph.type as "website",
    locale: brand.openGraph.locale,
    siteName: brand.openGraph.siteName,
    title: brand.openGraph.title,
    description: brand.openGraph.description,
    images: [{ url: brand.assets.ogImage }],
  },
  twitter: {
    card: brand.twitter.card as "summary_large_image",
    creator: brand.twitter.creator,
    title: brand.seo.title,
    description: brand.seo.description,
  },
  icons: {
    icon: brand.assets.favicon,
    apple: brand.assets.appleIcon,
  },
  manifest: brand.assets.manifest,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CentralDataInitializer />
        {children}
      </body>
    </html>
  );
}
