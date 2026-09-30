import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { FinanceProvider } from "@/context/FinanceContext";
import Navbar from "@/components/Navbar";
import AIChat from "@/components/AIChat";
import AuthGuard from "@/components/AuthGuard";
import NextAuthProvider from "@/components/NextAuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Kaxera - El Motor Financiero para PYMEs",
  description: "Unifica la creación de facturas, el control de gastos y la proyección de tus impuestos en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 dark:text-slate-100 font-sans flex flex-col h-screen overflow-hidden transition-colors">
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />
            <LanguageProvider>
              <FinanceProvider>
                <AuthGuard>
                  <Navbar />
                  <div className="flex-1 overflow-y-auto">
                    {children}
                  </div>
                  <AIChat />
                </AuthGuard>
              </FinanceProvider>
            </LanguageProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
