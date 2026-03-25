import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fotografarte Wedding Planner",
  description: "Organiza os teus casamentos",
  applicationName: "Fotografarte Planner",
  icons: {
    icon: [
      { url: "/app-icon-square.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: ["/app-icon-square.png"],
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
