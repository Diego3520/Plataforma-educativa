"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react"

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "",
        acceptTerms: false,
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Validaciones
        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.userType
        ) {
            setError("Por favor completa todos los campos")
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres")
            setIsLoading(false)
            return
        }

        if (!formData.acceptTerms) {
            setError("Debes aceptar los términos y condiciones")
            setIsLoading(false)
            return
        }

        // Simulación de registro
        setTimeout(() => {
            console.log("Register attempt:", formData)
            setSuccess(true)
            setIsLoading(false)
        }, 1500)
    }

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (success) {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-balance">¡Registro exitoso!</CardTitle>
                    <CardDescription className="text-pretty">
                        Tu cuenta ha sido creada correctamente. Revisa tu correo para verificar tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-4">
                    <Button asChild className="w-full h-11 font-semibold">
                        <Link to="/login">Ir a iniciar sesión</Link>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-2 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-balance">Crea tu cuenta</CardTitle>
                <CardDescription className="text-pretty">
                    Únete a nuestra plataforma educativa y comienza a aprender
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Juan Pérez"
                            value={formData.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userType">Tipo de usuario</Label>
                        <Select value={formData.userType} onValueChange={(value) => handleChange("userType", value)}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecciona tu rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Estudiante</SelectItem>
                                <SelectItem value="teacher">Profesor</SelectItem>
                                <SelectItem value="parent">Padre/Tutor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                required
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                required
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="terms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => handleChange("acceptTerms", checked as boolean)}
                        />
                        <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
                            Acepto los{" "}
                            <Link to="/terms" className="text-primary hover:underline">
                                términos y condiciones
                            </Link>{" "}
                            y la{" "}
                            <Link to="/privacy" className="text-primary hover:underline">
                                política de privacidad
                            </Link>
                        </label>
                    </div>

                    <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">o regístrate con</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                    <Button variant="outline" type="button" className="h-11 bg-transparent">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>
                    <Button variant="outline" type="button" className="h-11 bg-transparent">
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
