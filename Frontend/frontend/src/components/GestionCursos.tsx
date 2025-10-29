import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo?: string | null;
};

type Curso = {
  id_curso: number;
  codigo: string;
  titulo: string | null;
  descripcion: string | null;
  docente_id: number | null;
  activo?: boolean;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function GestionCursos() {
  const navigate = useNavigate();
  const usuario = authService.getUser() as Usuario | null;
  const baseApi = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [asignandoDocente, setAsignandoDocente] = useState<number | null>(null);
  const [cursoEditar, setCursoEditar] = useState<Curso | null>(null);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [selectedActiveState, setSelectedActiveState] = useState<boolean | null>(null);

  const [nuevoCurso, setNuevoCurso] = useState({
    codigo: '',
    titulo: '',
    descripcion: '',
    docente_id: ''
  });

  const fullName = usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : '';

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token || usuario.tipo !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const load = async () => {
      try {
        setError(null);
        const [cursosData, usuariosData] = await Promise.all([
          fetchJSON<Curso[]>(`${baseApi}/cursos`),
          fetchJSON<Usuario[]>(`${baseApi}/usuarios`)
        ]);
        
        setCursos(cursosData);
        console.log('Usuarios cargados:', usuariosData);
        // Filtrar solo docentes
        const docentesData = usuariosData.filter(u => u.tipo === 'docente');
        console.log('Docentes filtrados:', docentesData);
        setDocentes(docentesData);
      } catch (e: any) {
        setError(e.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [usuario, baseApi, navigate]);

  const handleCreateCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCurso.codigo.trim()) {
      setError('El código del curso es obligatorio');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const cursoData = {
        codigo: nuevoCurso.codigo.trim(),
        titulo: nuevoCurso.titulo.trim() || '',
        descripcion: nuevoCurso.descripcion.trim() || '',
        docente_id: nuevoCurso.docente_id ? parseInt(nuevoCurso.docente_id) : null
      };

      console.log('Enviando datos del curso:', cursoData);

      const nuevoCursoCreado = await fetchJSON<Curso>(`${baseApi}/cursos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoData)
      });

      setCursos(prev => [...prev, nuevoCursoCreado]);
      setSuccess('Curso creado exitosamente');
      setNuevoCurso({ codigo: '', titulo: '', descripcion: '', docente_id: '' });
      setShowCreateForm(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error creando curso');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoCurso(prev => ({ ...prev, [name]: value }));
  };

  const handleAsignarDocente = async (cursoId: number, docenteId: string) => {
    if (!docenteId) {
      setError('Por favor selecciona un docente');
      return;
    }

    try {
      setAsignandoDocente(cursoId);
      setError(null);
      
      const docenteIdNumber = parseInt(docenteId);
      const cursoActualizado = await fetchJSON<Curso>(`${baseApi}/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docente_id: docenteIdNumber })
      });

      setCursos(prev => prev.map(c => c.id_curso === cursoId ? cursoActualizado : c));
      setSuccess('Docente asignado exitosamente');
      setAsignandoDocente(null);
      setCursoEditar(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error asignando docente');
    } finally {
      setAsignandoDocente(null);
    }
  };

  const handleDesasignarDocente = async (cursoId: number) => {
    try {
      setAsignandoDocente(cursoId);
      setError(null);
      
      console.log('Desasignando docente del curso:', cursoId);
      
      const cursoActualizado = await fetchJSON<Curso>(`${baseApi}/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docente_id: null })
      });
      
      console.log('Curso actualizado:', cursoActualizado);

      setCursos(prev => prev.map(c => c.id_curso === cursoId ? cursoActualizado : c));
      setSuccess('Docente desasignado exitosamente');
      setAsignandoDocente(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error desasignando docente');
    } finally {
      setAsignandoDocente(null);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedCurso || selectedActiveState === null) return;
    
    try {
      const cursoActualizado = await fetchJSON<Curso>(`${baseApi}/cursos/${selectedCurso.id_curso}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: selectedActiveState }),
      });
      setCursos(prev => prev.map(c => c.id_curso === selectedCurso.id_curso ? cursoActualizado : c));
      setShowActiveModal(false);
      setSelectedCurso(null);
      setSelectedActiveState(null);
      setSuccess('Estado del curso actualizado');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el estado');
    }
  };

  const openActiveModal = (curso: Curso, newState: boolean) => {
    setSelectedCurso(curso);
    setSelectedActiveState(newState);
    setShowActiveModal(true);
  };

  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [editForm, setEditForm] = useState({
    codigo: '',
    titulo: '',
    descripcion: '',
    docente_id: ''
  });

  const handleEditCurso = (curso: Curso) => {
    setEditingCurso(curso);
    setEditForm({
      codigo: curso.codigo,
      titulo: curso.titulo || '',
      descripcion: curso.descripcion || '',
      docente_id: curso.docente_id ? curso.docente_id.toString() : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCurso) return;
    
    try {
      const cursoActualizado = await fetchJSON<Curso>(`${baseApi}/cursos/${editingCurso.id_curso}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: editForm.codigo,
          titulo: editForm.titulo,
          descripcion: editForm.descripcion,
          docente_id: editForm.docente_id ? parseInt(editForm.docente_id) : null
        })
      });
      
      setCursos(prev => prev.map(c => c.id_curso === editingCurso.id_curso ? cursoActualizado : c));
      setEditingCurso(null);
      setSuccess('Curso actualizado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el curso');
    }
  };

  if (!usuario || usuario.tipo !== 'admin') return null;

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
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 font-semibold text-gray-700 hover:text-blue-900 transition-colors"
            >
              GESTIONAR USUARIOS
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 font-semibold text-blue-900 transition-colors"
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

      {/* Contenido principal */}
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg mb-5 text-sm">
              {success}
            </div>
          )}

          {loading && (
            <div className="text-gray-600 text-sm mb-5">Cargando...</div>
          )}

          {/* Botón para crear curso */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? 'Cancelar' : '+ Crear Nuevo Curso'}
            </button>
          </div>

          {/* Formulario de creación */}
          {showCreateForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Curso</h3>
              <form onSubmit={handleCreateCurso}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Código del Curso *
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={nuevoCurso.codigo}
                      onChange={handleInputChange}
                      placeholder="Ej: MAT101, PROG201"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Asignar Docente
                    </label>
                    <select
                      name="docente_id"
                      value={nuevoCurso.docente_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Seleccionar docente (opcional) - {docentes.length} disponibles</option>
                      {docentes.map(docente => (
                        <option key={docente.id_usuario} value={docente.id_usuario}>
                          {docente.nombre} {docente.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Título del Curso
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={nuevoCurso.titulo}
                    onChange={handleInputChange}
                    placeholder="Ej: Matemáticas Básicas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={nuevoCurso.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción del curso..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {creating ? 'Creando...' : 'Crear Curso'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de cursos como cards */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursos Existentes</h2>
            {cursos.length === 0 ? (
              <p className="text-gray-600">No hay cursos creados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cursos.map(curso => {
                  const docente = docentes.find(d => d.id_usuario === curso.docente_id);
                  const isActive = curso.activo !== false;
                  return (
                    <div
                      key={curso.id_curso}
                      className={`border rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
                        !isActive ? 'bg-gray-100 opacity-60' : 'bg-white cursor-pointer'
                      }`}
                      onClick={() => {
                        if (isActive) handleEditCurso(curso);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-mono text-blue-600 font-semibold text-lg">{curso.codigo}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openActiveModal(curso, !isActive);
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isActive ? '✓ Activo' : '✗ Inactivo'}
                        </button>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2">{curso.titulo || 'Sin título'}</h3>
                      
                      {curso.descripcion && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{curso.descripcion}</p>
                      )}
                      
                      <div className="mb-3">
                        {docente ? (
                          <div className="text-sm">
                            <span className="text-gray-500">Docente: </span>
                            <span className="text-green-600 font-medium">
                              {docente.nombre} {docente.apellido}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin docente asignado</span>
                        )}
                      </div>

                      {!docente && (
                        <div onClick={(e) => e.stopPropagation()}>
                          {cursoEditar?.id_curso === curso.id_curso ? (
                            <div className="flex flex-col gap-2 mt-3">
                              <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                                onChange={(e) => {
                                  const valor = e.target.value;
                                  if (valor) {
                                    handleAsignarDocente(curso.id_curso, valor);
                                  }
                                }}
                                disabled={asignandoDocente === curso.id_curso}
                              >
                                <option value="">Seleccionar...</option>
                                {docentes.map(d => (
                                  <option key={d.id_usuario} value={d.id_usuario}>
                                    {d.nombre} {d.apellido}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setCursoEditar(null)}
                                className="text-gray-600 text-xs hover:text-gray-800 text-left"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCurso(curso);
                                }}
                                disabled={asignandoDocente === curso.id_curso || !isActive}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 mt-3"
                              >
                                Editar Curso
                              </button>
                          )}
                        </div>
                      )}
                      
                      {docente && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDesasignarDocente(curso.id_curso);
                          }}
                          disabled={asignandoDocente === curso.id_curso || !isActive}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 mt-3"
                          title="Quitar docente"
                        >
                          Quitar Docente
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para activar/desactivar curso */}
      {showActiveModal && selectedCurso && selectedActiveState !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-blue-900">
            <h3 className="text-xl font-bold mb-4">¿Estás seguro?</h3>
            <p className="mb-4">
              ¿Deseas {selectedActiveState ? 'activar' : 'desactivar'} el curso{' '}
              <span className="font-semibold">{selectedCurso.codigo} - {selectedCurso.titulo || 'Sin título'}</span>?
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
                  setSelectedCurso(null);
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

      {/* Modal para editar curso */}
      {editingCurso && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl border-2 border-blue-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Editar Curso</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Código del Curso *
                </label>
                <input
                  type="text"
                  value={editForm.codigo}
                  onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Título del Curso
                </label>
                <input
                  type="text"
                  value={editForm.titulo}
                  onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Descripción
                </label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Asignar Docente
                </label>
                <select
                  value={editForm.docente_id}
                  onChange={(e) => setEditForm({ ...editForm, docente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sin asignar</option>
                  {docentes.map(d => (
                    <option key={d.id_usuario} value={d.id_usuario}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => {
                  setEditingCurso(null);
                  setEditForm({ codigo: '', titulo: '', descripcion: '', docente_id: '' });
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
