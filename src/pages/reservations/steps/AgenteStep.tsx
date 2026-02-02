import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { getAgencias, type Agencia } from '../../../services/agencias';

export interface AgentState {
  idAgencia?: number;
  name: string;
  email: string;
  phone: string;
}

const AGREGAR_OTRA_VALUE = '__nueva__';

interface AgenteStepProps {
  agent: AgentState;
  setAgent: (value: React.SetStateAction<AgentState>) => void;
}

export function AgenteStep({ agent, setAgent }: AgenteStepProps) {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [loadingAgencias, setLoadingAgencias] = useState(true);

  useEffect(() => {
    getAgencias()
      .then(setAgencias)
      .catch(() => setAgencias([]))
      .finally(() => setLoadingAgencias(false));
  }, []);

  const hayAgencias = agencias.length > 0;

  const handleAgenciaChange = (value: string) => {
    if (value === AGREGAR_OTRA_VALUE) {
      setAgent({ name: '', email: '', phone: '' });
      return;
    }
    const agencia = agencias.find((a) => String(a.idAgencia) === value);
    if (agencia) {
      setAgent({
        idAgencia: agencia.idAgencia,
        name: agencia.nombre,
        email: agencia.email,
        phone: agencia.telefono,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos del Agente de Viaje</h3>

      {hayAgencias && (
        <div>
          <label className="block mb-2 text-gray-700">Agencia</label>
          <Select
            value={agent.idAgencia != null ? String(agent.idAgencia) : AGREGAR_OTRA_VALUE}
            onValueChange={handleAgenciaChange}
            disabled={loadingAgencias}
          >
            <SelectTrigger className="border-gray-300 bg-white">
              <SelectValue
                placeholder={loadingAgencias ? 'Cargando agencias...' : 'Seleccione una agencia o agregue otra'}
              />
            </SelectTrigger>
            <SelectContent>
              {agencias.map((a) => (
                <SelectItem key={a.idAgencia} value={String(a.idAgencia)}>
                  {a.nombre} — {a.email}
                </SelectItem>
              ))}
              <SelectItem value={AGREGAR_OTRA_VALUE}>Agregar otra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="block mb-2 text-gray-700">
          Agencia Nombre <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Ej: Avianca"
          value={agent.name}
          onChange={(e) => setAgent({ ...agent, name: e.target.value })}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          placeholder="avianca@example.com"
          value={agent.email}
          onChange={(e) => setAgent({ ...agent, email: e.target.value })}
          className="border-gray-300 bg-white"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          placeholder="+593 999 999 999"
          value={agent.phone}
          onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
          className="border-gray-300 bg-white"
        />
      </div>
    </div>
  );
}
