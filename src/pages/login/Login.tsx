import React, { useState } from 'react';
import { LogIn, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { login } from '../../services/oauth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cedula.trim() || !password.trim()) {
      setError('Ingrese cédula y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(cedula.trim(), password);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Cabecera alineada con el Layout */}
      <header className="bg-[#1e3a8a] text-white py-6 px-8 border-b border-[#1e40af]">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-lg text-white">Gestión de Viajes</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 bg-white border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="h-8 w-8 text-[#1e40af]" />
            <h2 className="text-xl font-semibold text-[#1e40af]">Iniciar sesión</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Ingrese su cédula y contraseña para acceder a la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-700 text-sm font-medium">
                Cédula <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="border-gray-300 bg-white"
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 text-sm font-medium">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 bg-white"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white disabled:opacity-70"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
