import { useState, useEffect } from 'react';
import { Building2, CheckCircle, Plane, Users } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { desactivarReserva, type ReservaConDetalles } from '../../services/reservas';
import { getPasajerosPorIdReserva, type PasajeroDetalle } from '../../services/pasajeros';
import {
  getHotelReservasPorIdReserva,
  editarExtrasHotelReserva,
  type HotelReservaConDetalles,
} from '../../services/hotelReserva';
import { editarExtrasVuelo } from '../../services/vuelos';
import { formatPrecio } from '../../utils/priceFormats';
import { addDay, todayStr } from '../../utils/dateFormats';

interface EditReservationProps {
  reserva: ReservaConDetalles;
  onCancel: () => void;
}

export function EditReservation({ reserva, onCancel }: EditReservationProps) {
  const [pasajeros, setPasajeros] = useState<PasajeroDetalle[]>([]);
  const [loadingPasajeros, setLoadingPasajeros] = useState(true);
  const [hotelReservas, setHotelReservas] = useState<HotelReservaConDetalles[]>([]);
  const [loadingHotelReservas, setLoadingHotelReservas] = useState(true);
  const [fechaExcepcionalSalida, setFechaExcepcionalSalida] = useState(
    reserva.vuelo.fechaExtraSalida ?? ''
  );
  const [fechaExcepcionalLlegada, setFechaExcepcionalLlegada] = useState(
    reserva.vuelo.fechaExtraLlegada ?? ''
  );
  const [fechasExtraHotel, setFechasExtraHotel] = useState<Record<number, { checkin: string; checkout: string }>>({});
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLoadingPasajeros(true);
    getPasajerosPorIdReserva(reserva.idReserva)
      .then(setPasajeros)
      .catch(() => setPasajeros([]))
      .finally(() => setLoadingPasajeros(false));
  }, [reserva.idReserva]);

  useEffect(() => {
    setLoadingHotelReservas(true);
    getHotelReservasPorIdReserva(reserva.idReserva)
      .then((data) => {
        setHotelReservas(data);
        const initial: Record<number, { checkin: string; checkout: string }> = {};
        data.forEach((hr) => {
          initial[hr.idHotelReserva] = {
            checkin: hr.fechaExtraCheckin ?? '',
            checkout: hr.fechaExtraCheckout ?? '',
          };
        });
        setFechasExtraHotel(initial);
      })
      .catch(() => setHotelReservas([]))
      .finally(() => setLoadingHotelReservas(false));
  }, [reserva.idReserva]);

  const paquete = reserva.paquete;
  const vuelo = reserva.vuelo;
  const agencia = reserva.agencia;

  const today = todayStr();
  const minFechaExtraSalidaVuelo = addDay(vuelo.fechaLlegada);
  const minVueloSalida = today > minFechaExtraSalidaVuelo ? today : minFechaExtraSalidaVuelo;
  const minVueloLlegada = fechaExcepcionalSalida
    ? (addDay(fechaExcepcionalSalida) > today ? addDay(fechaExcepcionalSalida) : today)
    : minVueloSalida;

  const hasVueloChanges =
    fechaExcepcionalSalida !== (reserva.vuelo.fechaExtraSalida ?? '') ||
    fechaExcepcionalLlegada !== (reserva.vuelo.fechaExtraLlegada ?? '');
  const hasHotelChanges =
    !loadingHotelReservas &&
    hotelReservas.some((hr) => {
      const extra = fechasExtraHotel[hr.idHotelReserva];
      const checkin = extra?.checkin ?? '';
      const checkout = extra?.checkout ?? '';
      return checkin !== (hr.fechaExtraCheckin ?? '') || checkout !== (hr.fechaExtraCheckout ?? '');
    });
  const hasChanges = hasVueloChanges || hasHotelChanges;

  async function handleCancelarReserva() {
    if (!window.confirm('¿Está seguro de cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    setError(null);
    setCancelling(true);
    try {
      await desactivarReserva({
        idReserva: reserva.idReserva,
        idUsuario: reserva.idUsuario,
        idVuelo: reserva.vuelo.idVuelo,
        idPaquete: reserva.paquete.idPaquete,
        idAgencia: reserva.agencia.idAgencia,
        fechaReserva: reserva.fechaReserva,
        costoTotal: reserva.costoTotal,
        estado: false,
      });
      onCancel();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Error al cancelar la reserva.';
      setError(msg);
    } finally {
      setCancelling(false);
    }
  }

  function handleEditar() {
    setError(null);
    if (fechaExcepcionalSalida && fechaExcepcionalSalida <= vuelo.fechaLlegada) {
      setError('La fecha excepcional de salida debe ser posterior a la fecha de llegada del vuelo.');
      return;
    }
    if (fechaExcepcionalLlegada && fechaExcepcionalSalida && fechaExcepcionalLlegada <= fechaExcepcionalSalida) {
      setError('La fecha excepcional de llegada debe ser posterior a la fecha excepcional de salida.');
      return;
    }
    for (const hr of hotelReservas) {
      const extra = fechasExtraHotel[hr.idHotelReserva];
      const checkin = extra?.checkin ?? '';
      const checkout = extra?.checkout ?? '';
      if (checkin && checkin <= hr.fechaCheckout) {
        setError(`Hotel ${hr.hotel.nombre}: la fecha extra de check-in debe ser posterior a la fecha de check-out (${hr.fechaCheckout}).`);
        return;
      }
      if (checkout && checkin && checkout <= checkin) {
        setError(`Hotel ${hr.hotel.nombre}: la fecha extra de check-out debe ser posterior a la fecha extra de check-in.`);
        return;
      }
    }
    setSaving(true);
    Promise.all([
      editarExtrasVuelo({
        idVuelo: vuelo.idVuelo,
        aerolinea: vuelo.aerolinea,
        origen: '',
        destino: `${vuelo.nombreCiudadDestino}, ${vuelo.nombrePaisDestino}`,
        fechaSalida: vuelo.fechaSalida,
        fechaLlegada: vuelo.fechaLlegada,
        fechaExtraSalida: fechaExcepcionalSalida || vuelo.fechaLlegada,
        fechaExtraLlegada: fechaExcepcionalLlegada || fechaExcepcionalSalida || vuelo.fechaLlegada,
      }),
      ...hotelReservas.map((hr) => {
        const extra = fechasExtraHotel[hr.idHotelReserva];
        return editarExtrasHotelReserva({
          idHotelReserva: hr.idHotelReserva,
          idReserva: reserva.idReserva,
          idHotel: hr.idHotel,
          fechaCheckin: hr.fechaCheckin,
          fechaCheckout: hr.fechaCheckout,
          fechaExtraCheckin: extra?.checkin || hr.fechaCheckout,
          fechaExtraCheckout: extra?.checkout || extra?.checkin || hr.fechaCheckout,
        });
      }),
    ])
      .then(() => setShowSuccess(true))
      .catch((e) => setError(e?.response?.data?.message || e?.message || 'Error al guardar.'))
      .finally(() => setSaving(false));
  }

  if (showSuccess) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 max-w-md w-full text-center bg-white border-gray-200">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h2 className="text-green-700 mb-4">Las fechas fueron actualizadas con éxito</h2>
          <p className="text-gray-600 mb-8">
            Los cambios en las fechas extras del vuelo y de los hoteles se han guardado correctamente.
          </p>
          <Button
            onClick={onCancel}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white w-full"
          >
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto pb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#1e40af] text-xl font-medium">Detalle de la reserva</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleCancelarReserva}
            disabled={cancelling || reserva.estado === false}
            style={{ backgroundColor: reserva.estado === false ? '#6b7280' : 'red' }}
          >
            {reserva.estado === false ? 'Reserva cancelada' : cancelling ? 'Cancelando...' : 'Cancelar Reserva'}
          </Button>
          <Button
            onClick={handleEditar}
            disabled={saving || !hasChanges}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? 'Guardando...' : 'Editar'}
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Volver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna 1: Paquete (izq) + Hoteles debajo */}
        <Card className="p-5 bg-white border-gray-200">
          <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-[#1e40af] font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Paquete
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <p className="text-gray-900">{paquete.nombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <p className="text-gray-900">{paquete.descripcion || '—'}</p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <p className="text-gray-900">{paquete.nombreCiudad}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                    <p className="text-gray-900">{paquete.nombrePais}</p>
                  </div>
                </div>
                {paquete.estado !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado paquete</label>
                    <p className={paquete.estado ? 'text-green-700' : 'text-red-700'}>
                      {paquete.estado ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-[#1e40af] font-medium mb-3">Hoteles</h4>
            {loadingHotelReservas ? (
              <p className="text-gray-500 text-sm">Cargando hoteles...</p>
            ) : hotelReservas.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay hoteles asociados a esta reserva.</p>
            ) : (
              <ul className="space-y-4">
                {hotelReservas.map((hr) => (
                  <li
                    key={hr.idHotelReserva}
                    className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <p className="font-medium text-gray-900">{hr.hotel.nombre}</p>
                    {hr.hotel.precio != null && (
                      <p className="text-sm text-gray-600 mb-3">{formatPrecio(hr.hotel.precio)}</p>
                    )}
                    <div className="flex gap-6 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha check-in</label>
                        <p className="text-gray-900">{hr.fechaCheckin}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha check-out</label>
                        <p className="text-gray-900">{hr.fechaCheckout}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fecha extra checkin
                        </label>
                        <Input
                          disabled={reserva.estado === false}
                          type="date"
                          min={
                            (() => {
                              const minDespuesCheckout = addDay(hr.fechaCheckout);
                              return minDespuesCheckout > today ? minDespuesCheckout : today;
                            })()
                          }
                          value={fechasExtraHotel[hr.idHotelReserva]?.checkin ?? ''}
                          onChange={(e) =>
                            setFechasExtraHotel((prev) => ({
                              ...prev,
                              [hr.idHotelReserva]: {
                                ...prev[hr.idHotelReserva],
                                checkin: e.target.value,
                              },
                            }))
                          }
                          className="border-gray-300 bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fecha extra checkout
                        </label>
                        <Input
                          disabled={reserva.estado === false}
                          type="date"
                          min={
                            (() => {
                              const base = fechasExtraHotel[hr.idHotelReserva]?.checkin || hr.fechaCheckout;
                              const minDespues = addDay(base);
                              return minDespues > today ? minDespues : today;
                            })()
                          }
                          value={fechasExtraHotel[hr.idHotelReserva]?.checkout ?? ''}
                          onChange={(e) =>
                            setFechasExtraHotel((prev) => ({
                              ...prev,
                              [hr.idHotelReserva]: {
                                ...prev[hr.idHotelReserva],
                                checkout: e.target.value,
                              },
                            }))
                          }
                          className="border-gray-300 bg-white text-sm"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex-1 min-w-0 lg:border-l lg:border-gray-200 lg:pl-6">
            <h3 className="text-[#1e40af] font-medium mb-3 flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Vuelo
            </h3>
            <div className="flex flex-col sm:flex-row sm:gap-6 gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aerolínea</label>
                  <p className="text-gray-900">{vuelo.aerolinea}</p>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <p className="text-gray-900">{vuelo.nombreCiudadDestino}, {vuelo.nombrePaisDestino}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha salida</label>
                    <p className="text-gray-900">{vuelo.fechaSalida}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha llegada</label>
                    <p className="text-gray-900">{vuelo.fechaLlegada}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-3 sm:border-l sm:border-gray-200 sm:pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha excepcional salida
                  </label>
                  <Input
                    disabled={reserva.estado === false}
                    type="date"
                    min={minVueloSalida}
                    value={fechaExcepcionalSalida}
                    onChange={(e) => setFechaExcepcionalSalida(e.target.value)}
                    className="border-gray-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha excepcional llegada
                  </label>
                  <Input
                    disabled={reserva.estado === false}
                    type="date"
                    min={minVueloLlegada}
                    value={fechaExcepcionalLlegada}
                    onChange={(e) => setFechaExcepcionalLlegada(e.target.value)}
                    className="border-gray-300 bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Columna 2: Agencia */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border-gray-200">
            <h3 className="text-[#1e40af] font-medium mb-3">Agencia de viaje</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <p className="text-gray-900">{agencia.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{agencia.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <p className="text-gray-900">{agencia.telefono}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sección Pasajeros */}
      <Card className="p-5 mt-4 bg-white border-gray-200">
        <h3 className="text-[#1e40af] font-medium mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pasajeros
        </h3>
        {loadingPasajeros ? (
          <p className="text-gray-500 text-sm">Cargando pasajeros...</p>
        ) : pasajeros.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pasajeros registrados para esta reserva.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Nombre</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Apellido</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Cédula</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Fecha nacimiento</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-700">Pasaporte</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-700">Visa</th>
                </tr>
              </thead>
              <tbody>
                {pasajeros.map((p) => (
                  <tr key={p.idPasajero} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-900">{p.nombre}</td>
                    <td className="py-2 px-3 text-gray-900">{p.apellido}</td>
                    <td className="py-2 px-3 text-gray-900">{p.cedula}</td>
                    <td className="py-2 px-3 text-gray-900">{p.fechaNacimiento}</td>
                    <td className="py-2 px-3 text-center">
                      {p.pasaporte ? (
                        <span className="text-green-700">Sí</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.visa ? (
                        <span className="text-green-700">Sí</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {error && (
        <p className="mt-4 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}
    </div>
  );
}
