import type { Metadata } from "next";
import { Gasoek_One, Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const gasoekOne = Gasoek_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const newsreader = Newsreader({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Geordie Ellis",
  description:
    "Portfolio of Geordie Ellis — software developer and AI product builder.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${gasoekOne.variable} ${plusJakartaSans.variable} ${newsreader.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
