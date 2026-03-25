import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fotografarte Wedding Planner",
  description: "Organiza os teus casamentos",
  applicationName: "Fotografarte Planner",
  icons: {
    icon: [
      { url: "/logo-fotografarte-corporate2.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo-fotografarte-corporate2.png", type: "image/png" },
    ],
    shortcut: ["/logo-fotografarte-corporate2.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fotografarte Planner",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
