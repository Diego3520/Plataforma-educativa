import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Users, Award } from "lucide-react"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <GraduationCap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">EduPlatform</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link to="/login">Iniciar sesión</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/register">Registrarse</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl font-bold text-balance leading-tight">
                        Aprende sin límites con nuestra plataforma educativa
                    </h1>
                    <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                        Accede a cursos de calidad, conecta con profesores expertos y alcanza tus metas académicas
                    </p>
                    <div className="flex gap-4 justify-center pt-4">
                        <Button size="lg" asChild className="h-12 px-8">
                            <Link to="/register">Comenzar gratis</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-12 px-8 bg-transparent">
                            <Link to="/login">Iniciar sesión</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-card p-6 rounded-xl shadow-sm border space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Cursos variados</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Accede a cientos de cursos en diferentes áreas del conocimiento
                        </p>
                    </div>

                    <div className="bg-card p-6 rounded-xl shadow-sm border space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Profesores expertos</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Aprende de los mejores profesionales en cada materia
                        </p>
                    </div>

                    <div className="bg-card p-6 rounded-xl shadow-sm border space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Award className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Certificaciones</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Obtén certificados reconocidos al completar tus cursos
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
