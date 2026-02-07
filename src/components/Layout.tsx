import React from 'react';
import { Home, Package, Users, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'home' | 'packages' | 'usuarios';
  onNavigate: (page: 'home' | 'packages' | 'usuarios') => void;
  onLogout: () => void | Promise<void>;
  userRol?: string | null;
}

export function Layout({ children, currentPage, onNavigate, onLogout, userRol }: LayoutProps) {
  const isAdmin = userRol === 'Admin';
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col">
        <div className="p-6 border-b border-[#1e40af]">
          <h1 className="text-lg text-white font-medium">Alondra Tour Admin</h1>
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

          {isAdmin && (
            <button
              onClick={() => onNavigate('usuarios')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-2 ${
                currentPage === 'usuarios'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-blue-100 hover:bg-[#1e40af]'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Usuarios</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[#1e40af]">
          <button
            onClick={() => onLogout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-[#1e40af] hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Desconectar</span>
          </button>
        </div>

        <div className="p-4 pt-2 border-t border-[#1e40af]">
          <p className="text-xs text-blue-200 text-center">
            © 2026 - Alondra Software
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
