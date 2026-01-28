import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Stepper } from '../../components/Stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';

interface CreateReservationProps {
  onBack: () => void;
}

// Mock data structure for packages
const PACKAGES_DATA = [
  {
    id: '1',
    name: 'Barcelona Experience',
    country: 'España',
    city: 'Barcelona',
    hotels: ['Hotel Arts Barcelona', 'W Barcelona', 'Hotel Omm'],
    duration: 7
  },
  {
    id: '2',
    name: 'Madrid Cultural',
    country: 'España',
    city: 'Madrid',
    hotels: ['Hotel Ritz', 'Hotel Palace', 'Gran Hotel'],
    duration: 5
  },
  {
    id: '3',
    name: 'París Romántico',
    country: 'Francia',
    city: 'París',
    hotels: ['Le Meurice', 'Shangri-La Paris', 'Hôtel Plaza Athénée'],
    duration: 6
  },
  {
    id: '4',
    name: 'Lyon Gastronómico',
    country: 'Francia',
    city: 'Lyon',
    hotels: ['Villa Florentine', 'Sofitel Lyon', 'Hotel Carlton'],
    duration: 4
  },
  {
    id: '5',
    name: 'Roma Imperial',
    country: 'Italia',
    city: 'Roma',
    hotels: ['Hotel Hassler', 'Hotel de Russie', 'Splendide Royal'],
    duration: 8
  },
  {
    id: '6',
    name: 'Florencia Arte',
    country: 'Italia',
    city: 'Florencia',
    hotels: ['Hotel Brunelleschi', 'Portrait Firenze', 'Hotel Lungarno'],
    duration: 5
  }
];

export function CreateReservation({ onBack }: CreateReservationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState<'success' | 'error' | null>(null);

  // Step 1: Destination data
  const [destination, setDestination] = useState({
    country: '',
    city: '',
    package: '',
    startDate: '',
    endDate: ''
  });

  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);

  // Step 2: Agent data
  const [agent, setAgent] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Step 3: Client data
  const [client, setClient] = useState({
    name: '',
    document: '',
    email: '',
    phone: ''
  });

  const steps = ['Destino', 'Agente', 'Cliente', 'Confirmación'];

  // Get unique countries
  const countries = Array.from(new Set(PACKAGES_DATA.map(p => p.country))).sort();

  // Get cities based on selected country
  const cities = destination.country
    ? Array.from(new Set(PACKAGES_DATA.filter(p => p.country === destination.country).map(p => p.city))).sort()
    : [];

  // Get packages based on selected country and city
  const availablePackages = destination.country && destination.city
    ? PACKAGES_DATA.filter(p => p.country === destination.country && p.city === destination.city)
    : [];

  // Get selected package details
  const selectedPackage = PACKAGES_DATA.find(p => p.id === destination.package);

  // Auto-calculate end date when package is selected and start date is set
  useEffect(() => {
    if (destination.startDate && selectedPackage) {
      const startDate = new Date(destination.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + selectedPackage.duration);
      const endDateString = endDate.toISOString().split('T')[0];
      setDestination(prev => ({ ...prev, endDate: endDateString }));
    }
  }, [destination.startDate, selectedPackage]);

  // Reset city when country changes
  useEffect(() => {
    setDestination(prev => ({ ...prev, city: '', package: '' }));
    setSelectedHotels([]);
  }, [destination.country]);

  // Reset package when city changes
  useEffect(() => {
    setDestination(prev => ({ ...prev, package: '' }));
    setSelectedHotels([]);
  }, [destination.city]);

  // Reset hotels when package changes
  useEffect(() => {
    setSelectedHotels([]);
  }, [destination.package]);

  const handleHotelToggle = (hotel: string) => {
    setSelectedHotels(prev => 
      prev.includes(hotel) 
        ? prev.filter(h => h !== hotel)
        : [...prev, hotel]
    );
  };

  const isStep1Valid = destination.country && destination.city && destination.package && destination.startDate && destination.endDate && selectedHotels.length > 0;
  const isStep2Valid = agent.name && agent.email && agent.phone;
  const isStep3Valid = client.name && client.document && client.email && client.phone;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simulate submission
      const success = Math.random() > 0.2; // 80% success rate
      setShowResult(success ? 'success' : 'error');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return isStep1Valid;
      case 1:
        return isStep2Valid;
      case 2:
        return isStep3Valid;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (showResult) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Card className="p-12 max-w-md w-full text-center bg-white border-gray-200">
          {showResult === 'success' ? (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
              <h2 className="text-green-700 mb-4">¡Reserva Creada Exitosamente!</h2>
              <p className="text-gray-600 mb-8">
                La reserva para {client.name} ha sido registrada correctamente en el sistema.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="h-20 w-20 text-red-500" />
              </div>
              <h2 className="text-red-700 mb-4">Error al Crear la Reserva</h2>
              <p className="text-gray-600 mb-8">
                Ocurrió un error al procesar la reserva. Por favor, intenta nuevamente.
              </p>
            </>
          )}
          <Button
            onClick={onBack}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white w-full"
          >
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Crear Nueva Reserva</h1>
        <p className="text-gray-600">Complete los siguientes pasos para registrar una nueva reserva</p>
      </div>

      <Card className="max-w-3xl mx-auto p-8 bg-white border-gray-200">
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Step 1: Destination */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-[#1e40af] mb-4">Datos del Destino</h3>
            
            <div>
              <label className="block mb-2 text-gray-700">
                País <span className="text-red-500">*</span>
              </label>
              <Select
                value={destination.country}
                onValueChange={(value) => setDestination({ ...destination, country: value })}
              >
                <SelectTrigger className="border-gray-300 bg-white">
                  <SelectValue placeholder="Seleccione un país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
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
                disabled={!destination.country}
              >
                <SelectTrigger className="border-gray-300 bg-white">
                  <SelectValue placeholder={destination.country ? "Seleccione una ciudad" : "Primero seleccione un país"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
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
                disabled={!destination.city}
              >
                <SelectTrigger className="border-gray-300 bg-white">
                  <SelectValue placeholder={destination.city ? "Seleccione un paquete" : "Primero seleccione país y ciudad"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.duration} días)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPackage && (
              <div>
                <label className="block mb-2 text-gray-700">
                  Hoteles <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">Seleccione uno o más hoteles del paquete</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                  {selectedPackage.hotels.map((hotel) => (
                    <div
                      key={hotel}
                      className="flex items-center space-x-3 bg-white p-3 rounded border border-blue-200"
                    >
                      <Checkbox
                        id={hotel}
                        checked={selectedHotels.includes(hotel)}
                        onCheckedChange={() => handleHotelToggle(hotel)}
                      />
                      <label
                        htmlFor={hotel}
                        className="text-gray-700 cursor-pointer flex-1"
                      >
                        {hotel}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedHotels.length > 0 && (
                  <p className="text-sm text-[#1e40af] mt-2">
                    {selectedHotels.length} hotel(es) seleccionado(s)
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-gray-700">
                  Fecha de inicio <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={destination.startDate}
                  onChange={(e) => setDestination({ ...destination, startDate: e.target.value })}
                  className="border-gray-300 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">
                  Fecha de fin <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={destination.endDate}
                  onChange={(e) => setDestination({ ...destination, endDate: e.target.value })}
                  className="border-gray-300 bg-white"
                  disabled={!selectedPackage}
                />
                {selectedPackage && (
                  <p className="text-xs text-gray-500 mt-1">
                    Calculado automáticamente ({selectedPackage.duration} días)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Agent */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-[#1e40af] mb-4">Datos del Agente de Viaje</h3>
            
            <div>
              <label className="block mb-2 text-gray-700">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: María García"
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
                placeholder="maria.garcia@example.com"
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
                placeholder="+34 600 123 456"
                value={agent.phone}
                onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 3: Client */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-[#1e40af] mb-4">Datos del Cliente</h3>
            
            <div>
              <label className="block mb-2 text-gray-700">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Documento de identidad <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="12345678A"
                value={client.document}
                onChange={(e) => setClient({ ...client, document: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="juan.perez@example.com"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="+34 600 987 654"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                className="border-gray-300 bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-[#1e40af] mb-4">Confirmar Reserva</h3>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
              <div>
                <h4 className="text-[#1e40af] mb-2">Paquete Seleccionado</h4>
                <p className="text-gray-700">{selectedPackage?.name}</p>
                <p className="text-sm text-gray-600">{destination.city}, {destination.country}</p>
                <p className="text-sm text-gray-600">{destination.startDate} - {destination.endDate}</p>
                {selectedHotels.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Hoteles seleccionados:</p>
                    <ul className="text-sm text-gray-600 ml-4">
                      {selectedHotels.map((hotel, index) => (
                        <li key={index}>• {hotel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-t border-blue-200 pt-4">
                <h4 className="text-[#1e40af] mb-2">Agente de Viaje</h4>
                <p className="text-gray-700">{agent.name}</p>
                <p className="text-sm text-gray-600">{agent.email} | {agent.phone}</p>
              </div>

              <div className="border-t border-blue-200 pt-4">
                <h4 className="text-[#1e40af] mb-2">Cliente</h4>
                <p className="text-gray-700">{client.name}</p>
                <p className="text-sm text-gray-600">{client.document} | {client.email} | {client.phone}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              Por favor, revisa todos los datos antes de confirmar la reserva.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-[#60a5fa] text-[#1e40af] hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancelar' : 'Regresar'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Confirmar reserva' : 'Siguiente'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
