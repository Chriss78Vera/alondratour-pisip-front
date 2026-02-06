import { Input } from '../../../components/ui/input';
import { isValidFechasVuelo } from '../../../utils/validations';

export interface VueloState {
  aerolinea: string;
  origen: string;
  fechaSalida: string;
  fechaLlegada: string;
  fechaExtraSalida: string;
  fechaExtraLlegada: string;
}

interface VuelosStepProps {
  vuelo: VueloState;
  setVuelo: (value: React.SetStateAction<VueloState>) => void;
  destinoBloqueado: string;
}

export function VuelosStep({ vuelo, setVuelo, destinoBloqueado }: VuelosStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos del Vuelo</h3>
      <p className="text-sm text-gray-600 mb-4">
        El destino del vuelo es el país seleccionado en el paso 1 y no se puede modificar.
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
        <div>
          <label className="block mb-2 text-gray-700">
            Origen <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ej: BOG"
            value={vuelo.origen}
            onChange={(e) => setVuelo((prev) => ({ ...prev, origen: e.target.value }))}
            className="border-gray-300 bg-white"
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Destino <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={destinoBloqueado}
            disabled
            className="border-gray-300 bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Bloqueado (país del paso 1)</p>
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de salida <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={vuelo.fechaSalida}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setVuelo((prev) => ({ ...prev, fechaSalida: e.target.value }))}
            className="border-gray-300 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">No puede ser anterior a la fecha actual</p>
        </div>
        <div>
          <label className="block mb-2 text-gray-700">
            Fecha de llegada <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={vuelo.fechaLlegada}
            min={vuelo.fechaSalida ? (() => {
              const d = new Date(vuelo.fechaSalida);
              d.setDate(d.getDate() + 1);
              return d.toISOString().slice(0, 10);
            })() : new Date().toISOString().slice(0, 10)}
            onChange={(e) => setVuelo((prev) => ({ ...prev, fechaLlegada: e.target.value }))}
            className="border-gray-300 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">Debe ser superior a la fecha de salida</p>
          {vuelo.fechaSalida && vuelo.fechaLlegada && (() => {
            const res = isValidFechasVuelo(vuelo.fechaSalida, vuelo.fechaLlegada);
            if (res.valid) return null;
            return (
              <p className="mt-1 text-sm font-bold text-red-700">
                {res.error}
              </p>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
