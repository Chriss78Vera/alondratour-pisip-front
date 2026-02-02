import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { PaqueteResumen, Hotel } from '../../../services/paquetes';

export interface DestinationState {
  country: string;
  city: string;
  package: string;
  hotel: string;
  startDate: string;
  endDate: string;
}

interface DestinoStepProps {
  paises: string[];
  ciudades: string[];
  paquetesDisponibles: PaqueteResumen[];
  loadingPaisesCiudades: boolean;
  loadingPaquetes: boolean;
  destination: DestinationState;
  setDestination: (value: React.SetStateAction<DestinationState>) => void;
  selectedPaqueteResumen: PaqueteResumen | null;
}

export function DestinoStep({
  paises,
  ciudades,
  paquetesDisponibles,
  loadingPaisesCiudades,
  loadingPaquetes,
  destination,
  setDestination,
  selectedPaqueteResumen,
}: DestinoStepProps) {
  const fechasDesdePaquete = selectedPaqueteResumen?.paquetesDetalles;
  const fechaInicio = fechasDesdePaquete?.fechaInicio ?? destination.startDate;
  const fechaFin = fechasDesdePaquete?.fechaFin ?? destination.endDate;
  const fechasBloqueadas = !!fechasDesdePaquete;

  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos del Destino</h3>

      <div>
        <label className="block mb-2 text-gray-700">
          País <span className="text-red-500">*</span>
        </label>
        <Select
          value={destination.country}
          onValueChange={(value) => setDestination({ ...destination, country: value })}
          disabled={loadingPaisesCiudades}
        >
          <SelectTrigger className="border-gray-300 bg-white">
            <SelectValue placeholder={loadingPaisesCiudades ? 'Cargando...' : 'Seleccione un país'} />
          </SelectTrigger>
          <SelectContent>
            {paises.map((pais) => (
              <SelectItem key={pais} value={pais}>
                {pais}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <Select
          value={destination.city}
          onValueChange={(value) => setDestination({ ...destination, city: value })}
          disabled={!destination.country || loadingPaisesCiudades}
        >
          <SelectTrigger className="border-gray-300 bg-white">
            <SelectValue placeholder={destination.country ? 'Seleccione una ciudad' : 'Primero seleccione un país'} />
          </SelectTrigger>
          <SelectContent>
            {ciudades.map((ciudad) => (
              <SelectItem key={ciudad} value={ciudad}>
                {ciudad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Paquete <span className="text-red-500">*</span>
        </label>
        <Select
          value={destination.package}
          onValueChange={(value) => setDestination({ ...destination, package: value })}
          disabled={!destination.city || loadingPaquetes}
        >
          <SelectTrigger className="border-gray-300 bg-white">
            <SelectValue
              placeholder={
                loadingPaquetes
                  ? 'Cargando paquetes...'
                  : destination.city
                    ? 'Seleccione un paquete'
                    : 'Primero seleccione país y ciudad'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {paquetesDisponibles.map((pkg) => (
              <SelectItem key={pkg.idPaquete} value={String(pkg.idPaquete)}>
                {pkg.nombre} — {pkg.ciudad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPaqueteResumen && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-[#1e40af] font-medium">Paquete seleccionado</p>
          <p className="text-gray-700">{selectedPaqueteResumen.nombre}</p>
          {selectedPaqueteResumen.descripcion && (
            <p className="text-sm text-gray-600 mt-1">{selectedPaqueteResumen.descripcion}</p>
          )}
        </div>
      )}

      {selectedPaqueteResumen?.hoteles && selectedPaqueteResumen.hoteles.length > 0 && (
        <div>
          <label className="block mb-2 text-gray-700">
            Hotel <span className="text-red-500">*</span>
          </label>
          <Select
            value={destination.hotel}
            onValueChange={(value) => setDestination({ ...destination, hotel: value })}
          >
            <SelectTrigger className="border-gray-300 bg-white">
              <SelectValue placeholder="Seleccione un hotel" />
            </SelectTrigger>
            <SelectContent>
              {selectedPaqueteResumen.hoteles.map((h: Hotel) => (
                <SelectItem key={h.idHotel} value={String(h.idHotel)}>
                  {h.nombre} - ${h.precio.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={fechaInicio}
            onChange={(e) => setDestination({ ...destination, startDate: e.target.value })}
            disabled={true}
            className='border-gray-300 bg-gray-100'
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de fin <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={fechaFin}
            onChange={(e) => setDestination({ ...destination, endDate: e.target.value })}
            disabled={true}
            min={fechasBloqueadas ? undefined : (destination.startDate || undefined)}
            className='border-gray-300 bg-gray-100'
          />
        </div>
      </div>
    </div>
  );
}
