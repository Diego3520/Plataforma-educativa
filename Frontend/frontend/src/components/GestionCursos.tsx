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

  if (!usuario || usuario.tipo !== 'admin') return null;

  return (
    <div className="flex min-h-screen font-sans">
      {/* Panel izquierdo oscuro */}
      <div className="flex-[0_0_45%] bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 p-12 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
            Gestión de Cursos
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-2">
            Administra los cursos y asigna docentes
          </p>
          <p className="text-white/70 text-sm mb-8">
            Bienvenido, {fullName}
          </p>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/90 text-sm inline-flex items-center gap-2 hover:text-white transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      {/* Panel derecho claro */}
      <div className="flex-1 bg-white p-12 flex flex-col justify-start">
        <div className="max-w-4xl mx-auto w-full">
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

          {/* Lista de cursos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursos Existentes</h2>
            {cursos.length === 0 ? (
              <p className="text-gray-600">No hay cursos creados.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Código</th>
                      <th className="text-left p-3">Título</th>
                      <th className="text-left p-3">Descripción</th>
                      <th className="text-left p-3">Docente Asignado</th>
                      <th className="text-left p-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map(curso => {
                      const docente = docentes.find(d => d.id_usuario === curso.docente_id);
                      return (
                        <tr key={curso.id_curso} className="border-t">
                          <td className="p-3 font-mono text-blue-600">{curso.codigo}</td>
                          <td className="p-3">{curso.titulo || '-'}</td>
                          <td className="p-3">{curso.descripcion || '-'}</td>
                          <td className="p-3">
                            {docente ? (
                              <span className="text-green-600 font-medium">
                                {docente.nombre} {docente.apellido}
                              </span>
                            ) : (
                              <span className="text-gray-400">Sin asignar</span>
                            )}
                          </td>
                          <td className="p-3">
                            {!curso.docente_id ? (
                              // Sin docente asignado: mostrar opción para asignar
                              cursoEditar?.id_curso === curso.id_curso ? (
                                <div className="flex flex-col gap-2">
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
                                    className="text-gray-600 text-xs hover:text-gray-800"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setCursoEditar(curso)}
                                  disabled={asignandoDocente === curso.id_curso}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                >
                                  Asignar Docente
                                </button>
                              )
                            ) : (
                              // Con docente asignado: mostrar botón X para quitar
                              <button
                                onClick={() => handleDesasignarDocente(curso.id_curso)}
                                disabled={asignandoDocente === curso.id_curso}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400"
                                title="Quitar docente"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
