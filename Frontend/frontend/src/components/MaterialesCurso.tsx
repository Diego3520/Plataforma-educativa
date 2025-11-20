import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { io, Socket } from 'socket.io-client';

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

type Curso = {
  id_curso: number;
  codigo: string;
  titulo: string | null;
  descripcion: string | null;
};

type Topico = {
  id_topico: number;
  id_curso: number;
  orden: number;
  titulo: string | null;
  descripcion: string | null;
  activo: boolean;
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

// Función para extraer el ID del archivo de Drive
function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  

  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  

  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  
  match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  
  match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  
  return null;
}

function convertDriveUrl(url: string, contentType: string = 'video'): string | null {
  if (!url) return null;
  
  if (url.includes('/embed/') || url.includes('/preview')) return url;
  
  const fileId = extractDriveFileId(url);
  if (!fileId) return null;
  
  if (contentType === 'video' || contentType === 'imagen' || contentType === 'pdf') {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function isDriveLink(url: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

export default function MaterialesCurso() {
  const navigate = useNavigate();
  const { cursoId } = useParams<{ cursoId: string }>();
  const usuario = useMemo(() => {
    const usuarioRaw = authService.getUser();
    if (!usuarioRaw) return null;
    return {
      ...usuarioRaw,
      id_usuario: typeof usuarioRaw.id_usuario === 'string' 
        ? parseInt(usuarioRaw.id_usuario) 
        : usuarioRaw.id_usuario
    };
  }, []);

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioEditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (!usuario || !token) {
      navigate('/login');
      return;
    }

    if (!cursoId) {
      setError('ID de curso no proporcionado');
      setLoading(false);
      return;
    }

    // Conectar WebSocket
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    setSocket(newSocket);

    const loadData = async () => {
      try {
        setError(null);
        
        const cursoIdNum = parseInt(cursoId);
        
        // Cargar información del curso y tópicos
        const [cursoData, topicosData, materialesData] = await Promise.all([
          fetchJSON<Curso>(`${baseApi}/cursos/${cursoIdNum}`),
          fetchJSON<Topico[]>(`${baseApi}/topicos/curso/${cursoIdNum}`),
          fetchJSON<Material[]>(`${baseApi}/materiales/curso/${cursoIdNum}`)
        ]);
        
        setCurso(cursoData);
        setTopicos(topicosData.filter(t => t.activo));
        setMateriales(materialesData.filter(m => m.activo));

        // Unirse a las salas de todos los tópicos
        topicosData.forEach(topico => {
          if (topico.activo) {
            newSocket.emit('join-topico', topico.id_topico);
          }
        });

        // Cargar comentarios de todos los tópicos
        const comentariosPromises = topicosData
          .filter(t => t.activo)
          .map(t => fetchJSON<ComentarioEditor[]>(`${baseApi}/comentarios-editor/topico/${t.id_topico}`).catch(() => []));
        const comentariosArrays = await Promise.all(comentariosPromises);
        setComentarios(comentariosArrays.flat());
      } catch (e: any) {
        console.error('Error cargando datos:', e);
        setError(e.message || 'Error cargando materiales del curso');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [cursoId, usuario, navigate]);

  // Escuchar actualizaciones en tiempo real
  useEffect(() => {
    if (!socket) return;

    socket.on('nuevo-comentario', (comentario: ComentarioEditor) => {
      setComentarios(prev => {
        // Evitar duplicados
        if (prev.find(c => c.id_comentario === comentario.id_comentario)) {
          return prev;
        }
        return [comentario, ...prev];
      });
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

  // socket realtime para materiales
  useEffect(() => {
    if (!socket) return;
    socket.on('nuevo-material', (material) => {
      setMateriales(prev => {
        if (prev.find(m => m.material_id === material.material_id)) return prev;
        return [material, ...prev];
      });
    });
    // Puedes agregar material-actualizado/material-eliminado aquí de ser necesario
    return () => {
      socket.off('nuevo-material');
    };
  }, [socket]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!usuario) return null;

  const comentariosOrdenados = useMemo(() => (
    [...comentarios].sort((a, b) => new Date(b.creado_at).getTime() - new Date(a.creado_at).getTime())
  ), [comentarios]);

  const materialesOrdenados = useMemo(() => (
    [...materiales].sort((a, b) => new Date(b.creado_at).getTime() - new Date(a.creado_at).getTime())
  ), [materiales]);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-white/80 hover:text-white transition-colors text-sm underline"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-4xl font-bold mb-2">
                {curso?.titulo || 'Materiales del Curso'}
              </h1>
              {curso?.codigo && (
                <p className="text-lg mb-1">Código: {curso.codigo}</p>
              )}
              {curso?.descripcion && (
                <p className="text-sm text-white/80">{curso.descripcion}</p>
              )}
            </div>
            <button
              onClick={handleBack}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all border border-white/30 hover:border-white/50"
            >
              Volver
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
          
          {loading ? (
            <div className="text-gray-600 text-sm mb-5">Cargando materiales...</div>
          ) : comentariosOrdenados.length === 0 && materialesOrdenados.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No hay material ni comunicados disponibles para este curso.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Comunicados y material en la misma vista</h2>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-4">
                  <header className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Comunicados del editor</h3>
                      <p className="text-sm text-gray-500">Actualizaciones por tópico, anuncios y mensajes.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                      {comentariosOrdenados.length}
                    </span>
                  </header>
                  {comentariosOrdenados.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aún no hay comunicados nuevos.</p>
                  ) : (
                    <div className="space-y-4 overflow-hidden">
                      {comentariosOrdenados.map(elem => (
                        <article key={`comentario-${elem.id_comentario}`} className="border border-blue-100 rounded-lg p-4 bg-blue-50 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded text-xs font-semibold uppercase bg-blue-100 text-blue-700">
                                {elem.tipo}
                              </span>
                              {topicos.length > 0 && (
                                <span className="text-xs text-gray-600">
                                  {topicos.find(t => t.id_topico === elem.id_topico)?.titulo || ''}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(elem.creado_at).toLocaleString('es-ES')}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: elem.contenido }} />
                        </article>
                      ))}
                    </div>
                  )}
                </section>
                <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-4">
                  <header className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Material del docente</h3>
                      <p className="text-sm text-gray-500">Recursos subidos por el docente para el curso.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold uppercase bg-purple-50 text-purple-700 border border-purple-100">
                      {materialesOrdenados.length}
                    </span>
                  </header>
                  {materialesOrdenados.length === 0 ? (
                    <p className="text-gray-500 text-sm">Todavía no se ha subido material.</p>
                  ) : (
                    <div className="space-y-4">
                      {materialesOrdenados.map(elem => (
                        <article key={`material-${elem.material_id}`} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                              elem.content_type === 'pdf' ? 'bg-red-100 text-red-700' :
                              elem.content_type === 'video' ? 'bg-purple-100 text-purple-700' :
                              elem.content_type === 'imagen' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {elem.content_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(elem.creado_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          {elem.mime_type && (
                            <div className="text-gray-700 font-medium mb-3">{elem.mime_type}</div>
                          )}
                          {elem.ruta_archivo && isDriveLink(elem.ruta_archivo) && (
                            <div className="mb-4">
                              {elem.content_type === 'video' ? (
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                  <iframe
                                    src={convertDriveUrl(elem.ruta_archivo, elem.content_type) || elem.ruta_archivo}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title="Drive" style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%' }} />
                                </div>
                              ) : elem.content_type === 'pdf' ? (
                                <iframe
                                  src={convertDriveUrl(elem.ruta_archivo, elem.content_type) || elem.ruta_archivo}
                                  style={{ width: '100%', height: 320 }}
                                  title="PDF preview" />
                              ) : (
                                <img src={elem.ruta_archivo} alt="Material" className="rounded-lg" />
                              )}
                            </div>
                          )}
                          {/* Otros detalles del material pueden ir aquí */}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

