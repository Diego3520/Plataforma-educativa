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

    if (showVerification) {
        return (
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
                                onClick={onSwitchToLogin}
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
                            Hemos enviado un código de verificación a tu correo: <strong>{formData.correo}</strong>
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
                                onClick={() => setShowVerification(false)}
                                className="w-full py-3 bg-transparent text-gray-600 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-gray-50"
                            >
                                volver al registro
                            </button>
                        </form>

                    
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen font-sans">
            {/* Panel izquierdo oscuro */}
            <div className="flex-[0_0_45%] bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Efectos de fondo */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-32 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
                        crea tu cuenta gratuita
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                        explora nuestros cursos y contenidos. ideal para estudiantes y equipos.
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
                            onClick={onSwitchToLogin}
                            className="bg-none border-none text-blue-600 font-medium cursor-pointer text-sm ml-1 hover:underline"
                        >
                            inicia sesión
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        regístrate
                    </h2>
                    <p className="text-gray-600 mb-8 text-sm">
                        ¡comienza tu viaje de aprendizaje!
                    </p>

                    {error && (
                        <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Botones de redes sociales */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium cursor-pointer mb-3 flex items-center justify-center gap-3 transition-all hover:bg-gray-50 hover:border-gray-400"
                        >
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                G
                            </div>
                            continuar con google
                        </button>

                        <button
                            type="button"
                            onClick={handleMicrosoftRegister}
                            className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-3 transition-all hover:bg-gray-50 hover:border-gray-400"
                        >
                            <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                                M
                            </div>
                            continuar con microsoft
                        </button>
                    </div>

                    {/* Separador */}
                    <div className="flex items-center my-6 text-gray-400 text-xs">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="px-4">o</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Formulario de registro */}
                    <form onSubmit={handleManualRegister}>
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1">
                                <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                    nombres
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="introduce tu nombre"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                    apellidos
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    placeholder="introduce tus apellidos"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                correo
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                placeholder="introduce tu correo electrónico"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="introduce tu contraseña"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                confirmar contraseña
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="confirma tu contraseña"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                tipo de usuario
                            </label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                            >
                                <option value="alumno">Alumno</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer mb-5 transition-all hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "registrando..." : "registrar"}
                        </button>
                    </form>

                    
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;