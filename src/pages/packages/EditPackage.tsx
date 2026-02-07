import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { type Paquete, type Hotel, editarPaquete } from '../../services/paquetes';
import { editarHotel } from '../../services/hoteles';
import { formatPrecio } from '../../utils/priceFormats';
import { hasMinLength, MIN_TEXT_LENGTH } from '../../utils/validations';

export type PaqueteConEstado = Paquete & {
  estado?: boolean;
  hoteles: (Hotel & { estado?: boolean })[];
};

interface EditPackageProps {
  package: PaqueteConEstado | Paquete;
  onSave: (updated: PaqueteConEstado) => void;
  onCancel: () => void;
}

export function EditPackage({ package: pkg, onSave, onCancel }: EditPackageProps) {
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [hotelesEstado, setHotelesEstado] = useState<Record<number, boolean>>({});
  const [paqueteEstado, setPaqueteEstado] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setEditNombre(pkg.nombre);
    setEditDescripcion(pkg.descripcion || '');
    setPaqueteEstado((pkg as PaqueteConEstado).estado !== false);
    const estadoMap: Record<number, boolean> = {};
    (pkg.hoteles || []).forEach((h) => {
      estadoMap[h.idHotel] = (h as Hotel).estado !== false;
    });
    setHotelesEstado(estadoMap);
  }, [pkg]);

  const handleGuardar = async () => {
    setSaveError(null);
    const nombreFinal = editNombre.trim() || pkg.nombre;
    const descripcionFinal = editDescripcion.trim();
    if (!hasMinLength(nombreFinal)) {
      setSaveError(`El nombre debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`);
      return;
    }
    if (descripcionFinal !== '' && !hasMinLength(descripcionFinal)) {
      setSaveError(`La descripción debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`);
      return;
    }
    setSaving(true);
    const paqueteEstadoInicial = (pkg as PaqueteConEstado).estado !== false;
    const pkgModificado =
      nombreFinal !== pkg.nombre ||
      descripcionFinal !== (pkg.descripcion || '') ||
      paqueteEstado !== paqueteEstadoInicial;
    const hotelesList = pkg.hoteles || [];
    const hotelesModificados = hotelesList.filter(
      (h) => (hotelesEstado[h.idHotel] ?? true) !== ((h as Hotel).estado !== false)
    );

    try {
      if (pkgModificado) {
        await editarPaquete({
          idPaquete: pkg.idPaquete,
          idPaquetesDetalles: pkg.idPaquetesDetalles,
          nombre: nombreFinal,
          descripcion: descripcionFinal,
          pais: pkg.pais,
          ciudad: pkg.ciudad,
          estado: paqueteEstado,
        });
      }
      if (hotelesModificados.length > 0) {
        for (const h of hotelesModificados) {
          await editarHotel({
            idHotel: h.idHotel,
            idPaquetesDetalles: h.idPaquetesDetalles,
            nombre: h.nombre,
            precio: h.precio,
            estado: hotelesEstado[h.idHotel] ?? true,
          });
        }
      }
      onSave({
        ...pkg,
        nombre: nombreFinal,
        descripcion: descripcionFinal,
        estado: paqueteEstado,
        hoteles: hotelesList.map((h) => ({
          ...h,
          estado: hotelesEstado[h.idHotel] ?? true,
        })),
      } as PaqueteConEstado);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al guardar';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-8 bg-white border-gray-200">
      <h2 className="text-[#1e40af] text-xl font-medium mb-3">Detalle del paquete</h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            className="border-gray-300 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={editDescripcion}
            onChange={(e) => setEditDescripcion(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[180px]"
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <p className="text-gray-900">{pkg.ciudad}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <p className="text-gray-900">{pkg.pais}</p>
          </div>
        </div>
        {pkg.paquetesDetalles && (
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <p className="text-gray-900">{pkg.paquetesDetalles.fechaInicio}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <p className="text-gray-900">{pkg.paquetesDetalles.fechaFin}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#1e40af] font-medium">Hoteles incluidos</h3>
          <Button
            variant="outline"
            size="sm"
            className={
              paqueteEstado
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-green-600 text-green-700 hover:bg-green-50 bg-green-50'
            }
            onClick={() => setPaqueteEstado(!paqueteEstado)}
          >
            {paqueteEstado ? 'Desactivar paquete' : 'Activar paquete'}
          </Button>
        </div>
        {pkg.hoteles && pkg.hoteles.length > 0 ? (
          <ul className="space-y-3">
            {pkg.hoteles.map((h: Hotel) => {
              const estadoHotel = hotelesEstado[h.idHotel] !== false;
              return (
                <li
                  key={h.idHotel}
                  className={`flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg border ${
                    estadoHotel ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-[#60a5fa]" />
                    <span className="font-normal text-sm text-gray-900">{h.nombre}</span>
                    <span className="text-xs text-gray-600">— {formatPrecio(h.precio)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      estadoHotel
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : 'border-green-600 text-green-700 hover:bg-green-50 bg-green-50'
                    }
                    onClick={() =>
                      setHotelesEstado((prev) => ({ ...prev, [h.idHotel]: !estadoHotel }))
                    }
                  >
                    {estadoHotel ? 'Desactivar' : 'Activar'}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No hay hoteles asociados.</p>
        )}
      </div>

      {saveError && (
        <p className="text-sm mb-4 font-bold text-red-700">{saveError}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-end pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </Card>
  );
}
