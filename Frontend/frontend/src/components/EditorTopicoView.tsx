import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { io, Socket } from 'socket.io-client';

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin';
  correo?: string | null;
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

type Curso = {
  id_curso: number;
  codigo: string;
  titulo: string | null;
  descripcion: string | null;
  editor_id: number | null;
};

type ComentarioEditor = {
  id_comentario: number;
  id_topico: number;
  id_editor: number;
  contenido: string;
  tipo: 'comentario' | 'contenido' | 'material';
  material_id: number | null;
  activo: boolean;
  creado_at: string;
  actualizado_at: string | null;
};

type Material = {
  material_id: number;
  solucion_modelo: string | null;
  ruta_archivo: string | null;
  content_type: 'pdf' | 'video' | 'imagen' | 'otro';
  id_curso: number;
};

const baseApi = 'http://localhost:5000/api';
const socketUrl = 'http://localhost:5000';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function EditorTopicoView() {
  const navigate = useNavigate();
  const { topicoId } = useParams<{ topicoId: string }>();
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

  const [topico, setTopico] = useState<Topico | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioEditor[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Estados del formulario
  const [contenido, setContenido] = useState('');
  const [tipoComentario, setTipoComentario] = useState<'comentario' | 'contenido' | 'material'>('comentario');
  const [materialSeleccionado, setMaterialSeleccionado] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token) {
      navigate('/login');
      return;
    }

    if (usuario.tipo !== 'editor') {
      navigate('/dashboard');
      return;
    }

    if (!topicoId) {
      setError('ID de tópico no proporcionado');
      setLoading(false);
      return;
    }

    // Conectar WebSocket
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
      // Unirse a la sala del tópico
      newSocket.emit('join-topico', parseInt(topicoId));
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    newSocket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    setSocket(newSocket);

    const loadData = async () => {
      try {
        setError(null);
        
        const topicoIdNum = parseInt(topicoId);
        const [topicoData, comentariosData] = await Promise.all([
          fetchJSON<Topico>(`${baseApi}/topicos/${topicoIdNum}`),
          fetchJSON<ComentarioEditor[]>(`${baseApi}/comentarios-editor/topico/${topicoIdNum}`)
        ]);

        setTopico(topicoData);
        setComentarios(comentariosData);

        // Cargar curso
        const cursoData = await fetchJSON<Curso>(`${baseApi}/cursos/${topicoData.id_curso}`);
        setCurso(cursoData);

        // Cargar materiales del curso
        const materialesData = await fetchJSON<Material[]>(`${baseApi}/materiales/curso/${topicoData.id_curso}`);
        setMateriales(materialesData.filter(m => m.activo));
      } catch (e: any) {
        console.error('Error cargando datos:', e);
        setError(e.message || 'Error cargando datos del tópico');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (newSocket) {
        newSocket.emit('leave-topico', parseInt(topicoId));
        newSocket.disconnect();
      }
    };
  }, [topicoId, usuario, navigate]);

  // Escuchar actualizaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on('nuevo-comentario', (comentario: ComentarioEditor) => {
      setComentarios(prev => [comentario, ...prev]);
    });

    socket.on('comentario-actualizado', (comentario: ComentarioEditor) => {
      setComentarios(prev => prev.map(c => 
        c.id_comentario === comentario.id_comentario ? comentario : c
      ));
    });

    socket.on('comentario-eliminado', (data: { id_comentario: number }) => {
      setComentarios(prev => prev.filter(c => c.id_comentario !== data.id_comentario));
    });

    return () => {
      socket.off('nuevo-comentario');
      socket.off('comentario-actualizado');
      socket.off('comentario-eliminado');
    };
  }, [socket]);

  const handlePublicar = async () => {
    if (!contenido.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    if (!usuario || !topico) {
      setError('Datos de usuario o tópico no encontrados');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (socket) {
        socket.emit('publicar-comentario', {
          id_topico: topico.id_topico,
          id_editor: usuario.id_usuario,
          contenido: contenido.trim(),
          tipo: tipoComentario,
          material_id: materialSeleccionado ? parseInt(materialSeleccionado) : null
        });
      } else {
        // Fallback a HTTP si WebSocket no está disponible
        await fetchJSON<ComentarioEditor>(`${baseApi}/comentarios-editor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({
            id_topico: topico.id_topico,
            id_editor: usuario.id_usuario,
            contenido: contenido.trim(),
            tipo: tipoComentario,
            material_id: materialSeleccionado ? parseInt(materialSeleccionado) : null,
            activo: true
          })
        });
        
        // Recargar comentarios
        const comentariosData = await fetchJSON<ComentarioEditor[]>(`${baseApi}/comentarios-editor/topico/${topico.id_topico}`);
        setComentarios(comentariosData);
      }

      setContenido('');
      setMaterialSeleccionado('');
      setTipoComentario('comentario');
      setSuccess('Contenido publicado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      console.error('Error publicando:', e);
      setError(e.message || 'Error al publicar contenido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    if (!topico || !socket) return;

    try {
      socket.emit('eliminar-comentario', {
        id_comentario: id,
        id_topico: topico.id_topico
      });
    } catch (e: any) {
      setError(e.message || 'Error al eliminar comentario');
    }
  };

  if (!usuario) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!topico) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Tópico no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="mb-4 text-white/80 hover:text-white transition-colors text-sm underline"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-4xl font-bold mb-2">
                {topico.titulo || `Tópico ${topico.orden}`}
              </h1>
              {curso && (
                <p className="text-lg mb-1">Curso: {curso.titulo || curso.codigo}</p>
              )}
              {topico.descripcion && (
                <p className="text-sm text-white/80 mt-2">{topico.descripcion}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{socket?.connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
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

          {/* Formulario para publicar */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Publicar Contenido o Comentario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo</label>
                <select
                  value={tipoComentario}
                  onChange={(e) => setTipoComentario(e.target.value as 'comentario' | 'contenido' | 'material')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="comentario">Comentario</option>
                  <option value="contenido">Contenido</option>
                  <option value="material">Material</option>
                </select>
              </div>

              {tipoComentario === 'material' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Material Asociado</label>
                  <select
                    value={materialSeleccionado}
                    onChange={(e) => setMaterialSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar material (opcional)</option>
                    {materiales.map(m => (
                      <option key={m.material_id} value={m.material_id}>
                        {m.content_type} - Material {m.material_id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Contenido</label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Escribe tu comentario o contenido aquí..."
                  rows={6}
                />
              </div>

              <button
                onClick={handlePublicar}
                disabled={submitting || !contenido.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>

          {/* Lista de comentarios */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comentarios y Contenido Publicado</h2>
            {comentarios.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No hay comentarios aún.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comentarios.map(c => (
                  <div key={c.id_comentario} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                          c.tipo === 'comentario' ? 'bg-blue-100 text-blue-700' :
                          c.tipo === 'contenido' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {c.tipo}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(c.creado_at).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEliminar(c.id_comentario)}
                        className="text-red-600 hover:text-red-800 text-sm underline"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: c.contenido }} />
                    {c.material_id && (
                      <div className="mt-3 text-sm text-gray-600">
                        Material asociado: {c.material_id}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

