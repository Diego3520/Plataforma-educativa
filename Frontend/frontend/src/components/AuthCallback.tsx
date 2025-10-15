import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'verification'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    const providerParam = searchParams.get('provider');
    const nombreParam = searchParams.get('nombre');
    const needsVerification = searchParams.get('needs_verification');
    const errorParam = searchParams.get('error');
    
    console.log('AuthCallback - Parámetros recibidos:', {
      token: token ? 'presente' : 'ausente',
      email: emailParam,
      provider: providerParam,
      nombre: nombreParam,
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
      setProvider(providerParam || 'OAuth');
      setMessage(`Se ha enviado un código de verificación a ${emailParam}. Por favor, ingrésalo a continuación.`);
      setStatus('verification');
      return;
    }
    
    if (token) {
      // Guardar el token
      localStorage.setItem('token', token);
      
      // Si tenemos el nombre del usuario, crear un objeto usuario básico
      if (nombreParam) {
        const nombreCompleto = decodeURIComponent(nombreParam);
        const partesNombre = nombreCompleto.split(' ');
        const usuarioBasico = {
          nombre: partesNombre[0] || 'Usuario',
          apellido: partesNombre.slice(1).join(' ') || '',
          correo: emailParam || '',
          tipo: 'alumno'
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioBasico));
        console.log('Usuario OAuth guardado:', usuarioBasico);
      }
      
      // Mostrar mensaje personalizado con el nombre del usuario
      const nombreUsuario = nombreParam ? decodeURIComponent(nombreParam) : 'Usuario';
      setMessage(`¡Bienvenido, ${nombreUsuario}! Has iniciado sesión exitosamente${providerParam ? ` con ${providerParam}` : ''}.`);
      setStatus('success');
      
      // Redirigir después de unos segundos
      setTimeout(() => {
        window.location.href = '/';
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
          window.location.href = '/';
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
        <div>
          <h2>Verificación de Cuenta</h2>
          
          {message && (
            <div style={{color: 'green', marginBottom: '10px'}}>
              {message}
            </div>
          )}
          {error && (
            <div style={{color: 'red', marginBottom: '10px'}}>
              {error}
            </div>
          )}
          
          <p>Registro exitoso con {provider}. Ahora necesitas verificar tu correo.</p>

          <form onSubmit={handleVerifyCode}>
            <div style={{marginBottom: '10px'}}>
              <label htmlFor="verificationCode">Código de verificación:</label><br/>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Ingresa el código de 6 dígitos"
                required
                style={{width: '100%', padding: '5px', marginTop: '5px'}}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{width: '100%', padding: '10px', marginBottom: '10px'}}
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>

            <button
              type="button"
              onClick={handleReenviarCodigo}
              style={{width: '100%', padding: '10px', marginBottom: '10px'}}
            >
              Reenviar Código
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              style={{width: '100%', padding: '10px'}}
            >
              Volver al Login
            </button>
          </form>
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