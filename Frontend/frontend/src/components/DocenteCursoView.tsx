import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  activo: boolean;
};

type Topico = {
  id_topico: number;
  id_curso: number;
  orden: number;
  titulo: string | null;
  descripcion: string | null;
  material_id: number | null;
  activo: boolean;
  creado_at: string;
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
};

type Tarea = {
  id_tarea: number;
  id_topico: number | null;
  fecha_publicacion: string;
  fecha_limite: string | null;
  material_id: number | null;
  nota_max: number | null;
  solucion_aportada: string | null;
  creado_at: string;
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function DocenteCursoView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const usuario = authService.getUser() as Usuario | null;
  const baseApi = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const [curso, setCurso] = useState<Curso | null>(null);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para modales y formularios
  const [showTopicoModal, setShowTopicoModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [editingTopico, setEditingTopico] = useState<Topico | null>(null);

  const [topicoForm, setTopicoForm] = useState({
    titulo: '',
    descripcion: '',
    orden: 1,
    activo: true
  });

  const [materialForm, setMaterialForm] = useState({
    solucion_modelo: '',
    ruta_archivo: '',
    content_type: 'otro' as 'pdf' | 'video' | 'imagen' | 'otro',
    activo: true,
    crearTarea: false,
    tarea_fecha_publicacion: new Date().toISOString().split('T')[0],
    tarea_fecha_limite: '',
    tarea_material_id: '',
    tarea_nota_max: '',
    tarea_solucion_aportada: '',
    tarea_id_topico: ''
  });

  const [tareaForm, setTareaForm] = useState({
    id_topico: '',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    nota_max: '',
    solucion_aportada: ''
  });

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token || usuario.tipo !== 'docente') {
      navigate('/dashboard');
      return;
    }

    if (!id) {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [id, usuario, navigate]);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const cursoId = parseInt(id!);
      const [cursoData, topicosData, materialesData] = await Promise.all([
        fetchJSON<Curso>(`${baseApi}/cursos/${cursoId}`),
        fetchJSON<Topico[]>(`${baseApi}/topicos/curso/${cursoId}`),
        fetchJSON<Material[]>(`${baseApi}/materiales`)
      ]);

      // Verificar que el docente es dueño del curso
      if (cursoData.docente_id !== usuario?.id_usuario) {
        setError('No tienes permiso para acceder a este curso');
        navigate('/dashboard');
        return;
      }

      setCurso(cursoData);
      setTopicos(topicosData.sort((a, b) => a.orden - b.orden));
      setMateriales(materialesData);

      // Cargar tareas para cada tópico
      const tareasPromises = topicosData.map(t => 
        fetchJSON<Tarea[]>(`${baseApi}/tareas/topico/${t.id_topico}`).catch(() => [])
      );
      const tareasArrays = await Promise.all(tareasPromises);
      setTareas(tareasArrays.flat());
    } catch (e: any) {
      setError(e.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopico = async () => {
    if (!curso) return;
    
    try {
      const nuevoTopico = await fetchJSON<Topico>(`${baseApi}/topicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_curso: curso.id_curso,
          orden: topicoForm.orden,
          titulo: topicoForm.titulo || null,
          descripcion: topicoForm.descripcion || null,
          activo: topicoForm.activo
        })
      });

      setTopicos(prev => [...prev, nuevoTopico].sort((a, b) => a.orden - b.orden));
      setShowTopicoModal(false);
      setTopicoForm({ titulo: '', descripcion: '', orden: topicos.length + 1, activo: true });
      setSuccess('Módulo creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      await loadData(); // Recargar datos para obtener tareas actualizadas
    } catch (e: any) {
      setError(e.message || 'Error creando módulo');
    }
  };

  const handleUpdateTopico = async () => {
    if (!editingTopico) return;
    
    try {
      const actualizado = await fetchJSON<Topico>(`${baseApi}/topicos/${editingTopico.id_topico}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: topicoForm.titulo || null,
          descripcion: topicoForm.descripcion || null,
          orden: topicoForm.orden,
          activo: topicoForm.activo
        })
      });

      setTopicos(prev => prev.map(t => t.id_topico === editingTopico.id_topico ? actualizado : t).sort((a, b) => a.orden - b.orden));
      setEditingTopico(null);
      setShowTopicoModal(false);
      setTopicoForm({ titulo: '', descripcion: '', orden: 1, activo: true });
      setSuccess('Módulo actualizado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error actualizando módulo');
    }
  };

  const handleDeleteTopico = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este módulo?')) return;
    
    try {
      await fetchJSON(`${baseApi}/topicos/${id}`, { method: 'DELETE' });
      setTopicos(prev => prev.filter(t => t.id_topico !== id));
      setSuccess('Módulo eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error eliminando módulo');
    }
  };

  const handleCreateMaterial = async () => {
    try {
      if (!curso) {
        setError('Curso no encontrado');
        return;
      }

      // Crear el material
      const nuevoMaterial = await fetchJSON<Material>(`${baseApi}/materiales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_curso: curso.id_curso,
          solucion_modelo: materialForm.solucion_modelo || null,
          ruta_archivo: materialForm.ruta_archivo || null,
          content_type: materialForm.content_type,
          activo: materialForm.activo
        })
      });

      setMateriales(prev => [...prev, nuevoMaterial]);

      // Si se marcó crear tarea, crear la tarea también
      if (materialForm.crearTarea) {
        const topicoId = materialForm.tarea_id_topico 
          ? parseInt(materialForm.tarea_id_topico)
          : (topicos.length > 0 ? topicos[0].id_topico : null);

        if (!topicoId) {
          setError('No hay tópicos disponibles para crear la tarea');
          return;
        }

        await fetchJSON<Tarea>(`${baseApi}/tareas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_topico: topicoId,
            fecha_publicacion: materialForm.tarea_fecha_publicacion,
            fecha_limite: materialForm.tarea_fecha_limite || null,
            material_id: materialForm.tarea_material_id ? parseInt(materialForm.tarea_material_id) : nuevoMaterial.material_id,
            nota_max: materialForm.tarea_nota_max ? parseFloat(materialForm.tarea_nota_max) : null,
            solucion_aportada: materialForm.tarea_solucion_aportada || null
          })
        });

        // Recargar tareas
        const tareasPromises = topicos.map(t => 
          fetchJSON<Tarea[]>(`${baseApi}/tareas/topico/${t.id_topico}`).catch(() => [])
        );
        const tareasArrays = await Promise.all(tareasPromises);
        setTareas(tareasArrays.flat());
      }

      setShowMaterialModal(false);
      setMaterialForm({ 
        solucion_modelo: '', 
        ruta_archivo: '',
        content_type: 'otro', 
        activo: true,
        crearTarea: false,
        tarea_fecha_publicacion: new Date().toISOString().split('T')[0],
        tarea_fecha_limite: '',
        tarea_material_id: '',
        tarea_nota_max: '',
        tarea_solucion_aportada: '',
        tarea_id_topico: ''
      });
      setSuccess(materialForm.crearTarea ? 'Material y tarea creados exitosamente' : 'Aviso/Contenido creado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error creando aviso/contenido');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este aviso/contenido?')) return;
    
    try {
      await fetchJSON(`${baseApi}/materiales/${id}`, { method: 'DELETE' });
      setMateriales(prev => prev.filter(m => m.material_id !== id));
      setSuccess('Aviso/Contenido eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error eliminando aviso/contenido');
    }
  };

  const handleCreateTarea = async () => {
    try {
      const nuevaTarea = await fetchJSON<Tarea>(`${baseApi}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_topico: tareaForm.id_topico ? parseInt(tareaForm.id_topico) : null,
          fecha_publicacion: tareaForm.fecha_publicacion,
          fecha_limite: tareaForm.fecha_limite || null,
          nota_max: tareaForm.nota_max ? parseFloat(tareaForm.nota_max) : null,
          solucion_aportada: tareaForm.solucion_aportada || null
        })
      });

      setTareas(prev => [...prev, nuevaTarea]);
      setShowTareaModal(false);
      setTareaForm({
        id_topico: '',
        fecha_publicacion: new Date().toISOString().split('T')[0],
        fecha_limite: '',
        nota_max: '',
        solucion_aportada: ''
      });
      setSuccess('Tarea creada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Error creando tarea');
    }
  };

  const openEditTopico = (topico: Topico) => {
    setEditingTopico(topico);
    setTopicoForm({
      titulo: topico.titulo || '',
      descripcion: topico.descripcion || '',
      orden: topico.orden,
      activo: topico.activo
    });
    setShowTopicoModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Curso no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="mb-4 text-white/80 hover:text-white text-sm"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-4xl font-bold mb-2">{curso.titulo || curso.codigo}</h1>
              <p className="text-lg mb-1">Código: <span className="font-mono">{curso.codigo}</span></p>
              {curso.descripcion && <p className="text-sm text-white/80 mt-2">{curso.descripcion}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setEditingTopico(null);
              setTopicoForm({ titulo: '', descripcion: '', orden: topicos.length + 1, activo: true });
              setShowTopicoModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            + Crear Módulo
          </button>
          <button
            onClick={() => {
              setMaterialForm({ solucion_modelo: '', content_type: 'otro', activo: true });
              setShowMaterialModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            + Crear Aviso/Contenido
          </button>
        </div>

        {/* Lista de Materiales (Avisos y Contenido) */}
        {materiales.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Avisos y Contenido</h2>
            <div className="space-y-3">
              {materiales.map(material => (
                <div key={material.material_id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        material.content_type === 'otro' ? 'bg-blue-100 text-blue-700' :
                        material.content_type === 'pdf' ? 'bg-red-100 text-red-700' :
                        material.content_type === 'video' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {material.content_type === 'otro' ? 'Aviso/Texto' : material.content_type.toUpperCase()}
                      </span>
                      {!material.activo && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMaterial(material.material_id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                  {material.solucion_modelo && (
                    <div 
                      className="text-gray-700 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: material.solucion_modelo }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Módulos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos del Curso</h2>
          {topicos.length === 0 ? (
            <p className="text-gray-600">No hay módulos creados. Crea tu primer módulo.</p>
          ) : (
            topicos.map(topico => {
              const topicoTareas = tareas.filter(t => t.id_topico === topico.id_topico);
              return (
                <div key={topico.id_topico} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold">
                          Módulo {topico.orden}
                        </span>
                        {!topico.activo && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {topico.titulo || 'Sin título'}
                      </h3>
                      {topico.descripcion && (
                        <div 
                          className="text-gray-700 mb-4 prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: topico.descripcion }}
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditTopico(topico)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTopico(topico.id_topico)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Tareas del módulo */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">Tareas</h4>
                      <button
                        onClick={() => {
                          setTareaForm({
                            ...tareaForm,
                            id_topico: topico.id_topico.toString()
                          });
                          setShowTareaModal(true);
                        }}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        + Añadir Tarea
                      </button>
                    </div>
                    {topicoTareas.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay tareas en este módulo</p>
                    ) : (
                      <ul className="space-y-2">
                        {topicoTareas.map(tarea => (
                          <li key={tarea.id_tarea} className="p-3 bg-gray-50 rounded border">
                            <div className="text-sm text-gray-600">
                              Publicación: {new Date(tarea.fecha_publicacion).toLocaleDateString()}
                              {tarea.fecha_limite && ` | Límite: ${new Date(tarea.fecha_limite).toLocaleDateString()}`}
                              {tarea.nota_max && ` | Nota máxima: ${tarea.nota_max}`}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para crear/editar módulo */}
      {showTopicoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingTopico ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título</label>
                <input
                  type="text"
                  value={topicoForm.titulo}
                  onChange={(e) => setTopicoForm({ ...topicoForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Introducción a la Programación"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Contenido (HTML)</label>
                <textarea
                  value={topicoForm.descripcion}
                  onChange={(e) => setTopicoForm({ ...topicoForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-64 font-mono text-sm"
                  placeholder="Escribe el contenido HTML aquí..."
                />
                <p className="text-xs text-gray-500 mt-1">Puedes usar HTML para formatear el contenido</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Orden</label>
                  <input
                    type="number"
                    value={topicoForm.orden}
                    onChange={(e) => setTopicoForm({ ...topicoForm, orden: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Estado</label>
                  <select
                    value={topicoForm.activo ? 'activo' : 'inactivo'}
                    onChange={(e) => setTopicoForm({ ...topicoForm, activo: e.target.value === 'activo' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTopico ? handleUpdateTopico : handleCreateTopico}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                {editingTopico ? 'Actualizar' : 'Crear'}
              </button>
              <button
                onClick={() => {
                  setShowTopicoModal(false);
                  setEditingTopico(null);
                  setTopicoForm({ titulo: '', descripcion: '', orden: 1, activo: true });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear material/aviso */}
      {showMaterialModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Crear Aviso o Contenido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Contenido</label>
                <select
                  value={materialForm.content_type}
                  onChange={(e) => setMaterialForm({ ...materialForm, content_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="otro">Aviso/Texto (HTML)</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="imagen">Imagen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ruta del Archivo (URL de Drive o ruta local)
                </label>
                <input
                  type="text"
                  value={materialForm.ruta_archivo}
                  onChange={(e) => setMaterialForm({ ...materialForm, ruta_archivo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: https://drive.google.com/file/d/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contenido {materialForm.content_type === 'otro' ? '(HTML permitido)' : ''}
                </label>
                <textarea
                  value={materialForm.solucion_modelo}
                  onChange={(e) => setMaterialForm({ ...materialForm, solucion_modelo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-48 font-mono text-sm"
                  placeholder={
                    materialForm.content_type === 'otro' 
                      ? 'Escribe tu aviso o contenido aquí. Puedes usar HTML para formatear el texto...\n\nEjemplo:\n<h2>Aviso Importante</h2>\n<p>Este es un aviso para todos los estudiantes.</p>'
                      : 'Escribe el contenido aquí...'
                  }
                />
                {materialForm.content_type === 'otro' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes usar etiquetas HTML como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={materialForm.activo}
                    onChange={(e) => setMaterialForm({ ...materialForm, activo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Activo (visible para estudiantes)</span>
                </label>
              </div>

              {/* Sección de Tarea */}
              <div className="border-t pt-4 mt-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={materialForm.crearTarea}
                    onChange={(e) => setMaterialForm({ ...materialForm, crearTarea: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Crear tarea asociada</span>
                </label>

                {materialForm.crearTarea && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tópico</label>
                      <select
                        value={materialForm.tarea_id_topico}
                        onChange={(e) => setMaterialForm({ ...materialForm, tarea_id_topico: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Seleccionar tópico (se usará el primero si no se selecciona)</option>
                        {topicos.map(t => (
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
                          value={materialForm.tarea_fecha_publicacion}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setMaterialForm({ ...materialForm, tarea_fecha_publicacion: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Fecha Límite</label>
                        <input
                          type="date"
                          value={materialForm.tarea_fecha_limite}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setMaterialForm({ ...materialForm, tarea_fecha_limite: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Material Asociado (Opcional)</label>
                      <select
                        value={materialForm.tarea_material_id}
                        onChange={(e) => setMaterialForm({ ...materialForm, tarea_material_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Ninguno (se usará el material actual si no se selecciona)</option>
                        {materiales.filter(m => m.id_curso === curso?.id_curso).map(m => (
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
                        value={materialForm.tarea_nota_max}
                        onChange={(e) => setMaterialForm({ ...materialForm, tarea_nota_max: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ej: 100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Solución Aportada</label>
                      <textarea
                        value={materialForm.tarea_solucion_aportada}
                        onChange={(e) => setMaterialForm({ ...materialForm, tarea_solucion_aportada: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg h-32"
                        placeholder="Descripción o solución modelo de la tarea..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateMaterial}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Crear {materialForm.crearTarea ? 'Material y Tarea' : 'Aviso/Contenido'}
              </button>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setMaterialForm({ 
                    solucion_modelo: '', 
                    ruta_archivo: '',
                    content_type: 'otro', 
                    activo: true,
                    crearTarea: false,
                    tarea_fecha_publicacion: new Date().toISOString().split('T')[0],
                    tarea_fecha_limite: '',
                    tarea_material_id: '',
                    tarea_nota_max: '',
                    tarea_solucion_aportada: '',
                    tarea_id_topico: ''
                  });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear tarea */}
      {showTareaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Crear Tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Módulo</label>
                <select
                  value={tareaForm.id_topico}
                  onChange={(e) => setTareaForm({ ...tareaForm, id_topico: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar módulo</option>
                  {topicos.map(t => (
                    <option key={t.id_topico} value={t.id_topico}>
                      Módulo {t.orden}: {t.titulo || 'Sin título'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Fecha de Publicación</label>
                  <input
                    type="date"
                    value={tareaForm.fecha_publicacion}
                    onChange={(e) => setTareaForm({ ...tareaForm, fecha_publicacion: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Fecha Límite</label>
                  <input
                    type="date"
                    value={tareaForm.fecha_limite}
                    onChange={(e) => setTareaForm({ ...tareaForm, fecha_limite: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nota Máxima</label>
                <input
                  type="number"
                  value={tareaForm.nota_max}
                  onChange={(e) => setTareaForm({ ...tareaForm, nota_max: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.1"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Solución Aportada</label>
                <textarea
                  value={tareaForm.solucion_aportada}
                  onChange={(e) => setTareaForm({ ...tareaForm, solucion_aportada: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="Descripción de la solución..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTarea}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowTareaModal(false);
                  setTareaForm({
                    id_topico: '',
                    fecha_publicacion: new Date().toISOString().split('T')[0],
                    fecha_limite: '',
                    nota_max: '',
                    solucion_aportada: ''
                  });
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
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

