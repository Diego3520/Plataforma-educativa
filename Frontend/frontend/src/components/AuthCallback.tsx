import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'verification'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const providerParam = searchParams.get('provider');
    const nombreParam = searchParams.get('nombre');
    const tipoParam = searchParams.get('tipo');
    const idParam = searchParams.get('id');
    const needsVerification = searchParams.get('needs_verification');
    const errorParam = searchParams.get('error');
    
    console.log('AuthCallback - Parámetros recibidos:', {
      token: token ? 'presente' : 'ausente',
      email: emailParam,
      provider: providerParam,
      nombre: nombreParam,
      tipo: tipoParam,
      id: idParam,
      needsVerification,
      error: errorParam
    });
    
    if (errorParam) {
      setError('Error en la autenticación. Por favor, inténtalo de nuevo.');
      setStatus('error');
      return;
    }
    
    if (needsVerification === 'true' && emailParam) {
      setEmail(emailParam);
      setMessage(`Se ha enviado un código de verificación a ${emailParam}. Por favor, ingrésalo a continuación.`);
      setStatus('verification');
      return;
    }
    
    if (token) {
      // Guardar el token
      localStorage.setItem('token', token);
      
      // Crear objeto usuario con datos reales del backend
      if (nombreParam && tipoParam && idParam) {
        const nombreCompleto = decodeURIComponent(nombreParam);
        const partesNombre = nombreCompleto.split(' ');
        const usuarioReal = {
          id_usuario: parseInt(idParam),
          nombre: partesNombre[0] || 'Usuario',
          apellido: partesNombre.slice(1).join(' ') || '',
          correo: emailParam || '',
          tipo: tipoParam as 'docente' | 'alumno' | 'evaluador' | 'editor' | 'admin'
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioReal));
        console.log('Usuario OAuth guardado (real):', usuarioReal);
      }
      
      // Mostrar mensaje personalizado con el nombre del usuario
      const nombreUsuario = nombreParam ? decodeURIComponent(nombreParam) : 'Usuario';
      setMessage(`¡Bienvenido, ${nombreUsuario}! Has iniciado sesión exitosamente${providerParam ? ` con ${providerParam}` : ''}.`);
      setStatus('success');
      
      // Redirigir después de unos segundos
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } else {
      setError('No se recibió el token de autenticación. Por favor, inténtalo de nuevo.');
      setStatus('error');
    }
  }, [searchParams]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.verificarCodigo(verificationCode);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        
        // Mostrar mensaje personalizado con el nombre del usuario
        const nombreUsuario = response.usuario ? `${response.usuario.nombre} ${response.usuario.apellido}`.trim() : 'Usuario';
        setMessage(`¡Bienvenido, ${nombreUsuario}! ${response.mensaje}`);
        setStatus('success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        setMessage(response.mensaje);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    try {
      setError('');
      const response = await authService.reenviarCodigo(email);
      setMessage(response.mensaje);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al reenviar código');
    }
  };

  return (
    <div>
      {status === 'loading' && (
        <div>
          <h2>Procesando autenticación...</h2>
          <p>Por favor espera mientras completamos tu inicio de sesión.</p>
        </div>
      )}
      
      {status === 'verification' && (
        <div className="flex min-h-screen font-sans">
          {/* Panel izquierdo oscuro */}
          <div className="flex-[0_0_45%] bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-md">
              <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
                verifica tu cuenta
              </h1>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                hemos enviado un código de verificación a tu correo electrónico. ingresa el código para activar tu cuenta.
              </p>
              <a href="#" className="text-white/90 text-sm inline-flex items-center gap-2 hover:text-white transition-colors">
                ver lo que está incluido 
                <span className="text-lg">↓</span>
              </a>
            </div>
          </div>

          {/* Panel derecho claro */}
          <div className="flex-1 bg-white p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-right mb-8">
                <span className="text-gray-600 text-sm">
                  ¿ya tienes una cuenta? 
                </span>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-none border-none text-blue-600 font-medium cursor-pointer text-sm ml-1 hover:underline"
                >
                  inicia sesión
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                verificación
              </h2>
              <p className="text-gray-600 mb-8 text-sm">
                ¡completa tu registro!
              </p>

              {message && (
                <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg mb-5 text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-5 text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-600 mb-6 text-sm">
                Hemos enviado un código de verificación a tu correo: <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyCode}>
                <div className="mb-5">
                  <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                    código de verificación
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="introduce el código de 6 dígitos"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer mb-3 transition-all hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "verificando..." : "verificar código"}
                </button>

                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={loading}
                  className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer mb-3 transition-all hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  reenviar código
                </button>

                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3 bg-transparent text-gray-600 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-gray-50"
                >
                  volver al login
                </button>
              </form>

              <p className="text-gray-400 text-xs text-center mt-8 leading-relaxed">
                al crear una cuenta, aceptas nuestros{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  términos de servicio
                </a>{' '}
                y{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  política de privacidad
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <h2>¡Autenticación exitosa!</h2>
          <p style={{color: 'green'}}>{message}</p>
          <p>Serás redirigido automáticamente...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div>
          <h2>Error de autenticación</h2>
          <p style={{color: 'red'}}>{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{padding: '10px', marginTop: '10px'}}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
