import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-surface-50 font-sans">
      <Header />
      <main className="flex-1 flex flex-col w-full relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
