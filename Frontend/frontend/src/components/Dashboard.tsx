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
  docente_id: number | null;
  activo: boolean;
  fecha_creacion?: string;
};

type Material = {
  material_id: number;
  solucion_modelo: string | null;
  ruta_archivo: string | null;
  tamano_bytes: number | null;
  mime_type: string | null;
  content_type: 'pdf' | 'video' | 'imagen' | 'otro';
  creado_at: string;
  activo: boolean;
  id_curso: number;
};

const baseApi = 'http://localhost:5000/api';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
  return res.json();
}

type Topico = {
  id_topico: number;
  id_curso: number;
  orden: number;
  titulo: string | null;
  descripcion: string | null;
  activo: boolean;
};

function TopicosList({ cursoId }: { cursoId: number }) {
  const navigate = useNavigate();
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopicos = async () => {
      try {
        const data = await fetchJSON<Topico[]>(`${baseApi}/topicos/curso/${cursoId}`);
        setTopicos(data.filter(t => t.activo));
      } catch (e: any) {
        console.error('Error cargando tópicos:', e);
        setTopicos([]);
      } finally {
        setLoading(false);
      }
    };
    loadTopicos();
  }, [cursoId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando tópicos...</div>;
  }

  if (topicos.length === 0) {
    return <div className="text-sm text-gray-500">No hay tópicos disponibles.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Tópicos</h3>
      <div className="space-y-2">
        {topicos.map(t => (
          <button
            key={t.id_topico}
            onClick={() => navigate(`/topico/${t.id_topico}/editor`)}
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <div className="font-medium text-gray-900">{t.titulo || `Tópico ${t.orden}`}</div>
            {t.descripcion && (
              <div className="text-sm text-gray-600 mt-1">{t.descripcion}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = useMemo(() => {
    const usuarioRaw = authService.getUser();
    if (!usuarioRaw) return null;
    return {
      ...usuarioRaw,
      id_usuario: typeof usuarioRaw.id_usuario === 'string' 
        ? parseInt(usuarioRaw.id_usuario) 
        : usuarioRaw.id_usuario
    } as Usuario;
  }, []);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<Usuario['tipo'] | null>(null);
  const [selectedActiveState, setSelectedActiveState] = useState<boolean | null>(null);
  
  // Estados para el modal de inscripción
  const [showInscripcionModal, setShowInscripcionModal] = useState(false);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [submittingInscripcion, setSubmittingInscripcion] = useState(false);
  
  // Estados para el modal de material
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const [selectedCursoIdForMaterial, setSelectedCursoIdForMaterial] = useState<number | null>(null);
  const [solucionModelo, setSolucionModelo] = useState('');
  const [rutaArchivo, setRutaArchivo] = useState('');
  const [descripcionMaterial, setDescripcionMaterial] = useState('');
  const [contentType, setContentType] = useState<'pdf' | 'video' | 'imagen' | 'otro'>('pdf');
  const [crearTarea, setCrearTarea] = useState(false);
  const [tareaFechaPublicacion, setTareaFechaPublicacion] = useState(new Date().toISOString().split('T')[0]);
  const [tareaFechaLimite, setTareaFechaLimite] = useState('');
  const [tareaMaterialId, setTareaMaterialId] = useState('');
  const [tareaNotaMax, setTareaNotaMax] = useState('');
  const [tareaSolucionAportada, setTareaSolucionAportada] = useState('');
  const [tareaIdTopico, setTareaIdTopico] = useState('');
  const [topicosCurso, setTopicosCurso] = useState<any[]>([]);
  const [materialesCurso, setMaterialesCurso] = useState<Material[]>([]);

  const fullName = useMemo(() => {
    if (!usuario) return '';
    return `${usuario.nombre} ${usuario.apellido}`.trim();
  }, [usuario]);

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token) {
      window.location.href = '/login';
      return;
    }

    const load = async () => {
      try {
        setError(null);
        
        if (usuario.tipo === 'alumno') {
          const data = await fetchJSON<any[]>(`${baseApi}/inscritos/usuario/${usuario.id_usuario}`);
          const maybeCursos: any[] = Array.isArray(data) ? (data as any[]) : [];
          // El endpoint ahora devuelve información completa del curso
          const mapped = maybeCursos.map((it: any) => ({
            id_curso: it.id_curso ?? it.curso_id ?? Math.random(),
            codigo: it.codigo ?? it.curso_codigo ?? 'CURSO',
            titulo: it.curso_titulo ?? it.titulo ?? null,
            descripcion: it.curso_descripcion ?? it.descripcion ?? null,
            docente_id: it.docente_id ?? null,
            activo: it.curso_activo ?? it.activo ?? true,
            fecha_creacion: it.fecha_creacion
          })) as Curso[];
          setCursos(mapped);
        } else if (usuario.tipo === 'docente') {
          try {
            const data = await fetchJSON<Curso[]>(`${baseApi}/cursos/docente/${usuario.id_usuario}`);
            const cursosActivos = data.filter(c => c.activo !== false);
            setCursos(cursosActivos);
          } catch (e: any) {
            console.error('Error cargando cursos:', e);
            setError(e.message || 'Error cargando cursos');
            setCursos([]);
          }
        } else if (usuario.tipo === 'editor') {
          // Cargar todos los cursos para que el editor pueda ver los tópicos
          try {
            const data = await fetchJSON<Curso[]>(`${baseApi}/cursos`);
            const cursosActivos = data.filter(c => c.activo !== false);
            setCursos(cursosActivos);
          } catch (e: any) {
            console.error('Error cargando cursos:', e);
            setError(e.message || 'Error cargando cursos');
            setCursos([]);
          }
        } else if (usuario.tipo === 'admin') {
          const list = await fetchJSON<Usuario[]>(`${baseApi}/usuarios`);
          setUsuarios(list);
        }
      } catch (e: any) {
        console.error('Error:', e);
        setError(e.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [usuario]);

  const handleSubirMaterial = async () => {
    if (!selectedCursoIdForMaterial) {
      setError('No se ha seleccionado un curso.');
      return;
    }

    if (!rutaArchivo.trim()) {
      setError('La ruta del archivo es obligatoria.');
      return;
    }

    try {
      setSubmittingMaterial(true);
      setError(null);

      // Crear el material
      const payload = {
        id_curso: selectedCursoIdForMaterial,
        solucion_modelo: solucionModelo.trim() || null,
        ruta_archivo: rutaArchivo.trim(),
        tamano_bytes: null,
        mime_type: descripcionMaterial.trim() || null,
        content_type: contentType,
        activo: true
      };

      const nuevoMaterial = await fetchJSON<Material>(`${baseApi}/materiales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(payload),
      });

      // Si se marcó crear tarea, crear la tarea también
      if (crearTarea) {
        const topicoId = tareaIdTopico 
          ? parseInt(tareaIdTopico)
          : (topicosCurso.length > 0 ? topicosCurso[0].id_topico : null);

        if (!topicoId) {
          setError('No hay tópicos disponibles para crear la tarea');
          setSubmittingMaterial(false);
          return;
        }

        await fetchJSON(`${baseApi}/tareas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({
            id_topico: topicoId,
            fecha_publicacion: tareaFechaPublicacion,
            fecha_limite: tareaFechaLimite || null,
            material_id: tareaMaterialId ? parseInt(tareaMaterialId) : nuevoMaterial.material_id,
            nota_max: tareaNotaMax ? parseFloat(tareaNotaMax) : null,
            solucion_aportada: tareaSolucionAportada || null
          }),
        });
      }

      closeMaterialModal();
      setSuccess(crearTarea ? 'Material y tarea creados exitosamente' : 'Material subido exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error al subir el material');
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const openMaterialModal = async (cursoId: number) => {
    setSelectedCursoIdForMaterial(cursoId);
    setShowMaterialModal(true);
    
    // Cargar tópicos y materiales del curso
    try {
      const [topicosData, materialesData] = await Promise.all([
        fetchJSON<any[]>(`${baseApi}/topicos/curso/${cursoId}`).catch(() => []),
        fetchJSON<Material[]>(`${baseApi}/materiales/curso/${cursoId}`).catch(() => [])
      ]);
      setTopicosCurso(topicosData);
      setMaterialesCurso(materialesData);
    } catch (e: any) {
      console.error('Error cargando tópicos/materiales:', e);
    }
  };

  const handleCursoClick = (cursoId: number) => {
    // Navegar a la pantalla de materiales
    navigate(`/curso/${cursoId}/materiales`);
  };

  const handleInscribirse = async () => {
    if (!codigoCurso.trim()) {
      setError('Por favor ingresa un código de curso');
      return;
    }

    if (!usuario) {
      setError('Usuario no encontrado');
      return;
    }

    try {
      setSubmittingInscripcion(true);
      setError(null);

      await fetchJSON(`${baseApi}/inscritos/inscribirse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          codigo_curso: codigoCurso.trim(),
          id_usuario: usuario.id_usuario
        }),
      });

      setSuccess('¡Te has inscrito exitosamente al curso!');
      setShowInscripcionModal(false);
      setCodigoCurso('');
      
      // Recargar los cursos del usuario
      const data = await fetchJSON<any[]>(`${baseApi}/inscritos/usuario/${usuario.id_usuario}`);
      const maybeCursos: any[] = Array.isArray(data) ? (data as any[]) : [];
      const mapped = maybeCursos.map((it: any) => ({
        id_curso: it.id_curso ?? it.curso_id ?? Math.random(),
        codigo: it.codigo ?? it.curso_codigo ?? 'CURSO',
        titulo: it.curso_titulo ?? it.titulo ?? null,
        descripcion: it.curso_descripcion ?? it.descripcion ?? null,
        docente_id: it.docente_id ?? null,
        activo: it.curso_activo ?? it.activo ?? true,
        fecha_creacion: it.fecha_creacion
      })) as Curso[];
      setCursos(mapped);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      console.error('Error inscribiéndose:', e);
      setError(e.message || 'Error al inscribirse al curso');
    } finally {
      setSubmittingInscripcion(false);
    }
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false);
    setSelectedCursoIdForMaterial(null);
    setSolucionModelo('');
    setRutaArchivo('');
    setDescripcionMaterial('');
    setContentType('pdf');
    setCrearTarea(false);
    setTareaFechaPublicacion(new Date().toISOString().split('T')[0]);
    setTareaFechaLimite('');
    setTareaMaterialId('');
    setTareaNotaMax('');
    setTareaSolucionAportada('');
    setTareaIdTopico('');
    setTopicosCurso([]);
    setMaterialesCurso([]);
  };

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
                onClick={() => {
                  try {
                    navigate('/gestion-cursos');
                  } catch (e: any) {
                    console.error('Error navegando a gestion-cursos:', e);
                    setError('Error al acceder a la gestión de cursos');
                  }
                }}
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
          {success && (
            <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg mb-5 text-sm">{success}</div>
          )}
          {loading && (
            <div className="text-gray-600 text-sm mb-5">Cargando...</div>
          )}

          {usuario.tipo === 'alumno' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
                <button
                  onClick={() => setShowInscripcionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Inscribirme a Curso
                </button>
              </div>
              {cursos.length === 0 ? (
                <p className="text-gray-600">No se encontraron cursos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {cursos.map(c => (
                    <div
                      key={c.id_curso}
                      onClick={() => handleCursoClick(c.id_curso)}
                      className="p-5 border-2 rounded-lg bg-white shadow-sm transition-all cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="text-sm text-gray-500 font-mono mb-1">{c.codigo}</div>
                      <div className="text-lg font-semibold text-gray-900 mb-2">{c.titulo || 'Curso'}</div>
                      {c.descripcion && (
                        <div className="text-gray-600 text-sm line-clamp-2">{c.descripcion}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {usuario.tipo === 'docente' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Cursos</h2>
              {cursos.length === 0 ? (
                <p className="text-gray-600">No tienes cursos asignados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {cursos.map(c => (
                    <div 
                      key={c.id_curso}
                      className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-sm text-gray-500 font-mono">{c.codigo}</div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">{c.titulo || 'Curso'}</div>
                        {c.descripcion && <div className="text-gray-600 text-sm mt-2 line-clamp-2 h-10">{c.descripcion}</div>}
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => navigate(`/curso/${c.id_curso}`)}
                          className="w-full text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Ver Curso
                        </button>
                        <button
                          onClick={() => openMaterialModal(c.id_curso)}
                          className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Subir Material
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {usuario.tipo === 'editor' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursos Disponibles</h2>
              {cursos.length === 0 ? (
                <p className="text-gray-600">No hay cursos disponibles.</p>
              ) : (
                <div className="space-y-6">
                  {cursos.map(c => (
                    <div key={c.id_curso} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 font-mono mb-1">{c.codigo}</div>
                        <div className="text-xl font-semibold text-gray-900 mb-2">{c.titulo || 'Curso'}</div>
                        {c.descripcion && (
                          <div className="text-gray-600 text-sm">{c.descripcion}</div>
                        )}
                      </div>
                      <TopicosList cursoId={c.id_curso} />
                    </div>
                  ))}
                </div>
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

      {/* Modal para subir material */}
      {showMaterialModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5">Subir Material para el Curso</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="content_type" className="block text-sm font-semibold mb-1 text-gray-700">
                  Tipo de Contenido <span className="text-red-500">*</span>
                </label>
                <select
                  id="content_type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'pdf' | 'video' | 'imagen' | 'otro')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="imagen">Imagen</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="ruta_archivo" className="block text-sm font-semibold mb-1 text-gray-700">
                  Ruta del Archivo <span className="text-red-500">*</span>
                </label>
                <input
                  id="ruta_archivo"
                  type="text"
                  value={rutaArchivo}
                  onChange={(e) => setRutaArchivo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: /documentos/clase1.pdf"
                  required
                />
              </div>

              <div>
                <label htmlFor="descripcion_material" className="block text-sm font-semibold mb-1 text-gray-700">
                  Descripción del Material
                </label>
                <textarea
                  id="descripcion_material"
                  value={descripcionMaterial}
                  onChange={(e) => setDescripcionMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ej: Material de introducción al curso"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="solucion_modelo" className="block text-sm font-semibold mb-1 text-gray-700">
                  Solución Modelo (Opcional)
                </label>
                <input
                  id="solucion_modelo"
                  type="text"
                  value={solucionModelo}
                  onChange={(e) => setSolucionModelo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: /soluciones/ejercicio1.pdf"
                />
              </div>

              {/* Sección de Tarea */}
              <div className="border-t pt-4 mt-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={crearTarea}
                    onChange={(e) => setCrearTarea(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Crear tarea asociada</span>
                </label>

                {crearTarea && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tópico</label>
                      <select
                        value={tareaIdTopico}
                        onChange={(e) => setTareaIdTopico(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar tópico (se usará el primero si no se selecciona)</option>
                        {topicosCurso.map(t => (
                          <option key={t.id_topico} value={t.id_topico}>
                            {t.titulo || `Tópico ${t.orden}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Fecha de Publicación</label>
                        <input
                          type="date"
                          value={tareaFechaPublicacion}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setTareaFechaPublicacion(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Fecha Límite</label>
                        <input
                          type="date"
                          value={tareaFechaLimite}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setTareaFechaLimite(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Material Asociado (Opcional)</label>
                      <select
                        value={tareaMaterialId}
                        onChange={(e) => setTareaMaterialId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Ninguno (se usará el material actual si no se selecciona)</option>
                        {materialesCurso.map(m => (
                          <option key={m.material_id} value={m.material_id}>
                            {m.mime_type || `Material ${m.material_id}`} - {m.content_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nota Máxima</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tareaNotaMax}
                        onChange={(e) => setTareaNotaMax(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Solución Aportada</label>
                      <textarea
                        value={tareaSolucionAportada}
                        onChange={(e) => setTareaSolucionAportada(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descripción o solución modelo de la tarea..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubirMaterial}
                disabled={submittingMaterial || !rutaArchivo.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submittingMaterial ? 'Subiendo...' : crearTarea ? 'Subir Material y Crear Tarea' : 'Subir Material'}
              </button>
              <button
                onClick={closeMaterialModal}
                disabled={submittingMaterial}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" style={{ fontFamily: 'Poppins, sans-serif' }}>
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

      {/* Modal para inscribirse a curso */}
      {showInscripcionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5">Inscribirme a un Curso</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="codigo_curso" className="block text-sm font-semibold mb-1 text-gray-700">
                  Código del Curso <span className="text-red-500">*</span>
                </label>
                <input
                  id="codigo_curso"
                  type="text"
                  value={codigoCurso}
                  onChange={(e) => setCodigoCurso(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: CURSO001"
                  required
                  disabled={submittingInscripcion}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el código del curso al que deseas inscribirte
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleInscribirse}
                disabled={submittingInscripcion || !codigoCurso.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submittingInscripcion ? 'Inscribiendo...' : 'Inscribirme'}
              </button>
              <button
                onClick={() => {
                  setShowInscripcionModal(false);
                  setCodigoCurso('');
                  setError(null);
                }}
                disabled={submittingInscripcion}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-400 transition-colors"
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