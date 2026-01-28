import React from 'react';
import { Home, Package, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'home' | 'packages';
  onNavigate: (page: 'home' | 'packages') => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col">
        <div className="p-6 border-b border-[#1e40af]">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-lg text-white">Gestión de Viajes</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'home'
                ? 'bg-[#2563eb] text-white'
                : 'text-blue-100 hover:bg-[#1e40af]'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Reservas</span>
          </button>
          
          <button
            onClick={() => onNavigate('packages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-2 ${
              currentPage === 'packages'
                ? 'bg-[#2563eb] text-white'
                : 'text-blue-100 hover:bg-[#1e40af]'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Paquetes</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
