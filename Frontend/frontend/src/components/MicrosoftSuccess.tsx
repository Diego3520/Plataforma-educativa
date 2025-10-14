import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function MicrosoftSuccess() {
    const navigate = useNavigate()

    useEffect(() => {
        // Obtener el token del query param
        const params = new URLSearchParams(window.location.search)
        const token = params.get("token")
        if (token) {
            localStorage.setItem("token", token)
            // Podrías guardar info de usuario en contexto global aquí si lo necesitas
            // Redirige a la página principal o dashboard
            navigate("/")
        } else {
            // Si no hay token, redirige al login
            navigate("/login")
        }
    }, [navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#667eea] via-[#5b8def] to-[#4ade80]">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-[#333] mb-4">Iniciando sesión con Microsoft...</h2>
                <p className="text-[#555] text-base">Por favor espera mientras te redirigimos.</p>
            </div>
        </div>
    )
}

export default MicrosoftSuccess