import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { SelectWithSearch } from '../../../components/SelectWithSearch';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
import type { PaqueteResumen, Hotel, PaisConCiudades } from '../../../services/paquetes';
import { isValidFechasHotelReserva } from '../../../utils/validations';
import { addDay, todayStr } from '../../../utils/dateFormats';

export interface HotelReservaEntry {
  idHotel: string;
  fechaCheckin: string;
  fechaCheckout: string;
}

export interface DestinationState {
  idPais: string;
  idCiudad: string;
  country: string;
  city: string;
  package: string;
  hotel: string;
  startDate: string;
  endDate: string;
  /** Por cada hotel del paquete: fechas de check-in y check-out (reemplaza uso de fechas del paquete). */
  hotelesReserva: HotelReservaEntry[];
}

interface DestinoStepProps {
  paisesConCiudades: PaisConCiudades[];
  paquetesDisponibles: PaqueteResumen[];
  loadingPaisesCiudades: boolean;
  loadingPaquetes: boolean;
  destination: DestinationState;
  setDestination: (value: React.SetStateAction<DestinationState>) => void;
  selectedPaqueteResumen: PaqueteResumen | null;
}

export function DestinoStep({
  paisesConCiudades,
  paquetesDisponibles,
  loadingPaisesCiudades,
  loadingPaquetes,
  destination,
  setDestination,
  selectedPaqueteResumen,
}: DestinoStepProps) {
  const ciudadesDelPais = destination.idPais
    ? (paisesConCiudades.find((p) => String(p.idPais) === destination.idPais)?.ciudades ?? [])
    : [];
  const fechasDesdePaquete = selectedPaqueteResumen?.paquetesDetalles;
  const fechaInicio = fechasDesdePaquete?.fechaInicio ?? destination.startDate;
  const fechaFin = fechasDesdePaquete?.fechaFin ?? destination.endDate;
  const today = todayStr();
  const minCheckin = !fechaInicio ? today : (fechaInicio > today ? fechaInicio : today);
  const maxCheckin = fechaFin || undefined;

  const hotelesReserva = destination.hotelesReserva ?? [];
  const hotelesYaSeleccionados = hotelesReserva.map((hr) => hr.idHotel);
  const hotelesDisponiblesParaAgregar =
    selectedPaqueteResumen?.hoteles?.filter((h: Hotel) => !hotelesYaSeleccionados.includes(String(h.idHotel))) ?? [];
  const esUnSoloHotel = (selectedPaqueteResumen?.hoteles?.length ?? 0) === 1;

  const agregarHotel = (idHotel: string) => {
    if (hotelesReserva.some((hr) => hr.idHotel === idHotel)) return;
    setDestination((prev) => ({
      ...prev,
      hotelesReserva: [...(prev.hotelesReserva ?? []), { idHotel, fechaCheckin: '', fechaCheckout: '' }],
    }));
  };

  const quitarHotel = (idHotel: string) => {
    setDestination((prev) => ({
      ...prev,
      hotelesReserva: (prev.hotelesReserva ?? []).filter((hr) => hr.idHotel !== idHotel),
    }));
  };

  const updateHotelReserva = (idHotel: string, field: 'fechaCheckin' | 'fechaCheckout', value: string) => {
    const current = hotelesReserva.find((hr) => hr.idHotel === idHotel);
    const next = current
      ? { ...current, [field]: value }
      : { idHotel, fechaCheckin: '', fechaCheckout: '' };
    if (field === 'fechaCheckin') next.fechaCheckout = '';
    const newList = hotelesReserva.some((hr) => hr.idHotel === idHotel)
      ? hotelesReserva.map((hr) => (hr.idHotel === idHotel ? next : hr))
      : [...hotelesReserva, next];
    setDestination((prev) => ({ ...prev, hotelesReserva: newList }));
  };

  const getHotelById = (idHotel: string): Hotel | undefined =>
    selectedPaqueteResumen?.hoteles?.find((h: Hotel) => String(h.idHotel) === idHotel);

  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos del Destino</h3>

      <div className="grid grid-cols-2 gap-4">
        <SelectWithSearch
          label={
            <>
              País <span className="text-red-500">*</span>
            </>
          }
          options={paisesConCiudades.map((p) => ({ value: p.idPais, label: p.pais }))}
          value={
            destination.idPais
              ? {
                value: Number(destination.idPais),
                label: (destination.country || paisesConCiudades.find((p) => String(p.idPais) === destination.idPais)?.pais) ?? '',
              }
              : null
          }
          onChange={(opt) => {
            const pais = paisesConCiudades.find((p) => p.idPais === opt.value);
            setDestination({
              ...destination,
              idPais: String(opt.value),
              idCiudad: '',
              country: pais ? pais.pais : '',
              city: '',
            });
          }}
          triggerPlaceholder="Buscar país"
          searchPlaceholder="Buscar país..."
          emptyMessage="Sin resultados"
          loading={loadingPaisesCiudades}
        />
        <SelectWithSearch
          label={
            <>
              Ciudad <span className="text-red-500">*</span>
            </>
          }
          options={ciudadesDelPais.map((c) => ({ value: c.idCiudad, label: c.nombre }))}
          value={
            destination.idCiudad
              ? {
                value: Number(destination.idCiudad),
                label: (destination.city || ciudadesDelPais.find((c) => String(c.idCiudad) === destination.idCiudad)?.nombre) ?? '',
              }
              : null
          }
          onChange={(opt) => {
            const ciudad = ciudadesDelPais.find((c) => c.idCiudad === opt.value);
            setDestination({ ...destination, idCiudad: String(opt.value), city: ciudad ? ciudad.nombre : '' });
          }}
          triggerPlaceholder="Buscar ciudad"
          searchPlaceholder="Buscar ciudad..."
          emptyMessage={ciudadesDelPais.length === 0 ? 'No hay ciudades' : 'Sin resultados'}
          disabledPlaceholder="Seleccione primero un país"
          disabled={!destination.idPais}
          loading={loadingPaisesCiudades}
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Paquete <span className="text-red-500">*</span>
        </label>
        <Select
          value={destination.package}
          onValueChange={(value) => setDestination({ ...destination, package: value })}
          disabled={!destination.idCiudad || loadingPaquetes}
        >
          <SelectTrigger className="border-gray-300 bg-white">
            <SelectValue
              placeholder={
                loadingPaquetes
                  ? 'Cargando paquetes...'
                  : destination.idCiudad
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
      {selectedPaqueteResumen && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
          <p className="text-sm text-[#1e40af] font-medium">Rango del paquete</p>
          <p className="text-gray-700 text-sm">
            Inicio: {fechaInicio || '—'} — Fin: {fechaFin || '—'}
          </p>
        </div>
      )}

      {selectedPaqueteResumen?.hoteles && selectedPaqueteResumen.hoteles.length > 0 && (
        <div>
          <h4 className="text-[#1e40af] font-medium mb-3">Hotel</h4>

          {!esUnSoloHotel && (
            <div className="mb-4">
              <label className="block mb-2 text-gray-700">
                Seleccionar hotel <span className="text-red-500">*</span>
              </label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value) agregarHotel(value);
                }}
              >
                <SelectTrigger className="border-gray-300 bg-white max-w-md">
                  <SelectValue
                    placeholder={
                      hotelesDisponiblesParaAgregar.length === 0
                        ? (hotelesReserva.length > 0 ? 'Todos los hoteles agregados' : 'Seleccione un hotel')
                        : 'Agregar un hotel'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {hotelesDisponiblesParaAgregar.map((h: Hotel) => (
                    <SelectItem key={h.idHotel} value={String(h.idHotel)}>
                      {h.nombre} — ${h.precio.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {esUnSoloHotel && hotelesReserva.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">El paquete incluye un solo hotel; seleccione fechas de check-in y check-out.</p>
          )}

          <ul className="space-y-6">
            {hotelesReserva.map((entry) => {
              const h = getHotelById(entry.idHotel);
              if (!h) return null;
              const minCheckoutForRow = entry.fechaCheckin
                ? (() => {
                  const despuesCheckin = addDay(entry.fechaCheckin);
                  return despuesCheckin > today ? despuesCheckin : today;
                })()
                : minCheckin;
              const validation = entry.fechaCheckin && entry.fechaCheckout && fechaInicio && fechaFin
                ? isValidFechasHotelReserva(entry.fechaCheckin, entry.fechaCheckout, fechaInicio, fechaFin)
                : null;
              return (
                <li
                  key={entry.idHotel}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <p className="font-medium text-gray-800">
                      {h.nombre} — ${h.precio.toFixed(2)}
                    </p>
                    {!esUnSoloHotel && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => quitarHotel(entry.idHotel)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Check-in <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={entry.fechaCheckin}
                        min={minCheckin}
                        max={maxCheckin}
                        onChange={(e) => updateHotelReserva(entry.idHotel, 'fechaCheckin', e.target.value)}
                        className="border-gray-300 bg-white"
                      />
                      {validation && !validation.valid && validation.field === 'checkin' && (
                        <p className="mt-1 text-sm font-bold text-red-700">{validation.error}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-700">
                        Check-out <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={entry.fechaCheckout}
                        min={minCheckoutForRow}
                        max={maxCheckin}
                        onChange={(e) => updateHotelReserva(entry.idHotel, 'fechaCheckout', e.target.value)}
                        className="border-gray-300 bg-white"
                      />
                      {validation && !validation.valid && validation.field === 'checkout' && (
                        <p className="mt-1 text-sm font-bold text-red-700">{validation.error}</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
