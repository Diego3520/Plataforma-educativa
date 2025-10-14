import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import Registro from './components/Registro';
import AuthCallback from './components/AuthCallback';
import './App.css';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <div className="main-container">
          <h1>Editor de Código Python</h1>
          <div className="auth-buttons">
            <Registro />
          </div>
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

        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
