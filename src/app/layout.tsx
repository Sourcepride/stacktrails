import UploadProgress from "@/common/media/UploadProgres";
import AuthWrapper from "@/components/auth/AuthWrapper";
import QueryMessagesWrapper from "@/components/auth/QueryMessagesWrapper";
import Providers from "@/lib/QueryProvider";
import { StoreProvider } from "@/store/provider";
import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Bebas_Neue, Lexend } from "next/font/google";
import { Toaster } from "sonner";
import theme from "../theme";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// 1. CHOOSE A GOOD BASE URL
const siteUrl = "https://stacktrails.com";

// 2. REFINE YOUR TITLE AND DESCRIPTION
const siteTitle = "StackTrails: Collaborative Learning, Structured Paths";
const siteDescription =
  "StackTrails is an open platform where communities create and share structured learning paths. Built by learners, for learners, we turn information chaos into a collaborative journey.";

export const metadata: Metadata = {
  // --- IMPORTANT: SETS THE BASE URL ---
  metadataBase: new URL(siteUrl),

  // --- MAIN SEO TAGS ---
  title: {
    default: siteTitle, // The default title for the site
    template: `%s | StackTrails`, // How page-specific titles will look (e.g., "About Us | StackTrails")
  },
  description: siteDescription,
  authors: [{ name: "Goodnews", url: "https://dev.osonwa.com" }], // Your original 'authors'
  creator: "Goodnews Osonwa",

  // --- ROBOTS & CANONICAL ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/", // This page is the root, update for other pages
  },

  // --- KEYWORDS (Good to have) ---
  keywords: [
    "StackTrails",
    "collaborative learning",
    "structured learning",
    "open learning platform",
    "community learning",
    "learning resources",
    "social learning",
    "e-learning community",
    "learn to code",
    "shared learning paths",
  ],

  // --- ICONS & FAVICONS ---
  icons: {
    icon: "/favicon.ico", // Standard favicon
    shortcut: "/favicon-16x16.png", // Legacy shortcut
    apple: "/apple-touch-icon.png", // For Apple devices
    other: {
      rel: "android-chrome-192x192", // For Android devices
      url: "/android-chrome-192x192.png",
    },
  },

  // --- OPEN GRAPH (FOR FACEBOOK, LINKEDIN, DISCORD, ETC.) ---
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl, // The canonical URL for this page
    siteName: "StackTrails",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StackTrails - Collaborative Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // --- TWITTER (FOR X) ---
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@stacktrails",
    site: "@stackTrails",
    images: ["/og-image.png"],
  },

  // --- OTHER ---
  manifest: "/site.webmanifest", // For PWA capabilities
};

export const viewport = {
  themeColor: "#1e90ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/black-logo.svg" type="image/svg" sizes="32x32" />
      <body className={`${bebas.variable} ${lexend.variable} antialiased`}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <NextIntlClientProvider>
              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
              >
                <StoreProvider>
                  <Providers>
                    <AuthWrapper>
                      <Toaster expand position="top-right" />
                      <Toaster id={"canvas"} position="top-center" />
                      <QueryMessagesWrapper>{children}</QueryMessagesWrapper>
                      <UploadProgress />
                    </AuthWrapper>
                  </Providers>
                </StoreProvider>
              </GoogleOAuthProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
        <a href="https://storyset.com/education" className="hidden">
          Education illustrations by Storyset
        </a>
        <a href="https://storyset.com/people" className="hidden">
          People illustrations by Storyset
        </a>
        <a href="https://storyset.com/work" className="hidden">
          Work illustrations by Storyset
        </a>
        <a href="https://storyset.com/communication" className="hidden">
          Communication illustrations by Storyset
        </a>
        <a href="https://storyset.com/data" className="hidden">
          Data illustrations by Storyset
        </a>
        <a href="https://storyset.com/home" className="hidden">
          Home illustrations by Storyset
        </a>
        <a href="https://storyset.com/space" className="hidden">
          Space illustrations by Storyset
        </a>
        <a href="https://storyset.com/multi-purpose" className="hidden">
          Multi-purpose illustrations by Storyset
        </a>
        <a href="https://storyset.com/transport" className="hidden">
          Transport illustrations by Storyset
        </a>
        <a href="https://storyset.com/celebration" className="hidden">
          Celebration illustrations by Storyset
        </a>
        <a
          target="_blank"
          href="https://icons8.com/icon/13630/google-drive"
          className="hidden"
        >
          Drive
        </a>
        <a
          target="_blank"
          href="https://icons8.com/icon/13657/dropbox"
          className="hidden"
        >
          Dropbox
        </a>
        <a
          target="_blank"
          href="https://icons8.com/icon/JHFYPQIPcXti/folder"
          className="hidden"
        >
          Folder
        </a>{" "}
        <a
          target="_blank"
          href="https://icons8.com/icon/19318/youtube"
          className="hidden"
        >
          YouTube
        </a>{" "}
        <a
          target="_blank"
          href="https://icons8.com/icon/aZKKHRzL5LgV/alight-motion"
          className="hidden"
        >
          Alight Motion
        </a>
        <a target="_blank" href="https://icons8.com" className="hidden">
          Icons8
        </a>
        {/* <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script> */}
      </body>
    </html>
  );
}
