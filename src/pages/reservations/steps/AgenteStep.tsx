import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { getAgencias, type Agencia } from '../../../services/agencias';
import { AGENTE_AGREGAR_OTRA_VALUE } from '../../../utils/constants';
import { isValidEmail, isValidTelefono, hasMinLength, MIN_TEXT_LENGTH, MIN_PHONE_DIGITS } from '../../../utils/validations';

export interface AgentState {
  idAgencia?: number;
  name: string;
  email: string;
  phone: string;
}

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
    if (value === AGENTE_AGREGAR_OTRA_VALUE) {
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
            value={agent.idAgencia != null ? String(agent.idAgencia) : AGENTE_AGREGAR_OTRA_VALUE}
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
              <SelectItem value={AGENTE_AGREGAR_OTRA_VALUE}>Agregar otra</SelectItem>
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
        {agent.name.trim() !== '' && !hasMinLength(agent.name) && (
          <p className="mt-1 text-sm font-bold text-red-700">
            El nombre debe tener al menos {MIN_TEXT_LENGTH} caracteres.
          </p>
        )}
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
        {agent.email.trim() !== '' && !isValidEmail(agent.email) && (
          <p className="mt-1 text-sm font-bold text-red-700">
            Ingrese un correo electrónico válido.
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-gray-700">
          Teléfono / Celular <span className="text-red-500">*</span>
        </label>
        <Input
          type="tel"
          placeholder="Ej: 0999999999 (mín. 9 números)"
          value={agent.phone}
          onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
          className="border-gray-300 bg-white"
        />
        {agent.phone.trim() !== '' && !isValidTelefono(agent.phone) && (
          <p className="mt-1 text-sm font-bold text-red-700">
            El celular debe tener al menos {MIN_PHONE_DIGITS} dígitos y solo números.
          </p>
        )}
      </div>
    </div>
  );
}
