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
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("usuario", JSON.stringify(data.usuario));
                
                // Mostrar mensaje de éxito
                setError(null);
                setLoading(false);
                setSuccess(true);
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, 1500);
            } else {
                setError(data.error || "Error de autenticación");
            }
        } catch (err) {
            setError("Error de red de autenticación");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
    };

    const handleMicrosoftLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/microsoft`;
    };

    return (
        <div>
            <h2>Iniciar Sesión</h2>
            
            {error && (
                <div style={{color: 'red', marginBottom: '10px'}}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{color: 'green', marginBottom: '10px'}}>
                    ¡Inicio de sesión exitoso! Redirigiendo...
                </div>
            )}

            <form onSubmit={handleSubmit} style={{opacity: success ? 0.6 : 1}}>
                <div style={{marginBottom: '10px'}}>
                    <label htmlFor="correo">Correo electrónico:</label><br/>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="tu@gmail.com"
                        required
                        style={{width: '100%', padding: '5px', marginTop: '5px'}}
                    />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <label htmlFor="password">Contraseña:</label><br/>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Tu contraseña"
                        required
                        style={{width: '100%', padding: '5px', marginTop: '5px'}}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    {loading ? "Iniciando sesión..." : success ? "Redirigiendo..." : "Iniciar Sesión"}
                </button>

                <hr style={{margin: '20px 0'}}/>
                <p>o continuar con:</p>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    Iniciar sesión con Google
                </button>

                <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    Iniciar sesión con Microsoft
                </button>

                {onSwitchToRegister && (
                    <div>
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            style={{width: '100%', padding: '10px'}}
                        >
                            ¿No tienes cuenta? Regístrate
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default LoginPage;
