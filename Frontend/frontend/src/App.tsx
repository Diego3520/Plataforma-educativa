import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AuthCallback from './components/AuthCallback';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import GestionCursos from './components/GestionCursos';
import DocenteCursoView from './components/DocenteCursoView';
import MaterialesCurso from './components/MaterialesCurso';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onSuccess={handleAuthSuccess} 
            onSwitchToRegister={() => navigate('/register')} 
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <RegisterPage 
            onSuccess={handleAuthSuccess} 
            onSwitchToLogin={() => navigate('/login')} 
          />
        } 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />

      {/* Dashboard post-login */}
      <Route 
        path="/dashboard" 
        element={<Dashboard />} 
      />

      {/* Gestión de cursos (solo admin) */}
      <Route 
        path="/gestion-cursos" 
        element={<GestionCursos />} 
      />

      {/* Vista de curso para docente */}
      <Route 
        path="/curso/:id" 
        element={<DocenteCursoView />} 
      />

      {/* Vista de materiales del curso */}
      <Route 
        path="/curso/:cursoId/materiales" 
        element={<MaterialesCurso />} 
      />

      {/* Ruta principal - Home */}
      <Route 
        path="/" 
        element={
          <Home 
            open={showWelcome} 
            onClose={() => setShowWelcome(false)} 
          />
        } 
      />

      {/* Ruta del editor de código */}
      <Route
        path="/code"
        element={<CodeEditor onClose={() => navigate('/')} />}
      />
    </Routes>
  );
}

export default App;