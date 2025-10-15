import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AuthCallback from './components/AuthCallback';
import { authService } from './services/authService';

function App() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();

    const handleAuthSuccess = () => {
        // Redirect to home page after successful authentication
        navigate('/');
    };

    const handleLogout = () => {
        authService.logout();
        window.location.reload();
    };

  return (
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage onSuccess={handleAuthSuccess} onSwitchToRegister={() => navigate('/register')} />} />
          <Route path="/register" element={<RegisterPage onSuccess={handleAuthSuccess} onSwitchToLogin={() => navigate('/login')} />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            <div>
              <h1>Editor de Código Python</h1>
              <div style={{marginBottom: '20px'}}>
                {isAuthenticated ? (
                  <div>
                    <span>Bienvenido, {user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario' : 'Usuario'}</span>
                    <button 
                      onClick={handleLogout}
                      style={{marginLeft: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none'}}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={() => navigate('/login')}
                      style={{marginRight: '10px', padding: '5px 10px', backgroundColor: 'blue', color: 'white', border: 'none'}}
                    >
                      Iniciar Sesión
                    </button>
                    <button 
                      onClick={() => navigate('/register')}
                      style={{padding: '5px 10px', backgroundColor: 'green', color: 'white', border: 'none'}}
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsEditorOpen(true)}
                style={{padding: '10px 20px', backgroundColor: 'purple', color: 'white', border: 'none'}}
              >
                Abrir Editor de Código
              </button>
              
              {isEditorOpen && (
                <CodeEditor onClose={() => setIsEditorOpen(false)} />
              )}
            </div>
          } />
        </Routes>
      </div>
  );
}

export default App;
