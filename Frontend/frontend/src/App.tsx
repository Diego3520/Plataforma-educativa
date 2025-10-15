import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AuthCallback from './components/AuthCallback';
import { authService } from './services/authService';
import Home from './lib/pages/Home';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleAuthSuccess = () => {
    // Redirigir a la página principal después del inicio de sesión
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div>
      <Routes>
        {/* Página principal */}
        <Route
          path="/"
          element={
            <div>
              <Home open={showWelcome} onClose={() => setShowWelcome(false)} />

              <h1>Editor de Código Python</h1>

              <div style={{ marginBottom: '20px' }}>
                {isAuthenticated ? (
                  <div>
                    <span>
                      Bienvenido,{' '}
                      {user
                        ? `${user.nombre || ''} ${user.apellido || ''}`.trim() ||
                          'Usuario'
                        : 'Usuario'}
                    </span>
                    <button
                      onClick={handleLogout}
                      style={{
                        marginLeft: '10px',
                        padding: '5px 10px',
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div>
                    <span style={{ color: '#666' }}>
                      Usa los botones de la esquina superior para iniciar sesión o registrarte.
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsEditorOpen(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'purple',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Abrir Editor de Código
              </button>

              {isEditorOpen && <CodeEditor onClose={() => setIsEditorOpen(false)} />}
            </div>
          }
        />

        {/* Página de inicio de sesión */}
        <Route
          path="/login"
          element={
            <LoginPage
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => navigate('/register')}
            />
          }
        />

        {/* Página de registro */}
        <Route
          path="/register"
          element={
            <RegisterPage
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => navigate('/login')}
            />
          }
        />

        {/* Callback de autenticación OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ✅ NUEVA RUTA para el editor de código */}
        <Route
          path="/code"
          element={<CodeEditor onClose={() => navigate('/')} />}
        />
      </Routes>
    </div>
  );
}

export default App;
