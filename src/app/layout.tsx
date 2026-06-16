import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import PitchBackground from "@/components/PitchBackground";
import { getLang } from "@/lib/i18n.server";

export const metadata: Metadata = {
  title: "Welyne · World Cup 2026 Predictions",
  description: "Predict every World Cup 2026 match. Score points. Top the Welyne leaderboard.",
};

// Set the theme before first paint to avoid a flash of the wrong mode.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PitchBackground />
        <Nav />
        {children}
      </body>
    </html>
  );
}
