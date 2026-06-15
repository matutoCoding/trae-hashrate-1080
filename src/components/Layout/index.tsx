import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  pageTitle: string;
}

export default function Layout({ children, currentPath, onNavigate, pageTitle }: LayoutProps) {
  return (
    <div className="flex h-screen bg-clay-50 overflow-hidden">
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
