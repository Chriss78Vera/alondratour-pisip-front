import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Calendar, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
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
import { getReservas, type ReservaConDetalles } from '../../services/reservas';
import { EditReservation } from './EditReservation';
import { formatNumber } from '../../utils/priceFormats';
import { truncate } from '../../utils/stringFormats';
import { ROWS_PER_PAGE, MAX_DESC_LENGTH, MAX_NOMBRE_PAQUETE_LENGTH } from '../../utils/constants';

interface ReservationListProps {
  onCreateNew: () => void;
}

export function ReservationList({ onCreateNew }: ReservationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [reservations, setReservations] = useState<ReservaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedReservation, setSelectedReservation] = useState<ReservaConDetalles | null>(null);

  const loadReservas = useCallback(() => {
    setLoading(true);
    getReservas()
      .then(setReservations)
      .catch(() => setError('No se pudieron cargar las reservas.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((r) => {
        const texto =
          `${r.paquete.nombre} ${r.paquete.nombreCiudad} ${r.paquete.nombrePais} ${r.agencia.nombre}`.toLowerCase();
        const matchesSearch = !searchTerm || texto.includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || r.fechaReserva.includes(dateFilter);
        return matchesSearch && matchesDate;
      }),
    [reservations, searchTerm, dateFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () =>
      filteredReservations.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredReservations, currentPage]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateFilter]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Gestión de Reservas</h1>
        <p className="font-bold text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra y visualiza todas las reservas de viaje</p>
      </div>

      {selectedReservation && (
        <EditReservation
          reserva={selectedReservation}
          onCancel={() => {
            setSelectedReservation(null);
            loadReservas();
          }}
        />
      )}

      {!selectedReservation && (
        <>
      <Card className="p-6 mb-6 bg-white border-gray-200">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por paquete, ciudad, país o agencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
          </div>
          <div className="w-64">
            <label className="block mb-2 text-gray-700">Filtrar por fecha reserva</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
          </div>
          <Button
            onClick={onCreateNew}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nueva reserva
          </Button>
        </div>
      </Card>

      <div className="rounded-lg overflow-x-auto border border-gray-200 bg-white shadow-sm min-w-0">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Paquete</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Descripción</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Ciudad</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">País</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Fecha reserva</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Costo total</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Estado</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Agente</TableHead>
              <TableHead className="text-gray-700 font-medium py-3 px-4 text-center w-[100px]">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedRows.map((r) => (
              <TableRow
                key={r.idReserva}
                className="border-b border-gray-200 hover:bg-blue-50 text-gray-700"
              >
                <TableCell className="text-left py-3 px-4 align-middle max-w-[140px] border-r border-gray-200" title={r.paquete.nombre || ''}>
                  {truncate(r.paquete.nombre, MAX_NOMBRE_PAQUETE_LENGTH)}
                </TableCell>
                <TableCell className="text-left py-3 px-4 align-middle max-w-[140px] border-r border-gray-200" title={r.paquete.descripcion || ''}>
                  {truncate(r.paquete.descripcion, MAX_DESC_LENGTH)}
                </TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{r.paquete.nombreCiudad}</TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{r.paquete.nombrePais}</TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{r.fechaReserva}</TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{formatNumber(r.costoTotal)}</TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">
                  <span
                    className={
                      r.estado
                        ? 'text-green-700'
                        : 'text-red-700'
                    }
                  >
                    {r.estado ? 'Confirmada' : 'Cancelada'}
                  </span>
                </TableCell>
                <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{r.agencia.nombre}</TableCell>
                <TableCell className="text-center py-3 px-4 align-middle">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#60a5fa] text-[#1e40af] hover:bg-blue-50"
                    onClick={() => setSelectedReservation(r)}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredReservations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">
            {reservations.length === 0
              ? 'No hay reservas registradas.'
              : 'No se encontraron reservas con los filtros aplicados.'}
          </p>
        </div>
      )}

      {filteredReservations.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Mostrando {(currentPage - 1) * ROWS_PER_PAGE + 1} -{' '}
            {Math.min(currentPage * ROWS_PER_PAGE, filteredReservations.length)} de{' '}
            {filteredReservations.length}
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
                  className={
                    currentPage <= 1
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
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
                  className={
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
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
