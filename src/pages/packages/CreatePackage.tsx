import { useState } from 'react';
import { ArrowLeft, Plus, X, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import {
  createPaquetesDetalles,
  createHotel,
  createPaquete,
} from '../../services/paquetes';
import { hasMinLength, isPrecioMayorQueCero, MIN_TEXT_LENGTH } from '../../utils/validations';

interface CreatePackageProps {
  onBack: () => void;
}

export function CreatePackage({ onBack }: CreatePackageProps) {
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    name: '',
    description: '',
    fechaInicio: '',
    fechaFin: '',
  });

  type HotelEntry = { nombre: string; precio: string };
  const [hotels, setHotels] = useState<HotelEntry[]>([]);
  const [currentHotel, setCurrentHotel] = useState('');
  const [currentPrecio, setCurrentPrecio] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFormValid =
    formData.country &&
    formData.city &&
    hasMinLength(formData.name) &&
    (formData.description === '' || hasMinLength(formData.description)) &&
    formData.fechaInicio &&
    formData.fechaFin &&
    hotels.length > 0 &&
    hotels.every((h) => hasMinLength(h.nombre) && isPrecioMayorQueCero(h.precio));

  const handleAddHotel = () => {
    if (hasMinLength(currentHotel) && isPrecioMayorQueCero(currentPrecio)) {
      setHotels([...hotels, { nombre: currentHotel.trim(), precio: currentPrecio.trim() }]);
      setCurrentHotel('');
      setCurrentPrecio('');
    }
  };

  const handleRemoveHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  const handleUpdateHotelPrecio = (index: number, precio: string) => {
    setHotels(hotels.map((h, i) => (i === index ? { ...h, precio } : h)));
  };

  const getValidationError = (): string | null => {
    if (!hasMinLength(formData.name)) {
      return `El nombre del paquete debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`;
    }
    if (formData.description.trim() !== '' && !hasMinLength(formData.description)) {
      return `La descripción debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`;
    }
    for (let i = 0; i < hotels.length; i++) {
      if (!hasMinLength(hotels[i].nombre)) {
        return `El nombre del hotel "${hotels[i].nombre || '(sin nombre)'}" debe tener al menos ${MIN_TEXT_LENGTH} caracteres.`;
      }
      if (!isPrecioMayorQueCero(hotels[i].precio)) {
        return `El precio del hotel "${hotels[i].nombre}" debe ser mayor a 0.`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = getValidationError();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    if (!isFormValid || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Paso 1: crear paquetes-detalles (sin precio; el precio va en cada hotel)
      const detalle = await createPaquetesDetalles({
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
      });
      const idPaquetesDetalles = detalle.idPaquetesDetalles;

      // Paso 2: crear cada hotel con nombre y precio
      for (const h of hotels) {
        await createHotel({
          idPaquetesDetalles,
          nombre: h.nombre,
          precio: Number(h.precio.replace(/,/g, '.')),
        });
      }

      // Paso 3: crear el paquete
      await createPaquete({
        idPaquetesDetalles,
        nombre: formData.name,
        descripcion: formData.description || '',
        pais: formData.country,
        ciudad: formData.city,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 2000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al crear el paquete. Intente de nuevo.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Crear Nuevo Paquete</h1>
        <p className="text-gray-600">Complete la información del paquete turístico</p>
      </div>

      <Card className="max-w-3xl mx-auto p-8 bg-white border-gray-200">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700">
                País <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: Ecuador"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: Quito"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700">
              Nombre del paquete <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Ej: Paquete Quito Experience"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700">
              Descripción (opcional)
            </label>
            <Textarea
              placeholder="Descripción del paquete turístico..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-gray-300 bg-white min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">
                Fecha fin <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="border-gray-300 bg-white"
                min={formData.fechaInicio || undefined}
              />
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
              <p className="font-bold text-red-700">{submitError}</p>
            </div>
          )}

          <div>
            <label className="block mb-2 text-gray-700">
              Hoteles <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">Agregue los hoteles del paquete con nombre y precio por hotel</p>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <label className="block mb-1 text-sm text-gray-600">Nombre del hotel</label>
                <Input
                  type="text"
                  placeholder="Ej: Hotel Playa Dorada"
                  value={currentHotel}
                  onChange={(e) => setCurrentHotel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHotel();
                    }
                  }}
                  className="border-gray-300 bg-white"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block mb-1 text-sm text-gray-600">Precio</label>
                <Input
                  type="number"
                  placeholder="Ej: 150000"
                  value={currentPrecio}
                  onChange={(e) => setCurrentPrecio(e.target.value)}
                  min={0.01}
                  step={0.01}
                  className="border-gray-300 bg-white"
                />
              </div>
              <div className="sm:col-span-3">
                <Button
                  onClick={handleAddHotel}
                  type="button"
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white w-full"
                  disabled={!hasMinLength(currentHotel) || !isPrecioMayorQueCero(currentPrecio)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {hotels.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-[#1e40af] mb-3">Hoteles agregados ({hotels.length}):</p>
                <div className="space-y-2">
                  {hotels.map((hotel, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded border border-blue-200"
                    >
                      <span className="text-gray-700 font-medium">{hotel.nombre}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Precio:</label>
                        <Input
                          type="number"
                          value={hotel.precio}
                          onChange={(e) => handleUpdateHotelPrecio(index, e.target.value)}
                          min={0.01}
                          step={0.01}
                          className="border-gray-300 bg-white w-32"
                        />
                        <Button
                          onClick={() => handleRemoveHotel(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-[#60a5fa] text-[#1e40af] hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Crear paquete'}
          </Button>
        </div>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-green-700">
              ¡Paquete Creado Exitosamente!
            </DialogTitle>
            <DialogDescription className="text-center">
              El paquete "{formData.name}" ha sido creado correctamente y está disponible en el listado.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
