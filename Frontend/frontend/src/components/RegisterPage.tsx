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

            setMessage(response.mensaje);
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
            setMessage(response.mensaje);
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('usuario', JSON.stringify(response.usuario));
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al verificar código');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
    };

    const handleMicrosoftRegister = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/microsoft`;
    };

    const handleReenviarCodigo = async () => {
        try {
            setError('');
            const response = await authService.reenviarCodigo(formData.correo);
            setMessage(response.mensaje);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al reenviar código');
        }
    };

    if (showVerification) {
        return (
            <div>
                <h2>Verificar Cuenta</h2>
                
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
                
                <p>
                    Hemos enviado un código de verificación a tu correo: <strong>{formData.correo}</strong>
                </p>

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
                        onClick={() => setShowVerification(false)}
                        style={{width: '100%', padding: '10px'}}
                    >
                        Volver al Registro
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h2>Crear Cuenta</h2>
            <p>Únete a la plataforma de aprendizaje</p>
            
            {error && (
                <div style={{color: 'red', marginBottom: '10px'}}>
                    {error}
                </div>
            )}

            <form onSubmit={handleManualRegister}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                    <div style={{flex: 1}}>
                        <label htmlFor="nombre">Nombre:</label><br/>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Tu nombre"
                            required
                            style={{width: '100%', padding: '5px', marginTop: '5px'}}
                        />
                    </div>
                    <div style={{flex: 1}}>
                        <label htmlFor="apellido">Apellido:</label><br/>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleInputChange}
                            placeholder="Tu apellido"
                            required
                            style={{width: '100%', padding: '5px', marginTop: '5px'}}
                        />
                    </div>
                </div>

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
                    <label htmlFor="tipo">Tipo de usuario:</label><br/>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        style={{width: '100%', padding: '5px', marginTop: '5px'}}
                    >
                        <option value="alumno">Alumno</option>

                    </select>
                </div>

                <div style={{marginBottom: '10px'}}>
                    <label htmlFor="password">Contraseña:</label><br/>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        style={{width: '100%', padding: '5px', marginTop: '5px'}}
                    />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <label htmlFor="confirmPassword">Confirmar contraseña:</label><br/>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repite tu contraseña"
                        required
                        minLength={6}
                        style={{width: '100%', padding: '5px', marginTop: '5px'}}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    {loading ? "Registrando..." : "Crear Cuenta"}
                </button>

                <hr style={{margin: '20px 0'}}/>
                <p>o registrarse con:</p>

                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    Registrarse con Google
                </button>

                <button
                    type="button"
                    onClick={handleMicrosoftRegister}
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                >
                    Registrarse con Microsoft
                </button>

                {onSwitchToLogin && (
                    <div>
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            style={{width: '100%', padding: '10px'}}
                        >
                            ¿Ya tienes cuenta? Inicia sesión
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default RegisterPage;
