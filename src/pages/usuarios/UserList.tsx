import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { getUsuarios, type Usuario } from '../../services/usuarios';
import { ROWS_PER_PAGE } from '../../utils/constants';
import { truncate } from '../../utils/stringFormats';
import { EditUser } from './EditUser';

interface UserListProps {
  onCreateNew?: () => void;
}

export function UserList(_props: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios();
      setUsers(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Error al cargar los usuarios';
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.cedula.includes(searchTerm) ||
          u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.rol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(
    () =>
      filteredUsers.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredUsers, currentPage]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const noHayDatos = !loading && users.length === 0;
  const noHayResultadosFiltro = !loading && users.length > 0 && filteredUsers.length === 0;

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Usuarios</h1>
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-[#1e40af] mb-2">Usuarios</h1>
        <p className="font-bold text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#1e40af] mb-2">Usuarios</h1>
        <p className="text-gray-600">Administra los usuarios de la plataforma</p>
      </div>

      {(selectedUser || isCreating) && (
        <EditUser
          user={selectedUser}
          onSave={() => {
            setSelectedUser(null);
            setIsCreating(false);
            loadUsers();
          }}
          onCancel={() => {
            setSelectedUser(null);
            setIsCreating(false);
          }}
        />
      )}

      {!loading && filteredUsers.length > 0 && !selectedUser && !isCreating && (
        <>
          <Card className="p-6 mb-6 bg-white border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block mb-2 text-gray-700">Buscar usuarios</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, cédula, correo o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 bg-white"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedUser(null);
                }}
                className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear usuario
              </Button>
            </div>
          </Card>

          {noHayDatos && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No hay usuarios registrados.</p>
            </div>
          )}

          {noHayResultadosFiltro && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No se encontraron usuarios con los filtros aplicados.</p>
            </div>
          )}

          <div className="rounded-lg overflow-x-auto border border-gray-200 bg-white shadow-sm min-w-0">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Nombre</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Cédula</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-left border-r border-gray-200">Correo</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Rol</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center border-r border-gray-200">Estado</TableHead>
                  <TableHead className="text-gray-700 font-medium py-3 px-4 text-center w-[100px]">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {paginatedRows.map((u) => {
                  const estado = u.estado !== false;
                  return (
                    <TableRow
                      key={u.idUsuario}
                      className="border-b border-gray-200 hover:bg-blue-50 text-gray-700"
                    >
                      <TableCell className="text-left py-3 px-4 align-middle border-r border-gray-200">{truncate(u.nombre, 25)}</TableCell>
                      <TableCell className="text-left py-3 px-4 align-middle border-r border-gray-200">{u.cedula}</TableCell>
                      <TableCell className="text-left py-3 px-4 align-middle border-r border-gray-200">{truncate(u.correo, 30)}</TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">{u.rol}</TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle border-r border-gray-200">
                        <span className={estado ? 'text-green-700' : 'text-red-700'}>
                          {estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3 px-4 align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#60a5fa] text-[#1e40af] hover:bg-blue-50"
                          onClick={() => setSelectedUser(u)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * ROWS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * ROWS_PER_PAGE, filteredUsers.length)} de{' '}
                {filteredUsers.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        isActive={p === currentPage}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
