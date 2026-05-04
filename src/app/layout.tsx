import type { Metadata } from "next";
import { inter, dmSans, geistMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AssocPay — Gestão de Pagamentos para Associações",
  description:
    "Plataforma moderna para gestão de mensalidades, cobranças e membros da sua associação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${dmSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
