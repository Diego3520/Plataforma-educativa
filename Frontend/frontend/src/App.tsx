import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import LoginForm from './components/loginForm';
import './App.css';

function App() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <div className="App relative min-h-screen">
            {/* Botón Iniciar sesión - ESQUINA SUPERIOR DERECHA */}
            <button
                className="absolute top-4 right-4 bg-[#5b8def] text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-[#4a7dd9] z-50"
                onClick={() => setIsLoginOpen(true)}
            >
                Iniciar sesión
            </button>

            <div className="main-container">
                <h1>Editor de Código Python</h1>
                <button
                    className="open-editor-btn"
                    onClick={() => setIsEditorOpen(true)}
                >
                    Abrir Editor de Código
                </button>

                {isEditorOpen && (
                    <CodeEditor onClose={() => setIsEditorOpen(false)} />
                )}
            </div>

            {/* Modal de Login */}
            {isLoginOpen && (
                <LoginForm onClose={() => setIsLoginOpen(false)} />
            )}
        </div>
    );
}

export default App