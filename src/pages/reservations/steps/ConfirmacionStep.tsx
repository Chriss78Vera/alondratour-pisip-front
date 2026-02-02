import { Input } from '../../../components/ui/input';
import type { PaqueteResumen } from '../../../services/paquetes';
import type { Pasajero } from './types';
import type { DestinationState } from './DestinoStep';
import type { AgentState } from './AgenteStep';
import type { VueloState } from './VuelosStep';

interface ConfirmacionStepProps {
  costoTotal: string;
  setCostoTotal: (value: string) => void;
  submitError: string | null;
  selectedPaqueteResumen: PaqueteResumen | null;
  destination: DestinationState;
  vuelo: VueloState;
  agent: AgentState;
  passengers: Pasajero[];
}

function formatPrecio(n: number): string {
  return new Intl.NumberFormat('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function ConfirmacionStep({
  costoTotal,
  setCostoTotal,
  submitError,
  selectedPaqueteResumen,
  destination,
  vuelo,
  agent,
  passengers,
}: ConfirmacionStepProps) {
  const selectedHotel = destination.hotel && selectedPaqueteResumen?.hoteles
    ? selectedPaqueteResumen.hoteles.find((h) => String(h.idHotel) === destination.hotel)
    : null;
  const totalNum = costoTotal.trim() !== '' && !Number.isNaN(Number(costoTotal.replace(/,/g, '.')))
    ? Number(costoTotal.replace(/,/g, '.'))
    : 0;
  const precioHotel = selectedHotel?.precio ?? 0;
  const resto = Math.max(0, totalNum - precioHotel);

  const handleCostoChange = (value: string) => {
    if (selectedHotel != null) {
      const num = value.trim() === '' || Number.isNaN(Number(value.replace(/,/g, '.')))
        ? 0
        : Number(value.replace(/,/g, '.'));
      setCostoTotal(String(Math.max(0, precioHotel + num)));
    } else {
      setCostoTotal(value);
    }
  };

  const inputValue = selectedHotel != null ? String(Math.round(resto)) : costoTotal;

  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Confirmar Reserva</h3>

      <div>
        <label className="block mb-2 text-gray-700">
          {selectedHotel ? 'Resto / Otros costos' : 'Costo total'} <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          placeholder={selectedHotel ? 'Ej: 1300' : 'Ej: 2500000'}
          value={inputValue}
          onChange={(e) => handleCostoChange(e.target.value)}
          className="border-gray-300 bg-white max-w-xs"
          min={0}
          step={0.01}
        />
        {selectedHotel && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4 max-w-xs">
            <p className="text-sm text-[#1e40af] font-medium mb-2">Hotel seleccionado</p>
            <p className="text-gray-700 text-sm">
              {selectedHotel.nombre} — {formatPrecio(precioHotel)}
            </p>
            <div className="mt-3 pt-3 border-t border-blue-200 text-sm">
              <p className="text-gray-700">
                Precio hotel: {formatPrecio(precioHotel)} + Resto: {formatPrecio(resto)}
              </p>
              <p className="text-[#1e40af] font-medium mt-1">
                = Total: {formatPrecio(totalNum)}
              </p>
            </div>
          </div>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
        <div>
          <h4 className="text-[#1e40af] mb-2">Paquete Seleccionado</h4>
          <p className="text-gray-700">{selectedPaqueteResumen?.nombre}</p>
          <p className="text-sm text-gray-600">{destination.city}, {destination.country}</p>
          <p className="text-sm text-gray-600">{destination.startDate} - {destination.endDate}</p>
        </div>

        <div className="border-t border-blue-200 pt-4">
          <h4 className="text-[#1e40af] mb-2">Vuelo</h4>
          <p className="text-gray-700">{vuelo.aerolinea}</p>
          <p className="text-sm text-gray-600">
            {vuelo.origen} → {destination.country} | Salida: {vuelo.fechaSalida} | Llegada: {vuelo.fechaLlegada}
          </p>
        </div>

        <div className="border-t border-blue-200 pt-4">
          <h4 className="text-[#1e40af] mb-2">Agente de Viaje</h4>
          <p className="text-gray-700">{agent.name}</p>
          <p className="text-sm text-gray-600">{agent.email} | {agent.phone}</p>
        </div>

        <div className="border-t border-blue-200 pt-4">
          <h4 className="text-[#1e40af] mb-2">Pasajeros ({passengers.length})</h4>
          <ul className="space-y-2">
            {passengers.map((p, i) => (
              <li key={i} className="text-gray-700">
                <span className="font-medium">{p.nombre} {p.apellido}</span>
                <span className="text-sm text-gray-600 block">
                  Cédula: {p.cedula} | Nac.: {p.fechaNacimiento}
                  {p.pasaporte && ' | Pasaporte'}
                  {p.visa && ' | Visa'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        Por favor, revisa todos los datos e ingresa el costo total antes de confirmar la reserva.
      </p>
    </div>
  );
}
