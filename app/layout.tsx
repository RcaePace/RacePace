import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RacePace — Fund Your Finish",
  description: "Your people put money on it. You train knowing the stakes are real. Cross the line. Collect what you earned.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
