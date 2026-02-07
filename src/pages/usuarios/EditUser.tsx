import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { actualizarUsuario, createUsuario, type Usuario } from '../../services/usuarios';
import { getRoles, type Rol } from '../../services/rol';
import { isValidEmail, isValidCedula, CEDULA_LENGTH } from '../../utils/validations';

interface EditUserProps {
  user: Usuario | null;
  onSave: () => void;
  onCancel: () => void;
}

export function EditUser({ user, onSave, onCancel }: EditUserProps) {
  const isNew = user == null;
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [cedula, setCedula] = useState(user?.cedula ?? '');
  const [correo, setCorreo] = useState(user?.correo ?? '');
  const [idRol, setIdRol] = useState<number | ''>(user?.idRol ?? '');
  const [estado, setEstado] = useState(user?.estado !== false);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoadingRoles(false));
  }, []);

  useEffect(() => {
    if (user != null) {
      const resolved = user.idRol ?? roles.find((r) => r.tipo === user.rol)?.idRol ?? '';
      setIdRol(resolved !== undefined ? resolved : '');
    } else if (roles.length > 0 && idRol === '') {
      setIdRol(roles[0].idRol);
    }
  }, [user?.idUsuario, user?.rol, user?.idRol, roles]);

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [repetirPassword, setRepetirPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showRepetirPassword, setShowRepetirPassword] = useState(false);

  const handleToggleEstado = () => {
    setEstado((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidCedula(cedula)) {
      setError(`La cédula debe tener exactamente ${CEDULA_LENGTH} caracteres.`);
      return;
    }
    if (!isValidEmail(correo)) {
      setError('Ingrese un correo electrónico válido.');
      return;
    }
    if (nuevaPassword !== repetirPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword && nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        if (!nuevaPassword.trim()) {
          setError('La contraseña es obligatoria para crear un usuario.');
          setSaving(false);
          return;
        }
        const rolId = idRol !== '' ? Number(idRol) : roles[0]?.idRol;
        if (rolId == null) {
          setError('Seleccione un rol.');
          setSaving(false);
          return;
        }
        await createUsuario({
          idUsuario: 0,
          nombre: nombre.trim(),
          cedula: cedula.trim(),
          correo: correo.trim(),
          idRol: rolId,
          password: nuevaPassword,
          estado,
        });
      } else {
        const rolId = idRol !== '' ? Number(idRol) : user?.idRol ?? roles.find((r) => r.tipo === user?.rol)?.idRol;
        await actualizarUsuario({
          idUsuario: user!.idUsuario,
          nombre: nombre.trim(),
          cedula: cedula.trim(),
          correo: correo.trim(),
          idRol: rolId,
          password: nuevaPassword || undefined,
          estado,
        });
      }
      onSave();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al guardar.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card className="p-5 mb-6 bg-white border-gray-200 shadow-lg max-w-2xl overflow-visible">
      <div className="flex justify-between items-center gap-4 mb-3 flex-wrap">
        <h2 className="text-[#1e40af] text-lg font-semibold shrink-0">
          {isNew ? 'Crear usuario' : 'Editar usuario'}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleEstado}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white border-0 cursor-pointer ${
              estado ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isNew ? 'Crear usuario' : estado ? 'Desactivar usuario' : 'Activar usuario'}
          </button>
          <Button variant="outline" className="border-gray-300 text-gray-700" onClick={onCancel}>
            Volver
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 border-gray-300"
            required
          />
        </div>
        <div>
          <Label htmlFor="cedula">Cédula *</Label>
          <Input
            id="cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="mt-1 border-gray-300"
            required
            disabled={!isNew}
          />
        </div>
        <div>
          <Label htmlFor="correo">Correo *</Label>
          <Input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 border-gray-300"
            required
            disabled={!isNew}
          />
        </div>
        <div>
          <Label>Rol *</Label>
          <Select
            value={idRol !== '' ? String(idRol) : ''}
            onValueChange={(v) => setIdRol(v === '' ? '' : Number(v))}
            disabled={loadingRoles}
          >
            <SelectTrigger className="mt-1 border-gray-300">
              <SelectValue placeholder={loadingRoles ? 'Cargando roles...' : 'Seleccione un rol'} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.idRol} value={String(r.idRol)}>
                  {r.tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="nuevaPassword">
            {isNew ? 'Contraseña *' : 'Nueva contraseña'}
          </Label>
          <div className="relative mt-1">
            <Input
              id="nuevaPassword"
              type={showNuevaPassword ? 'text' : 'password'}
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              placeholder={isNew ? 'Contraseña' : 'Dejar en blanco para no cambiar'}
              className="border-gray-300 pr-10"
              required={isNew}
            />
            <button
              type="button"
              onClick={() => setShowNuevaPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded"
              tabIndex={-1}
              aria-label={showNuevaPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showNuevaPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="repetirPassword">
            {isNew ? 'Repita la contraseña *' : 'Repita la contraseña'}
          </Label>
          <div className="relative mt-1">
            <Input
              id="repetirPassword"
              type={showRepetirPassword ? 'text' : 'password'}
              value={repetirPassword}
              onChange={(e) => setRepetirPassword(e.target.value)}
              placeholder="Repita la contraseña"
              className="border-gray-300 pr-10"
              required={isNew}
            />
            <button
              type="button"
              onClick={() => setShowRepetirPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded"
              tabIndex={-1}
              aria-label={showRepetirPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showRepetirPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Card>
  );
}
