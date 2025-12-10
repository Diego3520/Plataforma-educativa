import React, { useState } from 'react';
import { authService } from '../services/authService';

interface RegisterPageProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        confirmPassword: '',
        tipo: 'alumno'
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleManualRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.registroManual({
                nombre: formData.nombre,
                apellido: formData.apellido,
                correo: formData.correo,
                password: formData.password,
                tipo: formData.tipo
            });

            setMessage(response.mensaje || 'Código de verificación enviado');
            setShowVerification(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await authService.verificarCodigo(verificationCode);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('usuario', JSON.stringify(response.usuario));
                setMessage(response.mensaje || 'Cuenta verificada exitosamente');
                
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError(response.error || 'Error al verificar código');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al verificar código');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app'}/auth/google`;
    };

    const handleMicrosoftRegister = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app'}/auth/microsoft`;
    };

    const handleReenviarCodigo = async () => {
        setError('');
        setLoading(true);
        
        try {
            const response = await authService.reenviarCodigo(formData.correo);
            setMessage(response.mensaje || 'Código reenviado exitosamente');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al reenviar código');
        } finally {
            setLoading(false);
        }
    };

    // Estilos en línea para mantener todo en un archivo
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        leftPanel: {
            flex: '0 0 45%',
            background: 'linear-gradient(180deg, #6ba3e0 0%, #7fc27a 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            position: 'relative' as const,
            overflow: 'hidden',
        },
        backgroundEffect1: {
            position: 'absolute' as const,
            top: '5rem',
            left: '5rem',
            width: '16rem',
            height: '16rem',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            filter: 'blur(3rem)',
        },
        backgroundEffect2: {
            position: 'absolute' as const,
            bottom: '8rem',
            right: '5rem',
            width: '20rem',
            height: '20rem',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            filter: 'blur(3rem)',
        },
        leftContent: {
            position: 'relative' as const,
            zIndex: 10,
            maxWidth: '28rem',
        },
        title: {
            color: '#fff',
            fontSize: '3rem',
            fontWeight: 900,
            marginBottom: '1.5rem',
            lineHeight: 1.02,
        },
        subtitle: {
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
        },
        link: {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
        },
        rightPanel: {
            flex: 1,
            background: '#fff',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
        },
        rightContent: {
            maxWidth: '28rem',
            margin: '0 auto',
            width: '100%',
        },
        switchText: {
            textAlign: 'right' as const,
            marginBottom: '2rem',
            color: '#666',
            fontSize: '0.875rem',
        },
        switchButton: {
            background: 'none',
            border: 'none',
            color: '#2b6bd1',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginLeft: '0.25rem',
        },
        formTitle: {
            fontSize: '2.25rem',
            fontWeight: 900,
            color: '#2d3748',
            marginBottom: '0.5rem',
        },
        formSubtitle: {
            color: '#666',
            fontSize: '0.875rem',
            marginBottom: '2rem',
        },
        errorMessage: {
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
        },
        successMessage: {
            color: '#059669',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
        },
        socialButton: {
            width: '100%',
            padding: '0.75rem',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
        },
        googleIcon: {
            width: '1.25rem',
            height: '1.25rem',
            background: '#ea4335',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        microsoftIcon: {
            width: '1.25rem',
            height: '1.25rem',
            background: '#0078d4',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 'bold',
        },
        separator: {
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: '#9ca3af',
            fontSize: '0.75rem',
        },
        separatorLine: {
            flex: 1,
            height: '1px',
            background: '#e5e7eb',
        },
        separatorText: {
            padding: '0 1rem',
        },
        inputGroup: {
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1rem',
        },
        inputContainer: {
            flex: 1,
        },
        label: {
            display: 'block',
            color: '#374151',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
        },
        input: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s ease',
        },
        select: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
            background: '#fff',
            transition: 'all 0.2s ease',
        },
        primaryButton: {
            width: '100%',
            padding: '0.9rem',
            background: '#fff',
            color: '#2b6bd1',
            border: '1px solid',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1rem',
            boxShadow: '0 10px 24px rgba(27, 84, 255, 0.14)',
            transition: 'all 0.2s ease',
        },
        secondaryButton: {
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            color: '#666',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '0.75rem',
            transition: 'all 0.2s ease',
        },
    };

    // Breakpoints y estilos responsivos derivados
    const getViewportWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [viewportWidth, setViewportWidth] = useState(getViewportWidth());
    const isTablet = viewportWidth <= 1024;
    const isMobile = viewportWidth <= 768;

    React.useEffect(() => {
        const onResize = () => setViewportWidth(getViewportWidth());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const containerStyle = {
        ...styles.container,
        flexDirection: isMobile ? 'column' as const : 'row' as const,
    };

    const leftPanelStyle = {
        ...styles.leftPanel,
        flex: isMobile ? '0 0 auto' : styles.leftPanel.flex,
        padding: isMobile ? '2rem 1.5rem' : isTablet ? '2.5rem 2rem' : styles.leftPanel.padding,
    };

    const rightPanelStyle = {
        ...styles.rightPanel,
        padding: isMobile ? '2rem 1.5rem' : isTablet ? '2.5rem 2rem' : styles.rightPanel.padding,
    };

    const titleStyle = {
        ...styles.title,
        fontSize: isMobile ? '2rem' : isTablet ? '2.4rem' : styles.title.fontSize,
    };

    const subtitleStyle = {
        ...styles.subtitle,
        fontSize: isMobile ? '0.95rem' : isTablet ? '1rem' : styles.subtitle.fontSize,
    };

    const inputGroupStyle = isMobile
        ? { ...styles.inputGroup, flexDirection: 'column' as const, gap: '0.75rem' }
        : styles.inputGroup;

    if (showVerification) {
        return (
            <div style={containerStyle}>
                {/* Panel izquierdo */}
                <div style={leftPanelStyle}>
                    <div style={styles.backgroundEffect1}></div>
                    <div style={styles.backgroundEffect2}></div>
                    
                    <div style={styles.leftContent}>
                        <h1 style={titleStyle}>
                            Verifica tu cuenta
                        </h1>
                        <p style={subtitleStyle}>
                            Hemos enviado un código de verificación a tu correo electrónico. Ingresa el código para activar tu cuenta.
                        </p>
                        <a href="#" style={styles.link}>
                            ver lo que está incluido 
                            <span style={{ fontSize: '1.125rem' }}>↓</span>
                        </a>
                    </div>
                </div>

                {/* Panel derecho */}
                <div style={rightPanelStyle}>
                    <div style={styles.rightContent}>
                        <div style={styles.switchText}>
                            <span>¿Ya tienes una cuenta? </span>
                            <button 
                                onClick={onSwitchToLogin}
                                style={styles.switchButton}
                            >
                                Inicia Sesión
                            </button>
                        </div>

                        <h2 style={styles.formTitle}>
                            Verificación
                        </h2>
                        <p style={styles.formSubtitle}>
                            ¡Completa tu registro!
                        </p>

                        {message && (
                            <div style={styles.successMessage}>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div style={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <p style={{ ...styles.formSubtitle, marginBottom: '1.5rem' }}>
                            Hemos enviado un código de verificación a tu correo: <strong>{formData.correo}</strong>
                        </p>

                        <form onSubmit={handleVerifyCode}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={styles.label}>
                                    Código de verificación
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Introduce el código de 6 dígitos"
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.primaryButton,
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.filter = 'brightness(0.98)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.filter = 'none';
                                        e.currentTarget.style.transform = 'none';
                                    }
                                }}
                            >
                                {loading ? "verificando..." : "verificar código"}
                            </button>

                            <button
                                type="button"
                                onClick={handleReenviarCodigo}
                                disabled={loading}
                                style={{
                                    ...styles.secondaryButton,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = '#f9fafb';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                Reenviar código
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowVerification(false)}
                                style={styles.secondaryButton}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#f9fafb';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Volver al registro
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Panel izquierdo */}
            <div style={leftPanelStyle}>
                <div style={styles.backgroundEffect1}></div>
                <div style={styles.backgroundEffect2}></div>
                
                <div style={styles.leftContent}>
                    <h1 style={titleStyle}>
                        Crea tu cuenta gratuita
                    </h1>
                    <p style={subtitleStyle}>
                        Explora nuestros cursos y contenidos. Ideal para estudiantes y equipos.
                    </p>
                    <a href="#" style={styles.link}>
                        Ver lo que está incluido 
                        <span style={{ fontSize: '1.125rem' }}>↓</span>
                    </a>
                </div>
            </div>

            {/* Panel derecho */}
            <div style={rightPanelStyle}>
                <div style={styles.rightContent}>
                    <div style={styles.switchText}>
                        <span>¿Ya tienes una cuenta? </span>
                        <button 
                            onClick={onSwitchToLogin}
                            style={styles.switchButton}
                        >
                            Inicia sesión
                        </button>
                    </div>

                    <h2 style={styles.formTitle}>
                        Regístrate
                    </h2>
                    <p style={styles.formSubtitle}>
                        ¡Comienza tu viaje de aprendizaje!
                    </p>

                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Botones de redes sociales */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            style={styles.socialButton}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.borderColor = '#9ca3af';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                        >
                            <div style={styles.googleIcon}>
                                G
                            </div>
                            Continuar con Google
                        </button>

                        <button
                            type="button"
                            onClick={handleMicrosoftRegister}
                            style={styles.socialButton}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.borderColor = '#9ca3af';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#d1d5db';
                            }}
                        >
                            <div style={styles.microsoftIcon}>
                                M
                            </div>
                            Continuar con Microsoft
                        </button>
                    </div>

                    {/* Separador */}
                    <div style={styles.separator}>
                        <div style={styles.separatorLine}></div>
                        <span style={styles.separatorText}>o</span>
                        <div style={styles.separatorLine}></div>
                    </div>

                    {/* Formulario de registro */}
                    <form onSubmit={handleManualRegister}>
                        <div style={inputGroupStyle}>
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>
                                    nombres
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Introduce tu nombre"
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>
                                    apellidos
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    placeholder="Introduce tus apellidos"
                                    required
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={styles.label}>
                                correo
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                placeholder="Introduce tu correo electrónico"
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={styles.label}>
                                contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Introduce tu contraseña"
                                required
                                minLength={6}
                                style={styles.input}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={styles.label}>
                                confirmar contraseña
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirma tu contraseña"
                                required
                                minLength={6}
                                style={styles.input}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={styles.label}>
                                tipo de usuario
                            </label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                style={styles.select}
                            >
                                <option value="alumno">Alumno</option>
            
                            
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.primaryButton,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.filter = 'brightness(0.98)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }
                            }}
                        >
                            {loading ? "Registrando..." : "Registrar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;