import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Building2, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getAllPaquetes, type Paquete } from '../../services/paquetes';

interface PackageListProps {
  onCreateNew: () => void;
}

function formatPrecio(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PackageList({ onCreateNew }: PackageListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaquetes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPaquetes();
        setPackages(data);
      } catch (err: unknown) {
        const msg = err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al cargar los paquetes';
        setError(msg);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    loadPaquetes();
  }, []);

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noHayDatos = !loading && packages.length === 0;
  const noHayResultadosFiltro = !loading && packages.length > 0 && filteredPackages.length === 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Paquetes de Viaje</h1>
        <p className="text-gray-600">Administra y crea paquetes turísticos personalizados</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6 bg-white border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-2 text-gray-700">Buscar paquetes</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, pais o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
          </div>

          <Button
            onClick={onCreateNew}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nuevo paquete
          </Button>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="p-12 text-center bg-white border-gray-200">
          <p className="text-gray-500">Cargando paquetes...</p>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-6 mb-6 bg-white border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Mensaje cuando no hay datos en la base */}
      {noHayDatos && !error && (
        <Card className="p-12 text-center bg-white border-gray-200">
          <p className="text-gray-500">No hay paquetes registrados.</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer paquete para verlo aquí.</p>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados por filtros */}
      {noHayResultadosFiltro && (
        <Card className="p-12 text-center bg-white border-gray-200">
          <p className="text-gray-500">No se encontraron paquetes con los filtros aplicados.</p>
        </Card>
      )}

      {/* Packages Grid (mismo aspecto que antes) */}
      {!loading && filteredPackages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <Card
              key={pkg.idPaquete}
              className="p-5 bg-white border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-[#1e40af] mb-2">{pkg.nombre}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{pkg.ciudad}, {pkg.pais}</span>
                </div>
                {pkg.descripcion && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{pkg.descripcion}</p>
                )}
              </div>

              {pkg.paquetesDetalles && (
                <div className="border-t border-gray-200 pt-3 mb-3 space-y-1">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Calendar className="h-4 w-4 text-[#60a5fa]" />
                    <span>
                      {pkg.paquetesDetalles.fechaInicio} — {pkg.paquetesDetalles.fechaFin}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 text-[#60a5fa]" />
                  <span className="text-sm">Hoteles incluidos:</span>
                </div>
                {pkg.hoteles && pkg.hoteles.length > 0 ? (
                  <ul className="space-y-1">
                    {pkg.hoteles.map((h) => (
                      <li key={h.idHotel} className="text-sm text-gray-600 pl-6">
                        • {h.nombre}
                        {h.precio != null ? ` — ${formatPrecio(h.precio)}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 pl-6">No hay hoteles asociados.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
