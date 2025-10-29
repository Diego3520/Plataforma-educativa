import { useEffect, useMemo, useState } from 'react';
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

  const handleChangeRole = async (u: Usuario, nextRole: Usuario['tipo']) => {
    try {
      setUpdatingUserId(u.id_usuario);
      await fetchJSON<Usuario>(`${baseApi}/usuarios/${u.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo: nextRole }),
      });
      setUsuarios(prev => prev.map(x => x.id_usuario === u.id_usuario ? { ...x, tipo: nextRole } : x));
    } catch (e: any) {
      setError(e.message || 'No se pudo actualizar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen font-sans">
      <div className="flex-[0_0_45%] bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 p-12 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
            Hola, {fullName || 'Usuario'}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-2">
            Rol: <span className="font-semibold capitalize">{usuario.tipo}</span>
          </p>
          <p className="text-white/70 text-sm mb-6">Bienvenido a tu panel</p>
          
          {usuario.tipo === 'admin' && (
            <button
              onClick={() => navigate('/gestion-cursos')}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all border border-white/30 hover:border-white/50"
            >
              GESTIONAR CURSOS
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white p-12 flex flex-col justify-start">
        <div className="max-w-3xl mx-auto w-full">
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
                    <li key={c.id_curso} className="p-4 border border-gray-200 rounded-lg">
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
                    <li key={c.id_curso} className="p-4 border border-gray-200 rounded-lg">
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
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Correo</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id_usuario} className="border-t">
                          <td className="p-3">{u.id_usuario}</td>
                          <td className="p-3">{u.nombre} {u.apellido}</td>
                          <td className="p-3">{u.correo || '-'}</td>
                          <td className="p-3 capitalize">{u.tipo}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                                disabled={updatingUserId === u.id_usuario || u.tipo === 'docente'}
                                onClick={() => handleChangeRole(u, 'docente')}
                              >
                                {updatingUserId === u.id_usuario ? 'Actualizando...' : 'Hacer Docente'}
                              </button>
                              <button
                                className="py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                                disabled={updatingUserId === u.id_usuario || u.tipo === 'alumno'}
                                onClick={() => handleChangeRole(u, 'alumno')}
                              >
                                {updatingUserId === u.id_usuario ? 'Actualizando...' : 'Hacer Alumno'}
                              </button>
                              <button
                                className="py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                                disabled={updatingUserId === u.id_usuario || u.tipo === 'admin'}
                                onClick={() => handleChangeRole(u, 'admin')}
                              >
                                {updatingUserId === u.id_usuario ? 'Actualizando...' : 'Hacer Admin'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


