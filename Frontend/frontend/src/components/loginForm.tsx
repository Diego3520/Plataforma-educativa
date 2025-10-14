import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoginFormProps {
    onClose: () => void
}

function LoginForm({ onClose }: LoginFormProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Login tradicional
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ correo: email, password })
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem("token", data.token)
                // Aquí podrías guardar info de usuario en contexto global si tienes
                // window.location.reload() // ejemplo para recargar o redirigir
            } else {
                setError(data.error || "Error de autenticación")
            }
        } catch (err) {
            setError("Error de red de autenticación")
        } finally {
            setLoading(false)
        }
    }

    // Los handlers de Google y Microsoft los agregaremos después
    const handleGoogleLogin = () => {
        console.log("Google login clicked")
        // Aquí irá la lógica de autenticación con Google
    }

    const handleMicrosoftLogin = () => {
        console.log("Microsoft login clicked")
        // Aquí irá la lógica de autenticación con Microsoft
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#667eea] via-[#5b8def] to-[#4ade80] flex items-center justify-center z-[1000] p-2">
            <Card className="w-full max-w-md mx-auto border-0 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl max-h-[90vh]">
                <CardContent className="p-4 flex flex-col items-center">
                    <div className="mb-4">
                        <div className="w-[60px] h-[60px] bg-[#5b8def] rounded-xl flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path
                                    d="M10 13L13 10L16 13M16 19L13 22L10 19M19 10L22 13L19 16M19 16L22 19L19 22"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-[#333] text-base font-normal text-center mb-4 leading-relaxed">
                        Accede a la plataforma de Aprendizaje
                    </h2>

                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as "login" | "register")}
                        className="w-full mb-4"
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-[#f5f5f5] p-1 h-auto rounded-xl">
                            <TabsTrigger
                                value="login"
                                className="rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.08)] py-2 text-sm font-medium"
                            >
                                Iniciar Sesión
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-[10px] data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.08)] py-2 text-sm font-medium"
                            >
                                Registrarse
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-3 text-left w-full">
                            <Label htmlFor="email" className="text-[#333] text-sm font-medium mb-1">
                                Correo electrónico
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@gmail.com"
                                required
                                className="bg-[#f5f5f5] border-0 rounded-[10px] h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-[#ebebeb] placeholder:text-[#999]"
                            />
                        </div>

                        <div className="mb-3 text-left w-full">
                            <Label htmlFor="password" className="text-[#333] text-sm font-medium mb-1">
                                Contraseña
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-[#f5f5f5] border-0 rounded-[10px] h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-[#ebebeb]"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm mb-2 text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 bg-[#5b8def] hover:bg-[#4a7dd9] text-white rounded-xl text-base font-semibold mb-4"
                            disabled={loading}
                        >
                            {loading ? "Ingresando..." : "Iniciar Sesión"}
                        </Button>

                        <div className="flex items-center text-center my-4 text-[#999] text-[13px]">
                            <div className="flex-1 border-b border-[#e0e0e0]"></div>
                            <span className="px-2">o continuar con</span>
                            <div className="flex-1 border-b border-[#e0e0e0]"></div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 border-[#e0e0e0] bg-white hover:bg-[#f9f9f9] hover:border-[#d0d0d0] rounded-[10px] text-sm font-medium mb-2 text-[#333] px-2"
                            onClick={handleGoogleLogin}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2 flex-shrink-0">
                                <path
                                    d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M10.2 20C12.9 20 15.1709 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90182 17.7591 6.30909 20 10.2 20Z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 8.1Z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9182 2.61818C15.1664 0.986364 12.8955 0 10.2 0C6.30909 0 2.90182 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Iniciar sesión con Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 border-[#e0e0e0] bg-white hover:bg-[#f9f9f9] hover:border-[#d0d0d0] rounded-[10px] text-sm font-medium mb-2 text-[#333] px-2"
                            onClick={handleMicrosoftLogin}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2 flex-shrink-0">
                                <path d="M0 0H9.52381V9.52381H0V0Z" fill="#F25022" />
                                <path d="M10.4762 0H20V9.52381H10.4762V0Z" fill="#7FBA00" />
                                <path d="M0 10.4762H9.52381V20H0V10.4762Z" fill="#00A4EF" />
                                <path d="M10.4762 10.4762H20V20H10.4762V10.4762Z" fill="#FFB900" />
                            </svg>
                            Iniciar sesión con Microsoft
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-10 text-[#5b8def] hover:bg-transparent hover:opacity-80 text-sm font-medium mt-2"
                            onClick={onClose}
                        >
                            Volver
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginForm