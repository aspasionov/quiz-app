import type { Metadata } from "next";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import SnackBar from "@/components/SnackBar";
import { DynaPuff } from "next/font/google";



import "./globals.css";

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dynapuff",
  display: "swap",
});


export const metadata: Metadata = {
  title: "QuizApp - Create and Take Interactive Quizzes",
  description: "Create, share, and take interactive quizzes with friends and colleagues. Build engaging quizzes with multiple choice questions, track scores, and learn together.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={dynaPuff.variable}>
        <ThemeProvider>
          <Header/>
          {children}
          <SnackBar/>
        </ThemeProvider>
      </body>
    </html>
  );
}
