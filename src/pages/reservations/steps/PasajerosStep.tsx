import { Plus, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Pasajero } from './types';
import { hasMinLength, isValidCedula, isValidFechaNacimiento, CEDULA_LENGTH } from '../../../utils/validations';

interface PasajerosStepProps {
  passengers: Pasajero[];
  addPassenger: () => void;
  removePassenger: (index: number) => void;
  updatePassenger: (index: number, field: keyof Pasajero, value: string | boolean) => void;
}

export function PasajerosStep({
  passengers,
  addPassenger,
  removePassenger,
  updatePassenger,
}: PasajerosStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[#1e40af] mb-4">Datos de los Pasajeros</h3>
      <p className="text-sm text-gray-600 mb-4">
        Agregue uno o más pasajeros. Todos los campos son obligatorios por pasajero.
      </p>

      {passengers.map((pasajero, index) => (
        <div
          key={index}
          className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-4 relative"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#1e40af]">Pasajero {index + 1}</span>
            {passengers.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removePassenger(index)}
              >
                <X className="h-4 w-4 mr-1" />
                Quitar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 text-sm">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: María"
                value={pasajero.nombre}
                onChange={(e) => updatePassenger(index, 'nombre', e.target.value)}
                className="border-gray-300 bg-white"
              />
              {pasajero.nombre.trim() !== '' && !hasMinLength(pasajero.nombre) && (
                <p className="mt-1 text-sm font-bold text-red-700">
                  El nombre debe tener al menos 5 caracteres.
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-gray-700 text-sm">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: García"
                value={pasajero.apellido}
                onChange={(e) => updatePassenger(index, 'apellido', e.target.value)}
                className="border-gray-300 bg-white"
              />
              {pasajero.apellido.trim() !== '' && !hasMinLength(pasajero.apellido) && (
                <p className="mt-1 text-sm font-bold text-red-700">
                  El apellido debe tener al menos 5 caracteres.
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-gray-700 text-sm">
                Cédula <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={`${CEDULA_LENGTH} dígitos`}
                value={pasajero.cedula}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= CEDULA_LENGTH) updatePassenger(index, 'cedula', v);
                }}
                className="border-gray-300 bg-white"
              />
              {pasajero.cedula.trim() !== '' && !isValidCedula(pasajero.cedula) && (
                <p className="mt-1 text-sm font-bold text-red-700">
                  La cédula debe tener exactamente {CEDULA_LENGTH} dígitos (solo números).
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-gray-700 text-sm">
                Fecha de nacimiento <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={pasajero.fechaNacimiento}
                onChange={(e) => updatePassenger(index, 'fechaNacimiento', e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="border-gray-300 bg-white"
              />
              {pasajero.fechaNacimiento.trim() !== '' && (() => {
                const res = isValidFechaNacimiento(pasajero.fechaNacimiento);
                if (res.valid) return null;
                return (
                  <p className="mt-1 text-sm font-bold text-red-700">
                    {res.error}
                  </p>
                );
              })()}
            </div>
            <div className="sm:col-span-2 flex gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={pasajero.pasaporte}
                  onCheckedChange={(checked) => updatePassenger(index, 'pasaporte', checked === true)}
                />
                <span className="text-sm text-gray-700">Pasaporte</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={pasajero.visa}
                  onCheckedChange={(checked) => updatePassenger(index, 'visa', checked === true)}
                />
                <span className="text-sm text-gray-700">Visa</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="border-[#1e40af] text-[#1e40af] hover:bg-blue-50"
        onClick={addPassenger}
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar pasajero
      </Button>
    </div>
  );
}
