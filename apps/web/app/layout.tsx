import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/layout/Providers';
import { Navbar } from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Apex Academy - Result Processing & GPA Engine',
  description:
    'Institutional School Result Calculation, GPA Engine, Audit Trace, and Teacher Verification System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-neutral-50 text-zinc-950 antialiased font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto px-4">
              Apex Academy Examination Result &amp; GPA Engine &bull; Compliant with Rules R-10, R-11, R-12, R-13, and R-29.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
