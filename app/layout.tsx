import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrandX Admin - API Management System",
  description: "Manage your APIs with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
