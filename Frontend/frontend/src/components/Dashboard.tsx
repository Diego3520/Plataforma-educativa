import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo?: string | null;
  activo?: boolean;
};

type Curso = {
  id_curso: number;
  codigo: string;
  titulo: string | null;
  descripcion: string | null;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const usuarioRaw = authService.getUser();
  const baseApi = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  // Convertir id_usuario a número si viene como string
  const usuario = usuarioRaw ? {
    ...usuarioRaw,
    id_usuario: typeof usuarioRaw.id_usuario === 'string' 
      ? parseInt(usuarioRaw.id_usuario) 
      : usuarioRaw.id_usuario
  } as Usuario : null;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<Usuario['tipo'] | null>(null);
  const [selectedActiveState, setSelectedActiveState] = useState<boolean | null>(null);

  const fullName = useMemo(() => {
    if (!usuario) return '';
    return `${usuario.nombre} ${usuario.apellido}`.trim();
  }, [usuario]);

  // Debug: mostrar información del usuario
  console.log('Dashboard - Usuario raw:', usuarioRaw);
  console.log('Dashboard - Usuario procesado:', usuario);
  console.log('Dashboard - Tipo:', usuario?.tipo);
  console.log('Dashboard - ID:', usuario?.id_usuario);

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token) {
      window.location.href = '/login';
      return;
    }

    const load = async () => {
      try {
        setError(null);
        console.log('Dashboard - Cargando datos para tipo:', usuario.tipo);
        
        if (usuario.tipo === 'alumno') {
          console.log('Dashboard - Cargando cursos para alumno');
          const data = await fetchJSON<Curso[]>(`${baseApi}/inscrito/usuario/${usuario.id_usuario}`);
          // El endpoint de inscripciones puede devolver objetos de inscripción; mapeamos a cursos cuando sea necesario
          const maybeCursos: any[] = Array.isArray(data) ? (data as any[]) : [];
          const mapped = maybeCursos.map((it: any) => ({
            id_curso: it.id_topico ?? it.id_curso ?? it.topico_id ?? it.curso_id ?? Math.random(),
            codigo: it.codigo ?? it.curso_codigo ?? 'CURSO',
            titulo: it.titulo ?? it.curso_titulo ?? null,
            descripcion: it.descripcion ?? it.curso_descripcion ?? null,
          }));
          setCursos(mapped);
        } else if (usuario.tipo === 'docente') {
          console.log('Dashboard - Cargando cursos para docente');
          const data = await fetchJSON<Curso[]>(`${baseApi}/curso/docente/${usuario.id_usuario}`);
          setCursos(data);
        } else if (usuario.tipo === 'admin') {
          console.log('Dashboard - Cargando usuarios para admin');
          const list = await fetchJSON<Usuario[]>(`${baseApi}/usuarios`);
          setUsuarios(list);
        } else {
          console.log('Dashboard - Tipo no reconocido:', usuario.tipo);
        }
      } catch (e: any) {
        console.error('Dashboard - Error:', e);
        setError(e.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [usuario, baseApi]);

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedNewRole) return;
    
    try {
      setUpdatingUserId(selectedUser.id_usuario);
      await fetchJSON<Usuario>(`${baseApi}/usuarios/${selectedUser.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo: selectedNewRole }),
      });
      setUsuarios(prev => prev.map(x => x.id_usuario === selectedUser.id_usuario ? { ...x, tipo: selectedNewRole } : x));
      setShowRoleModal(false);
      setSelectedUser(null);
      setSelectedNewRole(null);
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser || selectedActiveState === null) return;
    
    try {
      setUpdatingUserId(selectedUser.id_usuario);
      await fetchJSON<Usuario>(`${baseApi}/usuarios/${selectedUser.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: selectedActiveState }),
      });
      setUsuarios(prev => prev.map(x => x.id_usuario === selectedUser.id_usuario ? { ...x, activo: selectedActiveState } : x));
      setShowActiveModal(false);
      setSelectedUser(null);
      setSelectedActiveState(null);
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el estado');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openRoleModal = (u: Usuario) => {
    setSelectedUser(u);
    setShowRoleModal(true);
  };

  const openActiveModal = (u: Usuario, newState: boolean) => {
    setSelectedUser(u);
    setSelectedActiveState(newState);
    setShowActiveModal(true);
  };

  if (!usuario) return null;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header con info del usuario */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Hola, {fullName || 'Usuario'}</h1>
              <p className="text-lg mb-1">
                Rol: <span className="font-semibold capitalize">{usuario.tipo}</span>
              </p>
              <p className="text-sm text-white/80">Bienvenido a tu panel</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all border border-white/30 hover:border-white/50"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Navegación para admin */}
      {usuario.tipo === 'admin' && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 font-semibold text-gray-700 hover:text-blue-900 transition-colors"
              >
                GESTIONAR USUARIOS
              </button>
              <button
                onClick={() => navigate('/gestion-cursos')}
                className="px-4 py-2 font-semibold text-gray-700 hover:text-blue-900 transition-colors"
              >
                GESTIONAR CURSOS
              </button>
              <button
                className="px-4 py-2 font-semibold text-gray-700 hover:text-blue-900 transition-colors"
              >
                REPORTES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-5 text-sm">{error}</div>
          )}
          {loading && (
            <div className="text-gray-600 text-sm mb-5">Cargando...</div>
          )}

          {usuario.tipo === 'alumno' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis cursos</h2>
              {cursos.length === 0 ? (
                <p className="text-gray-600">No se encontraron cursos.</p>
              ) : (
                <ul className="space-y-3">
                  {cursos.map(c => (
                    <li key={c.id_curso} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="text-sm text-gray-500">{c.codigo}</div>
                      <div className="text-lg font-semibold">{c.titulo || 'Curso'}</div>
                      {c.descripcion && <div className="text-gray-600 text-sm mt-1">{c.descripcion}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {usuario.tipo === 'docente' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursos para administrar</h2>
              {cursos.length === 0 ? (
                <p className="text-gray-600">No tienes cursos asignados.</p>
              ) : (
                <ul className="space-y-3">
                  {cursos.map(c => (
                    <li key={c.id_curso} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="text-sm text-gray-500">{c.codigo}</div>
                      <div className="text-lg font-semibold">{c.titulo || 'Curso'}</div>
                      {c.descripcion && <div className="text-gray-600 text-sm mt-1">{c.descripcion}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {usuario.tipo === 'admin' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuarios</h2>
              {usuarios.length === 0 ? (
                <p className="text-gray-600">No hay usuarios.</p>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">ID</th>
                          <th className="text-left p-3">Nombre</th>
                          <th className="text-left p-3">Correo</th>
                          <th className="text-left p-3">Rol</th>
                          <th className="text-left p-3">Estado</th>
                          <th className="text-left p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map(u => (
                          <tr key={u.id_usuario} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{u.id_usuario}</td>
                            <td className="p-3">{u.nombre} {u.apellido}</td>
                            <td className="p-3">{u.correo || '-'}</td>
                            <td className="p-3 capitalize">{u.tipo}</td>
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={u.activo ?? true}
                                onChange={() => openActiveModal(u, !u.activo)}
                                disabled={updatingUserId === u.id_usuario}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <span className="ml-2 text-sm">{u.activo ? 'Activo' : 'Inactivo'}</span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => openRoleModal(u)}
                                disabled={updatingUserId === u.id_usuario}
                                className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                              >
                                CAMBIAR TIPO DE USUARIO
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-blue-900">
            <h3 className="text-xl font-bold mb-4">Cambiar Tipo de Usuario</h3>
            <p className="mb-4">Usuario: <span className="font-semibold">{selectedUser.nombre} {selectedUser.apellido}</span></p>
            <select
              value={selectedNewRole || ''}
              onChange={(e) => setSelectedNewRole(e.target.value as Usuario['tipo'])}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Seleccionar nuevo rol...</option>
              <option value="docente">Docente</option>
              <option value="editor">Editor</option>
              <option value="alumno">Alumno</option>
              <option value="evaluador">Evaluador</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleChangeRole}
                disabled={!selectedNewRole}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Cambiar
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setSelectedNewRole(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para activar/desactivar */}
      {showActiveModal && selectedUser && selectedActiveState !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-blue-900">
            <h3 className="text-xl font-bold mb-4">¿Estás seguro?</h3>
            <p className="mb-4">
              ¿Deseas {selectedActiveState ? 'activar' : 'desactivar'} el usuario{' '}
              <span className="font-semibold">{selectedUser.nombre} {selectedUser.apellido}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleToggleActive}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowActiveModal(false);
                  setSelectedUser(null);
                  setSelectedActiveState(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


