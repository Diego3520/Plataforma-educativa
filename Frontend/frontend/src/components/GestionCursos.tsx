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
  fecha_creacion: string;
  activo: boolean;
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
  const baseApi = (import.meta as any).env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app/api';

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Usuario[]>([]);
  const [editores, setEditores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [asignandoDocente, setAsignandoDocente] = useState<number | null>(null);
  const [cursoEditar, setCursoEditar] = useState<Curso | null>(null);

  const [nuevoCurso, setNuevoCurso] = useState({
    codigo: '',
    titulo: '',
    descripcion: '',
    docente_id: '',
    editor_id: '' // Nuevo campo para el editor
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
        
        // Ordenar cursos: más antiguo al final, más reciente primero
        const cursosOrdenados = [...cursosData].sort((a, b) => {
          const fechaA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
          const fechaB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
          return fechaB - fechaA; // Más reciente primero
        });
        
        setCursos(cursosOrdenados);
        console.log('Usuarios cargados:', usuariosData);
        // Filtrar solo docentes
        const docentesData = usuariosData.filter(u => u.tipo === 'docente');
        console.log('Docentes filtrados:', docentesData);
        setDocentes(docentesData);
        // Editores
        const editoresData = usuariosData.filter(u => u.tipo === 'editor');
        setEditores(editoresData);
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
      // Paso 1: Crear el curso usando el id de usuario como editor_id
      const cursoData:any = {
        codigo: nuevoCurso.codigo.trim(),
        titulo: nuevoCurso.titulo.trim() || '',
        descripcion: nuevoCurso.descripcion.trim() || '',
        docente_id: nuevoCurso.docente_id ? parseInt(nuevoCurso.docente_id) : null,
        editor_id: nuevoCurso.editor_id ? parseInt(nuevoCurso.editor_id) : null,
      };
      await fetchJSON<Curso>(`${baseApi}/cursos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cursoData)
      });

      // Paso 2: Si envió editor, crear el registro en editores con el id del usuario tipo editor
      if (cursoData.editor_id) {
        try {
          await fetchJSON(`${baseApi}/editores`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_docente: cursoData.editor_id })
          });
        } catch (e2) {
          setError('Curso creado, pero no se pudo registrar el editor en la tabla editores.');
        }
      }
      // Recargar cursos
      const cursosData = await fetchJSON<Curso[]>(`${baseApi}/cursos`);
      const cursosOrdenados = [...cursosData].sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion).getTime();
        const fechaB = new Date(b.fecha_creacion).getTime();
        return fechaB - fechaA;
      });
      setCursos(cursosOrdenados);
      setSuccess('Curso creado exitosamente');
      setNuevoCurso({ codigo: '', titulo: '', descripcion: '', docente_id: '', editor_id: '' });
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

  const handleEstadoChange = async (cursoId: number, activo: boolean) => {
    try {
      await fetchJSON<Curso>(`${baseApi}/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: activo }),
      });
      // Recargar todos los cursos para obtener el estado actualizado de todos
      const cursosData = await fetchJSON<Curso[]>(`${baseApi}/cursos`);
      const cursosOrdenados = [...cursosData].sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion).getTime();
        const fechaB = new Date(b.fecha_creacion).getTime();
        return fechaB - fechaA;
      });
      setCursos(cursosOrdenados);
      setSuccess('Estado del curso actualizado');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el estado');
    }
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
    <div className="min-h-screen" style={{ 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#f7fafc'
    }}>
      {/* Header con info del usuario */}
      <div className="p-6" style={{ 
        background: 'linear-gradient(180deg, #6ba3e0 0%, #7fc27a 100%)',
        color: '#fff'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#fff' }}>Hola, {fullName || 'Usuario'}</h1>
              <p className="text-xl mb-1" style={{ color: '#fff' }}>
                Rol: <span className="font-semibold capitalize" style={{ color: '#fff' }}>{usuario.tipo}</span>
              </p>
              <p className="text-md" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Bienvenido a tu panel</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold transition-all border"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Navegación para admin */}
      <div className="border-b shadow-sm" style={{ 
        backgroundColor: '#fff',
        borderBottomColor: '#e2e8f0'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 font-semibold transition-all rounded-lg"
              style={{ 
                color: '#4a5568',
                backgroundColor: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#2b6bd1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4a5568';
              }}
            >
              GESTIONAR USUARIOS
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 font-semibold transition-all rounded-lg"
              style={{ 
                color: '#4a5568',
                backgroundColor: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#2b6bd1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4a5568';
              }}
            >
              GESTIONAR CURSOS
            </button>
            <button
              className="px-4 py-2 font-semibold transition-all rounded-lg"
              style={{ 
                color: '#4a5568',
                backgroundColor: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#2b6bd1';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4a5568';
              }}
            >
              REPORTES
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="p-3 rounded-lg mb-5 text-sm" style={{ 
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-lg mb-5 text-sm" style={{ 
              color: '#059669',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}

          {loading && (
            <div className="text-sm mb-5" style={{ color: '#718096' }}>Cargando...</div>
          )}

          {/* Botón para crear curso */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: '#2b6bd1',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1e40af';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2b6bd1';
              }}
            >
              {showCreateForm ? 'Cancelar' : '+ Crear Nuevo Curso'}
            </button>
          </div>

          {/* Formulario de creación */}
          {showCreateForm && (
            <div className="p-6 rounded-lg mb-6" style={{ 
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0'
            }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#1a202c' }}>Crear Nuevo Curso</h3>
              <form onSubmit={handleCreateCurso}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                      Código del Curso *
                    </label>
                    <input
                      type="text"
                      name="codigo"
                      value={nuevoCurso.codigo}
                      onChange={handleInputChange}
                      placeholder="Ej: MAT101, PROG201"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        borderColor: '#e2e8f0',
                        color: '#4a5568'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                      Asignar Docente
                    </label>
                    <select
                      name="docente_id"
                      value={nuevoCurso.docente_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        borderColor: '#e2e8f0',
                        color: '#4a5568'
                      }}
                    >
                      <option value="">Seleccionar docente (opcional) - {docentes.length} disponibles</option>
                      {docentes.map(docente => (
                        <option key={docente.id_usuario} value={docente.id_usuario}>
                          {docente.nombre} {docente.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Selector de Editor */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                      Asignar Editor
                    </label>
                    <select
                      name="editor_id"
                      value={nuevoCurso.editor_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        borderColor: '#e2e8f0',
                        color: '#4a5568'
                      }}
                    >
                      <option value="">Seleccionar editor (opcional) - {editores.length} disponibles</option>
                      {editores.map(editor => (
                        <option key={editor.id_usuario} value={editor.id_usuario}>
                          {editor.nombre} {editor.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                    Título del Curso
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={nuevoCurso.titulo}
                    onChange={handleInputChange}
                    placeholder="Ej: Matemáticas Básicas"
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      borderColor: '#e2e8f0',
                      color: '#4a5568'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={nuevoCurso.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción del curso..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{
                      borderColor: '#e2e8f0',
                      color: '#4a5568'
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 rounded-lg font-semibold transition-colors"
                    style={{
                      backgroundColor: '#2b6bd1',
                      color: '#fff',
                      border: 'none',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      opacity: creating ? 0.5 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!creating) {
                        e.currentTarget.style.backgroundColor = '#1e40af';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!creating) {
                        e.currentTarget.style.backgroundColor = '#2b6bd1';
                      }
                    }}
                  >
                    {creating ? 'Creando...' : 'Crear Curso'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 rounded-lg font-semibold transition-colors"
                    style={{
                      backgroundColor: '#718096',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#4a5568';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#718096';
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de cursos como cards */}
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Cursos Existentes</h2>
            {cursos.length === 0 ? (
              <p style={{ color: '#718096' }}>No hay cursos creados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cursos.map((curso, index) => {
                  const isInactive = !curso.activo;
                  const docente = docentes.find(d => d.id_usuario === curso.docente_id);
                  const esMasAntiguo = index === cursos.length - 1;
                  
                  const displayInfo = curso.activo 
                    ? { text: '✓ Activo', bg: 'bg-green-100', textC: 'text-green-700' }
                    : { text: '✗ Inactivo', bg: 'bg-gray-100', textC: 'text-gray-600' };

                  return (
                    <div
                      key={curso.id_curso}
                      className={`border rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
                        isInactive ? 'bg-gray-100 opacity-60' : 'bg-white cursor-pointer'
                      } ${esMasAntiguo ? 'border-2' : ''}`}
                      style={{
                        borderColor: esMasAntiguo ? '#2b6bd1' : '#e2e8f0'
                      }}
                      onClick={() => {
                        if (!isInactive) handleEditCurso(curso);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <div className="font-mono font-semibold text-lg" style={{ color: '#2b6bd1' }}>{curso.codigo}</div>
                          {esMasAntiguo && (
                            <div className="text-xs font-bold mt-1 px-2 py-1 rounded" style={{
                              color: '#1e40af',
                              backgroundColor: '#ebf8ff'
                            }}>
                              CURSO INICIAL
                            </div>
                          )}
                        </div>
                        <select
                          value={curso.activo ? 'activo' : 'inactivo'}
                          onChange={(e) => handleEstadoChange(curso.id_curso, e.target.value === 'activo')}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1 rounded text-xs font-semibold ${displayInfo.bg} ${displayInfo.textC}`}
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                      
                      <h3 className="font-bold mb-2" style={{ color: '#1a202c' }}>{curso.titulo || 'Sin título'}</h3>
                      
                      {curso.descripcion && (
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#718096' }}>{curso.descripcion}</p>
                      )}
                      
                      <div className="mb-3">
                        {docente ? (
                          <div className="text-sm">
                            <span style={{ color: '#718096' }}>Docente: </span>
                            <span style={{ color: '#059669', fontWeight: 500 }}>
                              {docente.nombre} {docente.apellido}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: '#a0aec0' }}>Sin docente asignado</span>
                        )}
                      </div>

                      {!docente && (
                        <div onClick={(e) => e.stopPropagation()}>
                          {cursoEditar?.id_curso === curso.id_curso ? (
                            <div className="flex flex-col gap-2 mt-3">
                              <select
                                className="px-3 py-2 border rounded-lg text-sm"
                                style={{
                                  borderColor: '#e2e8f0',
                                  color: '#4a5568'
                                }}
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
                                className="text-xs text-left"
                                style={{ color: '#718096' }}
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
                                disabled={asignandoDocente === curso.id_curso || isInactive}
                                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3"
                                style={{
                                  backgroundColor: '#2b6bd1',
                                  color: '#fff',
                                  border: 'none',
                                  cursor: (asignandoDocente === curso.id_curso || isInactive) ? 'not-allowed' : 'pointer',
                                  opacity: (asignandoDocente === curso.id_curso || isInactive) ? 0.5 : 1
                                }}
                                onMouseOver={(e) => {
                                  if (!asignandoDocente && !isInactive) {
                                    e.currentTarget.style.backgroundColor = '#1e40af';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!asignandoDocente && !isInactive) {
                                    e.currentTarget.style.backgroundColor = '#2b6bd1';
                                  }
                                }}
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
                          disabled={asignandoDocente === curso.id_curso || isInactive}
                          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3"
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            cursor: (asignandoDocente === curso.id_curso || isInactive) ? 'not-allowed' : 'pointer',
                            opacity: (asignandoDocente === curso.id_curso || isInactive) ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (!asignandoDocente && !isInactive) {
                              e.currentTarget.style.backgroundColor = '#b91c1c';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!asignandoDocente && !isInactive) {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                            }
                          }}
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

      {/* Modal para editar curso */}
      {editingCurso && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" style={{ border: '2px solid #2b6bd1' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Editar Curso</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                  Código del Curso *
                </label>
                <input
                  type="text"
                  value={editForm.codigo}
                  onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                  Título del Curso
                </label>
                <input
                  type="text"
                  value={editForm.titulo}
                  onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                  Descripción
                </label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>
                  Asignar Docente
                </label>
                <select
                  value={editForm.docente_id}
                  onChange={(e) => setEditForm({ ...editForm, docente_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
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
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#2b6bd1',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2b6bd1';
                }}
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => {
                  setEditingCurso(null);
                  setEditForm({ codigo: '', titulo: '', descripcion: '', docente_id: '' });
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#718096',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4a5568';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#718096';
                }}
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