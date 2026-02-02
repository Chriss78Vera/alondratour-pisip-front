import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MapPin, User, Plane, DollarSign } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { getReservas, type ReservaConDetalles } from '../../services/reservas';

interface ReservationListProps {
  onCreateNew: () => void;
}

export function ReservationList({ onCreateNew }: ReservationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [reservations, setReservations] = useState<ReservaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReservas()
      .then(setReservations)
      .catch(() => setError('No se pudieron cargar las reservas.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const texto =
      `${reservation.paquete.nombre} ${reservation.paquete.ciudad} ${reservation.paquete.pais} ${reservation.agencia.nombre}`.toLowerCase();
    const matchesSearch = !searchTerm || texto.includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || reservation.fechaReserva.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (estado: boolean) => {
    return (
      <Badge
        className={
          estado
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }
      >
        {estado ? 'Confirmada' : 'Cancelada'}
      </Badge>
    );
  };

  const formatCosto = (n: number) =>
    new Intl.NumberFormat('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

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
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra y visualiza todas las reservas de viaje</p>
      </div>

      <Card className="p-6 mb-6 bg-white border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.map((r) => (
          <Card
            key={r.idReserva}
            className="p-5 bg-white border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#1e40af] mb-1">{r.paquete.nombre}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {r.paquete.ciudad}, {r.paquete.pais}
                  </span>
                </div>
              </div>
              {getStatusBadge(r.estado)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-[#60a5fa]" />
                <span>Reserva: {r.fechaReserva}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4 text-[#60a5fa]" />
                <span>Costo total: {formatCosto(r.costoTotal)}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Plane className="h-4 w-4 text-[#60a5fa] mt-0.5 shrink-0" />
                <span>
                  {r.vuelo.aerolinea} — {r.vuelo.origen} → {r.vuelo.destino}
                  <span className="text-gray-500 block text-xs">
                    {r.vuelo.fechaSalida} / {r.vuelo.fechaLlegada}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4 text-[#60a5fa]" />
                <span>Agente: {r.agencia.nombre}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <Card className="p-12 text-center bg-white border-gray-200">
          <p className="text-gray-500">
            {reservations.length === 0
              ? 'No hay reservas registradas.'
              : 'No se encontraron reservas con los filtros aplicados.'}
          </p>
        </Card>
      )}
    </div>
  );
}
