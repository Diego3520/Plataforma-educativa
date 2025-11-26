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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
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

    return (
        <div className="flex min-h-screen font-sans">
            {/* Panel izquierdo oscuro */}
            <div className="flex-[0_0_45%] bg-gradient-to-br from-blue-950 via-blue-900 to-purple-900 p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Efectos de fondo */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-32 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
                        bienvenido de vuelta
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                        inicia sesión para continuar tu aprendizaje y acceder a todos los recursos.
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
                            ¿no tienes una cuenta? 
                        </span>
                        <button 
                            onClick={onSwitchToRegister}
                            className="bg-none border-none text-blue-600 font-medium cursor-pointer text-sm ml-1 hover:underline"
                        >
                            regístrate
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        inicia sesión
                    </h2>
                    <p className="text-gray-600 mb-8 text-sm">
                        ¡continúa tu viaje de aprendizaje!
                    </p>

                    {error && (
                        <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg mb-5 text-sm">
                            ¡inicio de sesión exitoso! redirigiendo...
                        </div>
                    )}

                    {/* Botones de redes sociales */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium cursor-pointer mb-3 flex items-center justify-center gap-3 transition-all hover:bg-gray-50 hover:border-gray-400"
                        >
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                G
                            </div>
                            continuar con google
                        </button>

                        <button
                            type="button"
                            onClick={handleMicrosoftLogin}
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

                    {/* Formulario de login */}
                    <form onSubmit={handleSubmit} className={success ? 'opacity-60' : 'opacity-100'}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-xs font-semibold mb-2 uppercase tracking-wide">
                                correo electrónico
                            </label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleInputChange}
                                placeholder="introduce tu correo electrónico"
                                required
                                disabled={loading || success}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="mb-6">
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
                                disabled={loading || success}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer mb-5 transition-all hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "iniciando sesión..." : success ? "redirigiendo..." : "iniciar sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;