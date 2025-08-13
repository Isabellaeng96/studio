// src/app/layout.tsx
"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// AppContent component to use auth context
function AppContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    // router.push will be handled by the AuthContext
    return (
       <div className="flex h-screen w-full items-center justify-center">
         Carregando...
       </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
          <title>WellFlow Inventory</title>
          <meta name="description" content="Gestão de estoque para materiais geológicos e de construção." />
          <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider>
          <AuthProvider>
            <AppContent>{children}</AppContent>
            <Toaster />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
