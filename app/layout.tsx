import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Geist_Mono } from "next/font/google";
import NeuralNet from "@/components/NeuralNet";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://oralemreozan.vercel.app";
const SITE_DESCRIPTION =
  "Portfolio of Emre Ozan Oral, a Computer Science graduate specializing in AI, multi-agent systems, and LLM-based applications.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Emre Ozan Oral – AI & Software Engineer",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Emre Ozan Oral – AI & Software Engineer",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emre Ozan Oral – AI & Software Engineer",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.jpg"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Emre Ozan Oral",
  url: SITE_URL,
  jobTitle: "AI & Software Engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Sabanci University",
  },
  sameAs: [
    "https://www.linkedin.com/in/emre-ozan-oral/",
    "https://github.com/emre-ozan-oral",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <div className="bg-mesh" aria-hidden />
        <div className="bg-network" aria-hidden>
          <NeuralNet />
        </div>
        {children}
      </body>
    </html>
  );
}
