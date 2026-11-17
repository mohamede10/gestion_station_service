"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import SystemAlertContainer from '@/components/SystemAlertContainer';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { StationProvider, useStation } from '@/context/StationContext';

function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthReady, userRole, currentStation } = useStation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !currentUser && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthReady, currentUser, pathname, router]);

  // Pendant l'initialisation ou la redirection
  if (!isAuthReady || (!currentUser && pathname !== '/login')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
      <SystemAlertContainer />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar
          userRole={userRole}
          stationName={currentStation ? currentStation.name : 'VUE CONSOLIDÉE (Toutes Stations)'}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>TotalEnergies - Gestion Station-Service (Kissosso)</title>
        <meta name="description" content="Application Web & Mobile de Gestion Intégrée Multi-Stations TotalEnergies" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TotalEnergies" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <StationProvider>
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <MainLayout>{children}</MainLayout>
        </StationProvider>
      </body>
    </html>
  );
}
