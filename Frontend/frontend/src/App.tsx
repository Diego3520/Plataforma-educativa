import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import './App.css';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div className="App">
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
    </div>
  );
}

export default App
