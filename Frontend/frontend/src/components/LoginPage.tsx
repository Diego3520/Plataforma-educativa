import React, { useState } from 'react';

interface LoginPageProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        correo: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://straydogs-290096756800.southamerica-east1.run.app/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                // Guardar token y usuario en localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("usuario", JSON.stringify(data.usuario));
                
                // Mostrar mensaje de éxito
                setSuccess(true);
                setError(null);
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, 1500);
            } else {
                setError(data.error || "Error de autenticación");
                setLoading(false);
            }
        } catch (err) {
            setError("Error de red de autenticación");
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app'}/auth/google`;
    };

    const handleMicrosoftLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'https://plataforma-educativa-production-12c8.up.railway.app'}/auth/microsoft`;
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
        inputContainer: {
            marginBottom: '1rem',
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
    };

    return (
        <div style={styles.container}>
            {/* Panel izquierdo */}
            <div style={styles.leftPanel}>
                <div style={styles.backgroundEffect1}></div>
                <div style={styles.backgroundEffect2}></div>
                
                <div style={styles.leftContent}>
                    <h1 style={styles.title}>
                        Bienvenido de vuelta
                    </h1>
                    <p style={styles.subtitle}>
                        Inicia sesión para continuar tu aprendizaje y acceder a todos los recursos.
                    </p>
                    <a href="#" style={styles.link}>
                        Ver lo que está incluido 
                        <span style={{ fontSize: '1.125rem' }}>↓</span>
                    </a>
                </div>
            </div>

            {/* Panel derecho */}
            <div style={styles.rightPanel}>
                <div style={styles.rightContent}>
                    <div style={styles.switchText}>
                        <span>¿No tienes una cuenta? </span>
                        <button 
                            onClick={onSwitchToRegister}
                            style={styles.switchButton}
                        >
                            Regístrate
                        </button>
                    </div>

                    <h2 style={styles.formTitle}>
                        Inicia sesión
                    </h2>
                    <p style={styles.formSubtitle}>
                        ¡Continúa tu viaje de aprendizaje!
                    </p>

                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={styles.successMessage}>
                            ¡Inicio de sesión exitoso! Redirigiendo...
                        </div>
                    )}

                    {/* Botones de redes sociales */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
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
                            onClick={handleMicrosoftLogin}
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

                    {/* Formulario de login */}
                    <form onSubmit={handleSubmit} style={{ opacity: success ? 0.6 : 1 }}>
                        <div style={styles.inputContainer}>
                            <label style={styles.label}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                placeholder="Introduce tu correo electrónico"
                                required
                                disabled={loading || success}
                                style={{
                                    ...styles.input,
                                    background: (loading || success) ? '#f9fafb' : '#fff',
                                    cursor: (loading || success) ? 'not-allowed' : 'text',
                                }}
                                onFocus={(e) => {
                                    if (!loading && !success) {
                                        e.target.style.borderColor = '#2b6bd1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(43, 107, 209, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
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
                                disabled={loading || success}
                                style={{
                                    ...styles.input,
                                    background: (loading || success) ? '#f9fafb' : '#fff',
                                    cursor: (loading || success) ? 'not-allowed' : 'text',
                                }}
                                onFocus={(e) => {
                                    if (!loading && !success) {
                                        e.target.style.borderColor = '#2b6bd1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(43, 107, 209, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            style={{
                                ...styles.primaryButton,
                                opacity: (loading || success) ? 0.6 : 1,
                                cursor: (loading || success) ? 'not-allowed' : 'pointer',
                            }}
                            onMouseOver={(e) => {
                                if (!loading && !success) {
                                    e.currentTarget.style.filter = 'brightness(0.98)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading && !success) {
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }
                            }}
                        >
                            {loading ? "Iniciando sesión..." : success ? "Redirigiendo..." : "Iniciar sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;