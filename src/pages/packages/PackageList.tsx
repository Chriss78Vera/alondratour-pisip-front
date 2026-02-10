import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getAllPaquetes, type Paquete } from '../../services/paquetes';
import { EditPackage, type PaqueteConEstado } from './EditPackage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { formatPrecio } from '../../utils/priceFormats';
import { truncate } from '../../utils/stringFormats';
import { ROWS_PER_PAGE, MAX_DESC_LENGTH, MAX_NOMBRE_LENGTH } from '../../utils/constants';

interface PackageListProps {
  onCreateNew: () => void;
}

export function PackageList({ onCreateNew }: PackageListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Paquete | null>(null);

  const loadPaquetes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPaquetes();
      setPackages(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al cargar los paquetes';
      setError(msg);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaquetes();
  }, [loadPaquetes]);

  const filteredPackages = useMemo(
    () =>
      packages.filter(
        (pkg) =>
          pkg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [packages, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () =>
      filteredPackages.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredPackages, currentPage]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const noHayDatos = !loading && packages.length === 0;
  const noHayResultadosFiltro = !loading && packages.length > 0 && filteredPackages.length === 0;

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Paquetes de Viaje</h1>
        <p className="text-gray-600">Cargando paquetes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Paquetes de Viaje</h1>
        <p className="font-bold text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Paquetes de Viaje</h1>
        <p className="text-gray-600">Administra y crea paquetes turísticos personalizados</p>
      </div>

      {selectedPackage && (
        <EditPackage
          package={
            (packages.find((p) => p.idPaquete === selectedPackage.idPaquete) ||
              selectedPackage) as PaqueteConEstado
          }
          onSave={() => {
            setSelectedPackage(null);
            loadPaquetes();
          }}
          onCancel={() => {
            setSelectedPackage(null);
            loadPaquetes();
          }}
        />
      )}
      {!selectedPackage && (
        <>
          <Card className="p-6 mb-6 bg-white border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block mb-2 text-gray-700">Buscar paquetes</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, país o ciudad..."
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

          {noHayDatos && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No hay paquetes registrados.</p>
              <p className="text-gray-500 text-sm mt-1">Crea tu primer paquete para verlo aquí.</p>
            </div>
          )}

          {noHayResultadosFiltro && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No se encontraron paquetes con los filtros aplicados.</p>
            </div>
          )}

          {filteredPackages.length > 0 && (
          <div className="rounded-lg overflow-x-auto border border-gray-200 bg-white shadow-sm min-w-0">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Nombre</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Descripción</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Ciudad</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">País</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Fechas</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Hoteles</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Estado</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center w-[100px]">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {paginatedRows.map((pkg) => {
                  const estado = pkg.estado !== false;
                  return (
                    <TableRow
                      key={pkg.idPaquete}
                      className="border-b border-gray-200 hover:bg-blue-50 text-gray-700"
                    >
                      <TableCell className="text-left py-3 px-4 align-middle max-w-[140px] border-r border-gray-200" title={pkg.nombre || ''}>
                        {truncate(pkg.nombre, MAX_NOMBRE_LENGTH)}
                      </TableCell>
                      <TableCell className="text-left py-3 px-4 align-middle max-w-[140px] border-r border-gray-200" title={pkg.descripcion || ''}>
                        {truncate(pkg.descripcion, MAX_DESC_LENGTH)}
                      </TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{pkg.ciudad}</TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{pkg.pais}</TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">
                        {pkg.paquetesDetalles
                          ? `${pkg.paquetesDetalles.fechaInicio} — ${pkg.paquetesDetalles.fechaFin}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200" title={pkg.hoteles?.map((h) => `${h.nombre} — ${formatPrecio(h.precio)}`).join(', ') ?? ''}>
                        {pkg.hoteles && pkg.hoteles.length > 0 ? (
                          `${pkg.hoteles.length} hotel${pkg.hoteles.length !== 1 ? 'es' : ''}`
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">
                        <span className={estado ? 'text-green-700' : 'text-red-700'}>
                          {estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ cursor: 'pointer' }}
                          className="border-[#60a5fa] text-[#1e40af] hover:bg-blue-50"
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          )}

          {filteredPackages.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * ROWS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * ROWS_PER_PAGE, filteredPackages.length)} de{' '}
                {filteredPackages.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        isActive={p === currentPage}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
