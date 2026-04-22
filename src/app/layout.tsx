import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashFlow — Personal Budget Tracker",
  description: "Track income, expenses, and monthly cash flow with beautiful charts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
