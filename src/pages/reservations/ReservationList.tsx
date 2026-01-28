import React, { useState } from 'react';
import { Search, Plus, Calendar, MapPin, User } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface Reservation {
  id: string;
  clientName: string;
  destination: string;
  city: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  agentName: string;
}

interface ReservationListProps {
  onCreateNew: () => void;
}

export function ReservationList({ onCreateNew }: ReservationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Mock data
  const [reservations] = useState<Reservation[]>([
    {
      id: '1',
      clientName: 'Juan Pérez',
      destination: 'España',
      city: 'Barcelona',
      startDate: '2026-02-15',
      endDate: '2026-02-22',
      status: 'confirmed',
      agentName: 'María García'
    },
    {
      id: '2',
      clientName: 'Ana Martínez',
      destination: 'Francia',
      city: 'París',
      startDate: '2026-03-10',
      endDate: '2026-03-17',
      status: 'pending',
      agentName: 'Carlos López'
    },
    {
      id: '3',
      clientName: 'Pedro Rodríguez',
      destination: 'Italia',
      city: 'Roma',
      startDate: '2026-04-05',
      endDate: '2026-04-12',
      status: 'confirmed',
      agentName: 'Laura Sánchez'
    },
    {
      id: '4',
      clientName: 'Sofía González',
      destination: 'Grecia',
      city: 'Atenas',
      startDate: '2026-05-20',
      endDate: '2026-05-27',
      status: 'pending',
      agentName: 'María García'
    }
  ]);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || reservation.startDate.includes(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: Reservation['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada'
    };

    return (
      <Badge className={`${styles[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra y visualiza todas las reservas de viaje</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6 bg-white border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-2 text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por cliente, destino o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
          </div>
          
          <div className="w-64">
            <label className="block mb-2 text-gray-700">Filtrar por fecha</label>
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

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id} className="p-5 bg-white border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#1e40af] mb-1">{reservation.clientName}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{reservation.city}, {reservation.destination}</span>
                </div>
              </div>
              {getStatusBadge(reservation.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-[#60a5fa]" />
                <span>{reservation.startDate} - {reservation.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4 text-[#60a5fa]" />
                <span>Agente: {reservation.agentName}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <Card className="p-12 text-center bg-white border-gray-200">
          <p className="text-gray-500">No se encontraron reservas con los filtros aplicados</p>
        </Card>
      )}
    </div>
  );
}
