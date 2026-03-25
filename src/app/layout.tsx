import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fotografarte Wedding Planner",
  description: "Organiza os teus casamentos",
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
