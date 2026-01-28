import React, { useState } from 'react';
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
    precioNeto: '',
  });

  const [hotels, setHotels] = useState<string[]>([]);
  const [currentHotel, setCurrentHotel] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFormValid =
    formData.country &&
    formData.city &&
    formData.name &&
    formData.fechaInicio &&
    formData.fechaFin &&
    formData.precioNeto.trim() !== '' &&
    !Number.isNaN(Number(formData.precioNeto)) &&
    hotels.length > 0;

  const handleAddHotel = () => {
    if (currentHotel.trim() && !hotels.includes(currentHotel.trim())) {
      setHotels([...hotels, currentHotel.trim()]);
      setCurrentHotel('');
    }
  };

  const handleRemoveHotel = (hotel: string) => {
    setHotels(hotels.filter(h => h !== hotel));
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const precio = Number(formData.precioNeto.replace(/,/g, '.'));

      // Paso 1: crear paquetes-detalles
      const detalle = await createPaquetesDetalles({
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        precioNeto: precio,
      });
      const idPaquetesDetalles = detalle.idPaquetesDetalles;

      // Paso 2: crear cada hotel
      for (const nombre of hotels) {
        await createHotel({ idPaquetesDetalles, nombre });
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
                placeholder="Ej: España"
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
                placeholder="Ej: Barcelona"
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
              placeholder="Ej: Barcelona Experience"
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

          <div>
            <label className="block mb-2 text-gray-700">
              Precio neto <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="Ej: 1500000"
              value={formData.precioNeto}
              onChange={(e) => setFormData({ ...formData, precioNeto: e.target.value })}
              className="border-gray-300 bg-white"
              min={0}
              step={0.01}
            />
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="block mb-2 text-gray-700">
              Hoteles <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">Ingresa manualmente los hoteles incluidos en este paquete</p>
            
            {/* Add Hotel Input */}
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nombre del hotel"
                  value={currentHotel}
                  onChange={(e) => setCurrentHotel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHotel();
                    }
                  }}
                  className="border-gray-300 bg-white flex-1"
                />
                <Button
                  onClick={handleAddHotel}
                  type="button"
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
                  disabled={!currentHotel.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Selected Hotels */}
            {hotels.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-[#1e40af] mb-3">Hoteles agregados ({hotels.length}):</p>
                <div className="space-y-2">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel}
                      className="flex items-center justify-between bg-white p-3 rounded border border-blue-200"
                    >
                      <span className="text-gray-700">{hotel}</span>
                      <Button
                        onClick={() => handleRemoveHotel(hotel)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
