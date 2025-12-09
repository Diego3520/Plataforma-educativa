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


const baseApi = 'https://straydogs-290096756800.southamerica-east1.run.app/api';

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
  const [loadingTopicos, setLoadingTopicos] = useState(true);

  useEffect(() => {
    const loadTopicos = async () => {
      try {
        const data = await fetchJSON<Topico[]>(`${baseApi}/topicos/curso/${cursoId}`);
        setTopicos(data.filter(t => t.activo));
      } catch (e: any) {
        console.error('Error cargando tópicos:', e);
        setTopicos([]);
      } finally {
        setLoadingTopicos(false);
      }
    };
    loadTopicos();
  }, [cursoId]);

  if (loadingTopicos) {
    return <div className="text-sm" style={{ color: '#718096' }}>Cargando tópicos...</div>;
  }

  if (topicos.length === 0) {
    return <div className="text-sm" style={{ color: '#718096' }}>No hay tópicos disponibles.</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3" style={{ color: '#2d3748' }}>Tópicos</h3>
      <div className="space-y-2">
        {topicos.map(t => (
          <button
            key={t.id_topico}
            onClick={() => navigate(`/topico/${t.id_topico}/editor`)}
            className="w-full text-left p-3 rounded-lg transition-colors"
            style={{
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ebf8ff';
              e.currentTarget.style.borderColor = '#90cdf4';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div className="font-medium" style={{ color: '#1a202c' }}>{t.titulo || `Tópico ${t.orden}`}</div>
            {t.descripcion && (
              <div className="text-sm mt-1" style={{ color: '#718096' }}>{t.descripcion}</div>
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

  const [showInscripcionModal, setShowInscripcionModal] = useState(false);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [submittingInscripcion, setSubmittingInscripcion] = useState(false);

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);
  const [selectedCursoIdForMaterial, setSelectedCursoIdForMaterial] = useState<number | null>(null);
  const [solucionModelo, setSolucionModelo] = useState('');
  const [rutaArchivo, setRutaArchivo] = useState('');
  const [descripcionMaterial, setDescripcionMaterial] = useState('');
  const [solucionModelFile, setSolucionModelFile] = useState<File | null>(null);
  const [solucionUploadError, setSolucionUploadError] = useState<string | null>(null);
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
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e.message || 'Error al inscribirse al curso');
    } finally {
      setSubmittingInscripcion(false);
    }
  };

  const handleSubirMaterial = async () => {
    if (!selectedCursoIdForMaterial) {
      setError('No se ha seleccionado un curso.');
      return;
    }

    if (!materialFile && !rutaArchivo.trim()) {
      setError('La ruta del archivo es obligatoria o debes seleccionar un archivo para cargar.');
      return;
    }

    setSubmittingMaterial(true);
    setError(null);
    setFileUploadError(null);
    setSolucionUploadError(null);

    let rutaFinal = rutaArchivo.trim();
    let tamanoBytes: number | null = null;
    let uploadMimeType: string | null = null;

    if (materialFile) {
      try {
        const uploaded = await uploadFileToServer(materialFile);
        const cloudUrl = uploaded.secure_url || uploaded.url;
        rutaFinal = cloudUrl || uploaded.local_path || rutaFinal;
        tamanoBytes = uploaded.bytes ?? uploaded.size ?? null;
        uploadMimeType = uploaded.mime_type ?? (uploaded.resource_type && uploaded.format ? `${uploaded.resource_type}/${uploaded.format}` : null);
        setRutaArchivo(rutaFinal);
      } catch (e: any) {
        setFileUploadError(e.message || 'Error al subir el archivo');
        setSubmittingMaterial(false);
        return;
      }
    }

    let solucionUrl: string | null = solucionModelo.trim() || null;
    if (solucionModelFile) {
      try {
        const uploadedSolution = await uploadFileToServer(solucionModelFile);
        solucionUrl = uploadedSolution.secure_url || uploadedSolution.url || uploadedSolution.local_path || solucionUrl;
        setSolucionModelo(solucionUrl || '');
      } catch (e: any) {
        setSolucionUploadError(e.message || 'Error al subir la solución modelo');
        setSubmittingMaterial(false);
        return;
      }
    }

    if (!rutaFinal) {
      setError('La ruta del archivo es obligatoria.');
      setSubmittingMaterial(false);
      return;
    }

    try {
      const payload = {
        id_curso: selectedCursoIdForMaterial,
        solucion_modelo: solucionUrl || null,
        ruta_archivo: rutaFinal,
        tamano_bytes: tamanoBytes,
        mime_type: descripcionMaterial.trim() || uploadMimeType || null,
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
      console.error('Error inscribiéndose:', e);
      setError(e.message || 'Error al inscribirse al curso');
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false);
    setSelectedCursoIdForMaterial(null);
    setSolucionModelo('');
    setRutaArchivo('');
    setMaterialFile(null);
    setFileUploadError(null);
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

  const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = authService.getToken();
    const res = await fetch(`${baseApi}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || 'No se pudo subir el archivo');
    }
    return res.json();
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
    <div className="min-h-screen" style={{ 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#f7fafc'
    }}>
      {/* Header con info del usuario */}
      <div className="p-6" style={{ 
        background: 'linear-gradient(135deg, #34d1eaff 0%, #33bb8aff 50%, #118076ff 100%)',
        color: '#f8fafc'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#f9fbff', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>Hola, {fullName || 'Usuario'}</h1>
              <p className="text-xl mb-1" style={{ color: '#f9fbff', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>
                Rol: <span className="font-semibold capitalize" style={{ color: '#f9fbff' }}>{usuario.tipo}</span>
              </p>
              <p className="text-md" style={{ color: '#e7f8ff', textShadow: '0 2px 10px rgba(0,0,0,0.35)' }}>Bienvenido a tu panel</p>
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
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Navegación para admin */}
      {usuario.tipo === 'admin' && (
        <div className="border-b shadow-sm" style={{ 
          backgroundColor: '#fff',
          borderBottomColor: '#e2e8f0'
        }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 font-semibold transition-colors"
                style={{ 
                  color: '#4a5568',
                  background: 'none',
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
                onClick={() => {
                  try {
                    navigate('/gestion-cursos');
                  } catch (e: any) {
                    console.error('Error navegando a gestion-cursos:', e);
                    setError('Error al acceder a la gestión de cursos');
                  }
                }}
                className="px-4 py-2 font-semibold transition-colors"
                style={{ 
                  color: '#4a5568',
                  background: 'none',
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
                className="px-4 py-2 font-semibold transition-colors"
                style={{ 
                  color: '#4a5568',
                  background: 'none',
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
      )}

      {/* Contenido principal */}
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="p-3 rounded-lg mb-5 text-sm" style={{ 
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}>{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-lg mb-5 text-sm" style={{ 
              color: '#059669',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0'
            }}>{success}</div>
          )}
          {loading && (
            <div className="text-sm mb-5" style={{ color: '#718096' }}>Cargando...</div>
          )}

          {usuario.tipo === 'alumno' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold" style={{ color: '#1a202c' }}>Mis Cursos</h2>
                <button
                  onClick={() => setShowInscripcionModal(true)}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-sm"
                  style={{
                    backgroundColor: '#2b6bd1',
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
                  Inscribirme a Curso
                </button>
              </div>
              {cursos.length === 0 ? (
                <p style={{ color: '#718096' }}>No se encontraron cursos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {cursos.map(c => (
                    <div
                      key={c.id_curso}
                      onClick={() => handleCursoClick(c.id_curso)}
                      className="p-5 border-2 rounded-lg shadow-sm transition-all cursor-pointer"
                      style={{
                        backgroundColor: '#fff',
                        borderColor: '#e2e8f0'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#90cdf4';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div className="text-sm font-mono mb-1" style={{ color: '#718096' }}>{c.codigo}</div>
                      <div className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>{c.titulo || 'Curso'}</div>
                      {c.descripcion && (
                        <div className="text-sm line-clamp-2" style={{ color: '#718096' }}>{c.descripcion}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {usuario.tipo === 'docente' && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Mis Cursos</h2>
              {cursos.length === 0 ? (
                <p style={{ color: '#718096' }}>No tienes cursos asignados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {cursos.map(c => (
                    <div 
                      key={c.id_curso}
                      className="p-5 border rounded-lg shadow-sm transition-shadow flex flex-col justify-between"
                      style={{
                        backgroundColor: '#fff',
                        borderColor: '#e2e8f0'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#90cdf4';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div>
                        <div className="text-sm font-mono" style={{ color: '#718096' }}>{c.codigo}</div>
                        <div className="text-lg font-semibold mt-1" style={{ color: '#2d3748' }}>{c.titulo || 'Curso'}</div>
                        {c.descripcion && <div className="text-sm mt-2 line-clamp-2 h-10" style={{ color: '#718096' }}>{c.descripcion}</div>}
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => navigate(`/curso/${c.id_curso}`)}
                          className="w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
                          style={{
                            color: '#2b6bd1',
                            backgroundColor: '#ebf8ff',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e2e8f0';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ebf8ff';
                          }}
                        >
                          Ver Curso
                        </button>
                        <button
                          onClick={() => openMaterialModal(c.id_curso)}
                          className="w-full text-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                          style={{
                            backgroundColor: '#2b6bd1',
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Cursos Disponibles</h2>
              {cursos.length === 0 ? (
                <p style={{ color: '#718096' }}>No hay cursos disponibles.</p>
              ) : (
                <div className="space-y-6">
                  {cursos.map(c => (
                    <div key={c.id_curso} className="border rounded-lg p-6" style={{
                      backgroundColor: '#fff',
                      borderColor: '#e2e8f0'
                    }}>
                      <div className="mb-4">
                        <div className="text-sm font-mono mb-1" style={{ color: '#718096' }}>{c.codigo}</div>
                        <div className="text-xl font-semibold mb-2" style={{ color: '#1a202c' }}>{c.titulo || 'Curso'}</div>
                        {c.descripcion && (
                          <div className="text-sm" style={{ color: '#718096' }}>{c.descripcion}</div>
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
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Usuarios</h2>
              {usuarios.length === 0 ? (
                <p style={{ color: '#718096' }}>No hay usuarios.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden" style={{
                  backgroundColor: '#fff',
                  borderColor: '#e2e8f0'
                }}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead style={{ backgroundColor: '#f7fafc' }}>
                        <tr>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>ID</th>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>Nombre</th>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>Correo</th>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>Rol</th>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>Estado</th>
                          <th className="text-left p-3" style={{ color: '#4a5568', fontWeight: 600 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map(u => (
                          <tr key={u.id_usuario} className="border-t" style={{ borderTopColor: '#f1f5f9' }}>
                            <td className="p-3" style={{ color: '#4a5568' }}>{u.id_usuario}</td>
                            <td className="p-3" style={{ color: '#4a5568' }}>{u.nombre} {u.apellido}</td>
                            <td className="p-3" style={{ color: '#4a5568' }}>{u.correo || '-'}</td>
                            <td className="p-3 capitalize" style={{ color: '#4a5568' }}>{u.tipo}</td>
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={u.activo ?? true}
                                onChange={() => openActiveModal(u, !u.activo)}
                                disabled={updatingUserId === u.id_usuario}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <span className="ml-2 text-sm" style={{ color: '#4a5568' }}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => openRoleModal(u)}
                                disabled={updatingUserId === u.id_usuario}
                                className="py-2 px-4 text-white rounded-lg font-medium disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                                style={{
                                  backgroundColor: '#2b6bd1',
                                  border: 'none',
                                  cursor: updatingUserId === u.id_usuario ? 'not-allowed' : 'pointer',
                                  opacity: updatingUserId === u.id_usuario ? 0.5 : 1
                                }}
                                onMouseOver={(e) => {
                                  if (updatingUserId !== u.id_usuario) {
                                    e.currentTarget.style.backgroundColor = '#1e40af';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (updatingUserId !== u.id_usuario) {
                                    e.currentTarget.style.backgroundColor = '#2b6bd1';
                                  }
                                }}
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
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5" style={{ color: '#1a202c' }}>Subir Material para el Curso</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="content_type" className="block text-sm font-semibold mb-1" style={{ color: '#4a5568' }}>
                  Tipo de Contenido <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <select
                  id="content_type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'pdf' | 'video' | 'imagen' | 'otro')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="imagen">Imagen</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="material_file" className="block text-base font-bold mb-2" style={{ color: '#2b6bd1' }}>
                  Archivo del Material (opcional)
                </label>
                <input
                  id="material_file"
                  type="file"
                  accept="application/pdf,video/*,audio/*,image/*,.zip"
                  onChange={(event) => {
                    setMaterialFile(event.target.files?.[0] || null);
                    setFileUploadError(null);
                    // Auto-detect content type
                    const file = event.target.files?.[0];
                    if (file) {
                      const extRaw = file.name.split('.').pop();
                      const ext = extRaw ? extRaw.toLowerCase() : '';
                      if (ext === 'pdf') setContentType('pdf');
                      else if (["mp4","avi","mov","mkv","webm"].includes(ext)) setContentType('video');
                      else if (["jpg","jpeg","png","gif","bmp","svg","webp"].includes(ext)) setContentType('imagen');
                      else setContentType('otro');
                    }
                  }}
                  className="w-full text-lg py-3 px-4 border-2 rounded-xl font-semibold focus:ring-2 focus:border-transparent cursor-pointer"
                  style={{ 
                    minHeight: '56px',
                    borderColor: '#2b6bd1',
                    backgroundColor: '#ebf8ff',
                    color: '#4a5568'
                  }}
                />
                {materialFile && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#4a5568' }}>Archivo seleccionado: {materialFile.name}</p>
                )}
                {fileUploadError && (
                  <p className="text-xs mt-2" style={{ color: '#e53e3e' }}>{fileUploadError}</p>
                )}
                <p className="text-xs mt-2 font-semibold" style={{ color: '#2b6bd1' }}>
                  Puedes seleccionar un archivo para subirlo y se completará la ruta automáticamente.
                </p>
              </div>

              <div>
                <label htmlFor="ruta_archivo" className="block text-sm font-semibold mb-1" style={{ color: '#4a5568' }}>
                  Ruta del Archivo <span className="text-xs" style={{ color: '#a0aec0' }}>(opcional)</span>
                </label>
                <input
                  id="ruta_archivo"
                  type="text"
                  value={rutaArchivo}
                  onChange={(e) => setRutaArchivo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                  placeholder="Ej: /documentos/clase1.pdf"
                />
                <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>
                  Este campo es opcional si subes un archivo, pero debe completarse si no lo haces.
                </p>
              </div>

              <div>
                <label htmlFor="descripcion_material" className="block text-sm font-semibold mb-1" style={{ color: '#4a5568' }}>
                  Descripción del Material <span className="text-xs" style={{ color: '#a0aec0' }}>(opcional)</span>
                </label>
                <textarea
                  id="descripcion_material"
                  value={descripcionMaterial}
                  onChange={(e) => setDescripcionMaterial(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                  placeholder="Ej: Material de introducción al curso"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="solucion_modelo" className="block text-sm font-semibold mb-1" style={{ color: '#4a5568' }}>
                  Solución Modelo <span className="text-xs" style={{ color: '#a0aec0' }}>(opcional)</span>
                </label>
                <input
                  id="solucion_modelo"
                  type="text"
                  value={solucionModelo}
                  onChange={(e) => setSolucionModelo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                  placeholder="Ej: /soluciones/ejercicio1.pdf"
                />
                <div className="mt-2">
                  <label htmlFor="solucion_modelo_file" className="block text-xs font-semibold mb-1" style={{ color: '#718096' }}>
                    También puedes cargar un archivo de solución (su URL sustituirá la ruta anterior)
                  </label>
                  <input
                    id="solucion_modelo_file"
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => {
                      setSolucionModelFile(event.target.files?.[0] || null);
                      setSolucionUploadError(null);
                    }}
                    className="w-full text-lg py-3 px-4 border-2 rounded-xl font-semibold focus:ring-2 focus:border-transparent cursor-pointer"
                    style={{ 
                      minHeight: '56px',
                      borderColor: '#2b6bd1',
                      backgroundColor: '#ebf8ff',
                      color: '#4a5568'
                    }}
                  />
                  {solucionModelFile && (
                    <p className="text-xs mt-2 font-semibold" style={{ color: '#4a5568' }}>Archivo de solución listo: {solucionModelFile.name}</p>
                  )}
                  {solucionUploadError && (
                    <p className="text-xs mt-2" style={{ color: '#e53e3e' }}>{solucionUploadError}</p>
                  )}
                </div>
              </div>

              {/* Sección de Tarea */}
              <div className="border-t pt-4 mt-4" style={{ borderTopColor: '#e2e8f0' }}>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={crearTarea}
                    onChange={(e) => setCrearTarea(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold" style={{ color: '#4a5568' }}>Crear tarea asociada</span>
                </label>

                {crearTarea && (
                  <div className="space-y-4 pl-6 border-l-2" style={{ borderLeftColor: '#90cdf4' }}>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Tópico</label>
                      <select
                        value={tareaIdTopico}
                        onChange={(e) => setTareaIdTopico(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                        style={{
                          borderColor: '#e2e8f0',
                          color: '#4a5568'
                        }}
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
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Fecha de Publicación</label>
                        <input
                          type="date"
                          value={tareaFechaPublicacion}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setTareaFechaPublicacion(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                          style={{
                            borderColor: '#e2e8f0',
                            color: '#4a5568'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Fecha Límite</label>
                        <input
                          type="date"
                          value={tareaFechaLimite}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setTareaFechaLimite(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                          style={{
                            borderColor: '#e2e8f0',
                            color: '#4a5568'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Material Asociado (Opcional)</label>
                      <select
                        value={tareaMaterialId}
                        onChange={(e) => setTareaMaterialId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                        style={{
                          borderColor: '#e2e8f0',
                          color: '#4a5568'
                        }}
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Nota Máxima</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tareaNotaMax}
                        onChange={(e) => setTareaNotaMax(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                        style={{
                          borderColor: '#e2e8f0',
                          color: '#4a5568'
                        }}
                        placeholder="Ej: 100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>Solución Aportada</label>
                      <textarea
                        value={tareaSolucionAportada}
                        onChange={(e) => setTareaSolucionAportada(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none"
                        style={{
                          borderColor: '#e2e8f0',
                          color: '#4a5568'
                        }}
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
                disabled={submittingMaterial || (!rutaArchivo.trim() && !materialFile)}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: '#2b6bd1',
                  border: 'none',
                  cursor: (submittingMaterial || (!rutaArchivo.trim() && !materialFile)) ? 'not-allowed' : 'pointer',
                  opacity: (submittingMaterial || (!rutaArchivo.trim() && !materialFile)) ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!submittingMaterial && (rutaArchivo.trim() || materialFile)) {
                    e.currentTarget.style.backgroundColor = '#1e40af';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submittingMaterial && (rutaArchivo.trim() || materialFile)) {
                    e.currentTarget.style.backgroundColor = '#2b6bd1';
                  }
                }}
              >
                {submittingMaterial ? 'Subiendo...' : crearTarea ? 'Subir Material y Crear Tarea' : 'Subir Material'}
              </button>
              <button
                onClick={closeMaterialModal}
                disabled={submittingMaterial}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#edf2f7',
                  color: '#2d3748',
                  border: '1px solid #e2e8f0',
                  cursor: submittingMaterial ? 'not-allowed' : 'pointer',
                  opacity: submittingMaterial ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar rol */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" style={{ border: '2px solid #2b6bd1' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1a202c' }}>Cambiar Tipo de Usuario</h3>
            <p className="mb-4" style={{ color: '#4a5568' }}>Usuario: <span className="font-semibold" style={{ color: '#1a202c' }}>{selectedUser.nombre} {selectedUser.apellido}</span></p>
            <select
              value={selectedNewRole || ''}
              onChange={(e) => setSelectedNewRole(e.target.value as Usuario['tipo'])}
              className="w-full p-3 border rounded-lg mb-4"
              style={{
                borderColor: '#e2e8f0',
                color: '#4a5568'
              }}
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
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#2b6bd1',
                  border: 'none',
                  cursor: !selectedNewRole ? 'not-allowed' : 'pointer',
                  opacity: !selectedNewRole ? 0.5 : 1
                }}
              >
                Cambiar
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setSelectedNewRole(null);
                }}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#718096',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para activar/desactivar */}
      {showActiveModal && selectedUser && selectedActiveState !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" style={{ border: '2px solid #2b6bd1' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1a202c' }}>¿Estás seguro?</h3>
            <p className="mb-4" style={{ color: '#4a5568' }}>
              ¿Deseas {selectedActiveState ? 'activar' : 'desactivar'} el usuario{' '}
              <span className="font-semibold" style={{ color: '#1a202c' }}>{selectedUser.nombre} {selectedUser.apellido}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleToggleActive}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#2b6bd1',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowActiveModal(false);
                  setSelectedUser(null);
                  setSelectedActiveState(null);
                }}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#718096',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para inscribirse a curso */}
      {showInscripcionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5" style={{ color: '#1a202c' }}>Inscribirme a un Curso</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="codigo_curso" className="block text-sm font-semibold mb-1" style={{ color: '#4a5568' }}>
                  Código del Curso <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  id="codigo_curso"
                  type="text"
                  value={codigoCurso}
                  onChange={(e) => setCodigoCurso(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#e2e8f0',
                    color: '#4a5568'
                  }}
                  placeholder="Ej: CURSO001"
                  required
                  disabled={submittingInscripcion}
                  autoFocus
                />
                <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>
                  Ingresa el código del curso al que deseas inscribirte
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleInscribirse}
                disabled={submittingInscripcion || !codigoCurso.trim()}
                className="flex-1 text-white px-4 py-2 rounded-lg font-medium disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: '#2b6bd1',
                  border: 'none',
                  cursor: (submittingInscripcion || !codigoCurso.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (submittingInscripcion || !codigoCurso.trim()) ? 0.5 : 1
                }}
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
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#edf2f7',
                  color: '#2d3748',
                  border: '1px solid #e2e8f0',
                  cursor: submittingInscripcion ? 'not-allowed' : 'pointer',
                  opacity: submittingInscripcion ? 0.5 : 1
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