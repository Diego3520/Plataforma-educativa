import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';

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

const baseApi = 'http://localhost:5000/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const loadData = async () => {
      try {
        setError(null);
        
        // Cargar información del curso
        const cursoData = await fetchJSON<Curso>(`${baseApi}/cursos/${cursoId}`);
        setCurso(cursoData);
        
        // Cargar materiales del curso
        const materialesData = await fetchJSON<Material[]>(`${baseApi}/materiales/curso/${cursoId}`);
        setMateriales(materialesData.filter(m => m.activo));
      } catch (e: any) {
        console.error('Error cargando datos:', e);
        setError(e.message || 'Error cargando materiales del curso');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cursoId, usuario, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!usuario) return null;

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
          ) : materiales.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No hay material disponible para este curso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Materiales</h2>
              {materiales.map(m => (
                <div key={m.material_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                      m.content_type === 'pdf' ? 'bg-red-100 text-red-700' :
                      m.content_type === 'video' ? 'bg-purple-100 text-purple-700' :
                      m.content_type === 'imagen' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {m.content_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(m.creado_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  {m.mime_type && (
                    <div className="text-gray-700 font-medium mb-3">{m.mime_type}</div>
                  )}
                  
                  {/* Mostrar contenido de Drive si es un link de Drive */}
                  {m.ruta_archivo && isDriveLink(m.ruta_archivo) && (
                    <div className="mb-4">
                      {m.content_type === 'video' ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={convertDriveUrl(m.ruta_archivo, m.content_type) || m.ruta_archivo}
                            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-300"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title={`Video ${m.material_id}`}
                            style={{ minHeight: '400px' }}
                          />
                        </div>
                      ) : m.content_type === 'imagen' ? (
                        <div className="w-full">
                          <img
                            src={convertDriveUrl(m.ruta_archivo, m.content_type) || m.ruta_archivo}
                            alt={m.mime_type || 'Imagen'}
                            className="w-full h-auto rounded-lg max-h-96 object-contain border border-gray-300"
                            onError={(e) => {
                              // Si falla la carga, mostrar el iframe como fallback
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('iframe') && m.ruta_archivo) {
                                const iframe = document.createElement('iframe');
                                iframe.src = convertDriveUrl(m.ruta_archivo, m.content_type) || m.ruta_archivo;
                                iframe.className = 'w-full h-96 rounded-lg border border-gray-300';
                                iframe.setAttribute('allowFullscreen', 'true');
                                parent.appendChild(iframe);
                              }
                            }}
                          />
                        </div>
                      ) : m.content_type === 'pdf' ? (
                        <div className="relative w-full" style={{ paddingBottom: '75%', minHeight: '600px' }}>
                          <iframe
                            src={convertDriveUrl(m.ruta_archivo, m.content_type) || m.ruta_archivo}
                            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-300"
                            title={`PDF ${m.material_id}`}
                          />
                        </div>
                      ) : (
                        // Para otros tipos (otro), intentar mostrar en iframe
                        <div className="relative w-full" style={{ paddingBottom: '56.25%', minHeight: '400px' }}>
                          <iframe
                            src={convertDriveUrl(m.ruta_archivo, m.content_type) || m.ruta_archivo}
                            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-300"
                            allowFullScreen
                            title={`Contenido ${m.material_id}`}
                          />
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <a 
                          href={m.ruta_archivo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Abrir en Drive →
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {m.ruta_archivo && !isDriveLink(m.ruta_archivo) && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">Archivo:</span>{' '}
                      <a 
                        href={m.ruta_archivo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {m.ruta_archivo}
                      </a>
                    </div>
                  )}
                  
                  {m.solucion_modelo && (
                    <div className="text-sm text-gray-700 mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <span className="font-semibold">Contenido:</span>
                      <div className="mt-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: m.solucion_modelo }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

