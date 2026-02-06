import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Stepper } from '../../components/Stepper';
import {
  getPaisesYCiudadesDistintos,
  buscarPaquetesPorPaisYCiudad,
  type PaqueteResumen,
  type PaisesYCiudadesDistintosResponse,
} from '../../services/paquetes';
import { getToken } from '../../services/oauth';
import { getUserInformation, type UsuarioInfo } from '../../services/usuarios';
import { createVuelo } from '../../services/vuelos';
import { createAgencia } from '../../services/agencias';
import { createReserva } from '../../services/reservas';
import { createPasajero } from '../../services/pasajeros';
import { createHotelReserva } from '../../services/hotelReserva';
import { dateToYMD } from '../../utils/dateFormats';
import {
  hasMinLength,
  isValidEmail,
  isValidTelefono,
  isValidCedula,
  isValidFechaNacimiento,
  isValidFechasVuelo,
} from '../../utils/validations';
import {
  DestinoStep,
  AgenteStep,
  PasajerosStep,
  VuelosStep,
  ConfirmacionStep,
  pasajeroVacio,
  type Pasajero,
  type AgentState,
} from './steps';

interface CreateReservationProps {
  onBack: () => void;
}

export type { Pasajero } from './steps';

export function CreateReservation({ onBack }: CreateReservationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState<'success' | 'error' | null>(null);

  const [paises, setPaises] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState<PaqueteResumen[]>([]);
  const [loadingPaisesCiudades, setLoadingPaisesCiudades] = useState(true);
  const [loadingPaquetes, setLoadingPaquetes] = useState(false);

  const [destination, setDestination] = useState({
    country: '',
    city: '',
    package: '',
    hotel: '',
    startDate: '',
    endDate: '',
  });

  const [agent, setAgent] = useState<AgentState>({
    name: '',
    email: '',
    phone: '',
  });

  const [passengers, setPassengers] = useState<Pasajero[]>([{ ...pasajeroVacio }]);

  const [vuelo, setVuelo] = useState({
    aerolinea: '',
    origen: '',
    fechaSalida: '',
    fechaLlegada: '',
    fechaExtraSalida: '',
    fechaExtraLlegada: '',
  });

  const [costoTotal, setCostoTotal] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UsuarioInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = ['Destino', 'Agente', 'Pasajeros', 'Vuelos', 'Confirmación'];

  const selectedPaqueteResumen =
    destination.package
      ? paquetesDisponibles.find((p) => String(p.idPaquete) === destination.package) ?? null
      : null;

  useEffect(() => {
    getPaisesYCiudadesDistintos()
      .then((r: PaisesYCiudadesDistintosResponse) => {
        setPaises(r.paises);
        setCiudades(r.ciudades);
      })
      .catch(() => {
        setPaises([]);
        setCiudades([]);
      })
      .finally(() => setLoadingPaisesCiudades(false));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getUserInformation(token)
        .then(setUserInfo)
        .catch(() => setUserInfo(null));
    } else {
      setUserInfo(null);
    }
  }, []);

  useEffect(() => {
    if (destination.country && destination.city) {
      setLoadingPaquetes(true);
      buscarPaquetesPorPaisYCiudad(destination.country, destination.city)
        .then(setPaquetesDisponibles)
        .catch(() => setPaquetesDisponibles([]))
        .finally(() => setLoadingPaquetes(false));
    } else {
      setPaquetesDisponibles([]);
    }
  }, [destination.country, destination.city]);

  useEffect(() => {
    setDestination((prev) => ({ ...prev, city: '', package: '' }));
  }, [destination.country]);

  useEffect(() => {
    setDestination((prev) => ({ ...prev, package: '', hotel: '' }));
  }, [destination.city]);

  useEffect(() => {
    setDestination((prev) => ({ ...prev, hotel: '' }));
  }, [destination.package]);

  useEffect(() => {
    if (selectedPaqueteResumen?.paquetesDetalles) {
      setDestination((prev) => ({
        ...prev,
        startDate: selectedPaqueteResumen.paquetesDetalles!.fechaInicio,
        endDate: selectedPaqueteResumen.paquetesDetalles!.fechaFin,
      }));
    }
  }, [destination.package]);

  const requiereHotel =
    selectedPaqueteResumen?.hoteles && selectedPaqueteResumen.hoteles.length > 0;
  const isStep1Valid =
    destination.country &&
    destination.city &&
    destination.package &&
    destination.startDate &&
    destination.endDate &&
    (!requiereHotel || !!destination.hotel);
  const isStep2Valid =
    hasMinLength(agent.name) &&
    isValidEmail(agent.email) &&
    isValidTelefono(agent.phone);
  const isStep3Valid =
    passengers.length >= 1 &&
    passengers.every(
      (p) =>
        hasMinLength(p.nombre) &&
        hasMinLength(p.apellido) &&
        isValidCedula(p.cedula) &&
        p.fechaNacimiento.trim() !== '' &&
        isValidFechaNacimiento(p.fechaNacimiento).valid
    );
  const isStep4Valid =
    vuelo.aerolinea.trim() &&
    vuelo.origen.trim() &&
    vuelo.fechaSalida &&
    vuelo.fechaLlegada &&
    isValidFechasVuelo(vuelo.fechaSalida, vuelo.fechaLlegada).valid;
  const isStep5Valid =
    costoTotal.trim() !== '' &&
    !Number.isNaN(Number(costoTotal.replace(/,/g, '.'))) &&
    Number(costoTotal.replace(/,/g, '.')) > 0;

  const addPassenger = () => setPassengers((prev) => [...prev, { ...pasajeroVacio }]);

  const removePassenger = (index: number) =>
    setPassengers((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const updatePassenger = (index: number, field: keyof Pasajero, value: string | boolean) =>
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );


  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSubmitError(null);
      return;
    }
    if (!userInfo || !selectedPaqueteResumen || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const vueloCreado = await createVuelo({
        aerolinea: vuelo.aerolinea,
        origen: vuelo.origen,
        destino: destination.country,
        fechaSalida: vuelo.fechaSalida,
        fechaLlegada: vuelo.fechaLlegada,
        fechaExtraSalida: vuelo.fechaExtraSalida || null,
        fechaExtraLlegada: vuelo.fechaExtraLlegada || null,
      });
      const idAgenciaFinal =
        agent.idAgencia != null
          ? agent.idAgencia
          : (await createAgencia({
              nombre: agent.name,
              telefono: agent.phone,
              email: agent.email,
            })).idAgencia;
      const fechaReserva = dateToYMD();
      const costo = Number(costoTotal.replace(/,/g, '.'));
      const reservaCreada = await createReserva({
        idUsuario: userInfo.idUsuario, 
        idVuelo: vueloCreado.idVuelo,
        idPaquete: selectedPaqueteResumen.idPaquete,
        idAgencia: idAgenciaFinal,
        fechaReserva,
        costoTotal: costo,
        estado: true,
      });
      for (const p of passengers) {
        await createPasajero({
          idReserva: reservaCreada.idReserva,
          nombre: p.nombre,
          apellido: p.apellido,
          cedula: p.cedula,
          fechaNacimiento: p.fechaNacimiento,
          pasaporte: p.pasaporte,
          visa: p.visa,
        });
      }
      if (destination.hotel) {
        await createHotelReserva({
          idReserva: reservaCreada.idReserva,
          idHotel: Number(destination.hotel),
          fechaCheckin: destination.startDate,
          fechaCheckout: destination.endDate,
          fechaExtraCheckin: null,
          fechaExtraCheckout: null,
        });
      }
      setShowResult('success');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al crear la reserva. Intente de nuevo.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
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
        return isStep4Valid;
      case 4:
        return isStep5Valid && userInfo !== null;
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
                La reserva para {passengers.length} pasajero(s) ha sido registrada correctamente en
                el sistema.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="h-20 w-20 text-red-500" />
              </div>
              <h2 className="font-bold text-red-700 mb-4">Error al Crear la Reserva</h2>
              <p className="font-bold text-red-700 mb-8">
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DestinoStep
            paises={paises}
            ciudades={ciudades}
            paquetesDisponibles={paquetesDisponibles}
            loadingPaisesCiudades={loadingPaisesCiudades}
            loadingPaquetes={loadingPaquetes}
            destination={destination}
            setDestination={setDestination}
            selectedPaqueteResumen={selectedPaqueteResumen}
          />
        );
      case 1:
        return <AgenteStep agent={agent} setAgent={setAgent} />;
      case 2:
        return (
          <PasajerosStep
            passengers={passengers}
            addPassenger={addPassenger}
            removePassenger={removePassenger}
            updatePassenger={updatePassenger}
          />
        );
      case 3:
        return (
          <VuelosStep
            vuelo={vuelo}
            setVuelo={setVuelo}
            destinoBloqueado={destination.country}
          />
        );
      case 4:
        return (
          <ConfirmacionStep
            costoTotal={costoTotal}
            setCostoTotal={setCostoTotal}
            submitError={submitError}
            selectedPaqueteResumen={selectedPaqueteResumen}
            destination={destination}
            vuelo={vuelo}
            agent={agent}
            passengers={passengers}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Crear Nueva Reserva</h1>
        <p className="text-gray-600">Complete los siguientes pasos para registrar una nueva reserva</p>
      </div>

      <Card className="max-w-3xl mx-auto p-8 bg-white border-gray-200">
        <Stepper steps={steps} currentStep={currentStep} />

        {renderStep()}

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
            disabled={!canProceed() || submitting}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1
              ? submitting
                ? 'Guardando...'
                : 'Confirmar reserva'
              : 'Siguiente'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
