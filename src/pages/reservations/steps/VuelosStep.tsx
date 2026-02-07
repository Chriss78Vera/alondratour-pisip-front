import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { SelectWithSearch } from '../../../components/SelectWithSearch';
import { isValidFechasVuelo } from '../../../utils/validations';
import type { DestinationState } from './DestinoStep';
import { getPaises, type Pais } from '../../../services/paises';
import { getCiudadesPorPais, type Ciudad } from '../../../services/ciudades';

export interface VueloState {
  aerolinea: string;
  idPaisOrigen: string;
  idCiudadOrigen: string;
  origenPaisNombre: string;
  origenCiudadNombre: string;
  fechaSalida: string;
  fechaLlegada: string;
  fechaExtraSalida: string;
  fechaExtraLlegada: string;
}

interface VuelosStepProps {
  vuelo: VueloState;
  setVuelo: (value: React.SetStateAction<VueloState>) => void;
  destination: DestinationState;
  /** Fecha inicio del paquete (YYYY-MM-DD) - rango mínimo para fechas del vuelo */
  fechaInicioPaquete: string;
  /** Fecha fin del paquete (YYYY-MM-DD) - rango máximo para fechas del vuelo */
  fechaFinPaquete: string;
}

export function VuelosStep({
  vuelo,
  setVuelo,
  destination,
  fechaInicioPaquete,
  fechaFinPaquete,
}: VuelosStepProps) {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [ciudadesOrigen, setCiudadesOrigen] = useState<Ciudad[]>([]);
  const [loadingPaises, setLoadingPaises] = useState(true);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  useEffect(() => {
    getPaises()
      .then(setPaises)
      .catch(() => setPaises([]))
      .finally(() => setLoadingPaises(false));
  }, []);

  useEffect(() => {
    if (vuelo.idPaisOrigen) {
      setLoadingCiudades(true);
      getCiudadesPorPais(Number(vuelo.idPaisOrigen))
        .then(setCiudadesOrigen)
        .catch(() => setCiudadesOrigen([]))
        .finally(() => setLoadingCiudades(false));
    } else {
      setCiudadesOrigen([]);
    }
  }, [vuelo.idPaisOrigen]);

  const today = new Date().toISOString().slice(0, 10);
  const minFechaSalida = !fechaInicioPaquete
    ? today
    : (fechaInicioPaquete > today ? fechaInicioPaquete : today);
  const maxFechaSalida = fechaFinPaquete || '';
  const minFechaLlegada = vuelo.fechaSalida
    ? (() => {
        const d = new Date(vuelo.fechaSalida);
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      })()
    : minFechaSalida;
  const maxFechaLlegada = fechaFinPaquete || '';

  const origenPaisOption =
    vuelo.idPaisOrigen
      ? {
        value: Number(vuelo.idPaisOrigen),
        label: (vuelo.origenPaisNombre || paises.find((p) => String(p.idPais) === vuelo.idPaisOrigen)?.nombre) ?? '',
      }
      : null;
  const origenCiudadOption =
    vuelo.idCiudadOrigen
      ? {
        value: Number(vuelo.idCiudadOrigen),
        label: (vuelo.origenCiudadNombre || ciudadesOrigen.find((c) => String(c.idCiudad) === vuelo.idCiudadOrigen)?.nombre) ?? '',
      }
      : null;

  const destinoPaisOption =
    destination.idPais && destination.country
      ? { value: Number(destination.idPais), label: destination.country }
      : null;
  const destinoCiudadOption =
    destination.idCiudad && destination.city
      ? { value: Number(destination.idCiudad), label: destination.city }
      : null;

  const fechasVueloValidation =
    vuelo.fechaSalida && vuelo.fechaLlegada
      ? isValidFechasVuelo(vuelo.fechaSalida, vuelo.fechaLlegada, fechaFinPaquete)
      : null;
      console.log(destination)
  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos del Vuelo</h3>
      <p className="text-sm text-gray-600 mb-4">
        El destino del vuelo es el país y ciudad del paquete seleccionado. Las fechas deben estar dentro del rango del paquete.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-gray-700">
            Aerolínea <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ej: Avianca"
            value={vuelo.aerolinea}
            onChange={(e) => setVuelo((prev) => ({ ...prev, aerolinea: e.target.value }))}
            className="border-gray-300 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectWithSearch
            label={
              <>
                Origen País <span className="text-red-500">*</span>
              </>
            }
            options={paises.map((p) => ({ value: p.idPais, label: p.nombre }))}
            value={origenPaisOption}
            onChange={(opt) => {
              const pais = paises.find((p) => p.idPais === opt.value);
              setVuelo((prev) => ({
                ...prev,
                idPaisOrigen: String(opt.value),
                origenPaisNombre: pais ? pais.nombre : '',
                idCiudadOrigen: '',
                origenCiudadNombre: '',
              }));
            }}
            triggerPlaceholder="Buscar país"
            searchPlaceholder="Buscar país..."
            emptyMessage="Sin resultados"
            loading={loadingPaises}
          />
          <SelectWithSearch
            label={
              <>
                Origen Ciudad <span className="text-red-500">*</span>
              </>
            }
            options={ciudadesOrigen.map((c) => ({ value: c.idCiudad, label: c.nombre }))}
            value={origenCiudadOption}
            onChange={(opt) => {
              const ciudad = ciudadesOrigen.find((c) => c.idCiudad === opt.value);
              setVuelo((prev) => ({
                ...prev,
                idCiudadOrigen: String(opt.value),
                origenCiudadNombre: ciudad ? ciudad.nombre : '',
              }));
            }}
            triggerPlaceholder="Buscar ciudad"
            searchPlaceholder="Buscar ciudad..."
            emptyMessage={ciudadesOrigen.length === 0 ? 'No hay ciudades' : 'Sin resultados'}
            disabledPlaceholder="Seleccione primero un país"
            disabled={!vuelo.idPaisOrigen}
            loading={loadingCiudades}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectWithSearch
            label={
              <>
                Destino País <span className="text-red-500">*</span>
              </>
            }
            options={destinoPaisOption ? [destinoPaisOption] : []}
            value={destinoPaisOption}
            onChange={() => { }}
            triggerPlaceholder="País del paquete"
            disabled
            disabledPlaceholder={!destinoPaisOption ? 'Seleccione destino en el paso 1' : undefined}
          />
          <SelectWithSearch
            label={
              <>
                Destino Ciudad <span className="text-red-500">*</span>
              </>
            }
            options={destinoCiudadOption ? [destinoCiudadOption] : []}
            value={destinoCiudadOption}
            onChange={() => { }}
            triggerPlaceholder="Ciudad del paquete"
            disabled
            disabledPlaceholder={!destinoCiudadOption ? 'Seleccione destino en el paso 1' : undefined}
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de salida <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={vuelo.fechaSalida}
            min={minFechaSalida}
            max={maxFechaSalida || undefined}
            onChange={(e) => setVuelo((prev) => ({ ...prev, fechaSalida: e.target.value }))}
            className="border-gray-300 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Igual o posterior a hoy; no superior a la fecha final del paquete ({fechaFinPaquete || '...'})
          </p>
          {fechasVueloValidation && !fechasVueloValidation.valid && fechasVueloValidation.field === 'salida' && (
            <p className="mt-1 text-sm font-bold text-red-700">
              {fechasVueloValidation.error}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de llegada <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={vuelo.fechaLlegada}
            min={minFechaLlegada}
            max={maxFechaLlegada || undefined}
            onChange={(e) => setVuelo((prev) => ({ ...prev, fechaLlegada: e.target.value }))}
            className="border-gray-300 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Posterior a la fecha de salida; no superior a la fecha final del paquete ({fechaFinPaquete || '...'})
          </p>
          {fechasVueloValidation && !fechasVueloValidation.valid && fechasVueloValidation.field === 'llegada' && (
            <p className="mt-1 text-sm font-bold text-red-700">
              {fechasVueloValidation.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
