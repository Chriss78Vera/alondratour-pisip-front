import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { login } from '../../services/oauth';

const LOGO_IMAGE_URL =
  'https://static.wixstatic.com/media/abb1dd_d7de3242580e481cbe35cd6e7c78943e~mv2.png/v1/fill/w_256,h_140,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Recurso%201.png';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!correo.trim() || !password.trim()) {
      setError('Ingrese correo electrónico y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(correo.trim(), password);
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
      <header className="py-3 px-6">
        <div className="flex items-center justify-start" style={{ width: '20%', maxHeight: '30%'}}>
          <img
            src={LOGO_IMAGE_URL}
            alt="Gestión de Viajes"
            style={{ width: '60%', height: '30%', objectFit: 'contain' }}
          />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 bg-white border-gray-200 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="h-8 w-8 text-[#1e40af]" />
            <h2 className="text-xl font-semibold text-[#1e40af]">Iniciar sesión</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Ingrese su correo electrónico y contraseña para acceder a la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-700 text-sm font-medium">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="border-gray-300 bg-white"
                autoComplete="email"
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                <p className="font-bold text-red-700">{error}</p>
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
