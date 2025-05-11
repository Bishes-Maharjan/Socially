import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { extractRouterConfig } from 'uploadthing/server';

import { ourFileRouter } from './api/uploadthing/core';
import './globals.css';
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Bishes First Nextjs Project',
  description: 'powered by npx create-next-app@latest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <Navbar />

              <main className="py-8">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3 ">
                      <Sidebar />
                    </div>
                    <div className="lg:col-span-9">
                      <NextSSRPlugin
                        /**
                         * The `extractRouterConfig` will extract **only** the route configs
                         * from the router to prevent additional information from being
                         * leaked to the client. The data passed to the client is the same
                         * as if you were to fetch `/api/uploadthing` directly.
                         */
                        routerConfig={extractRouterConfig(ourFileRouter)}
                      />
                      {children}
                    </div>
                  </div>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
