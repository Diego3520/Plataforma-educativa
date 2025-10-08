import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Square, RotateCcw, Terminal, Monitor } from 'lucide-react';
import { codeExecutorService } from '../services/codeExecutorService';
import type { CodeExecutionResponse } from '../types/codeExecutor';
import './CodeEditor.css';

interface CodeEditorProps {
  onClose?: () => void;
  initialCode?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  onClose,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<CodeExecutionResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  
  const editorRef = useRef<any>(null);

  // Configurar el editor
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configurar atajos de teclado
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });
  };

  // Ejecutar código
  const handleExecute = async () => {
    if (!code.trim()) {
      setOutput({
        success: false,
        output: '',
        error: 'No hay código para ejecutar',
        execution_time: 0,
        memory_used: 0,
      });
      return;
    }

    setIsExecuting(true);
    setOutput(null);

    try {
      const result = await codeExecutorService.executeCode({
        code,
        language: 'python',
      });

      setOutput(result);
      setIsOutputVisible(true);
    } catch (error) {
      console.error('Error al ejecutar código:', error);
      setOutput({
        success: false,
        output: '',
        error: 'Error inesperado al ejecutar el código',
        execution_time: 0,
        memory_used: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Limpiar output
  const handleClearOutput = () => {
    setOutput(null);
  };

  // Resetear código
  const handleReset = () => {
    setCode('');
    setOutput(null);
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
  };

  // Cambiar tema
  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
  };


  return (
    <div className="code-editor-container">
      {/* Header */}
      <div className="code-editor-header">
        <div className="header-left">
          <Terminal className="header-icon" />
          <h3>Editor de Código Python</h3>
        </div>
        <div className="header-right">
          <button
            onClick={toggleTheme}
            className="icon-button"
            title="Cambiar tema"
          >
            {theme === 'vs-dark' ? '☀️' : '🌙'}
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              ×
            </button>
          )}
        </div>
      </div>


      {/* Editor y Output */}
      <div className="editor-content">
        {/* Editor */}
        <div className="editor-section">
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="execute-button"
              >
                {isExecuting ? (
                  <Square size={16} />
                ) : (
                  <Play size={16} />
                )}
                {isExecuting ? 'Ejecutando...' : 'Ejecutar (Ctrl+Enter)'}
              </button>
              <button
                onClick={handleReset}
                className="icon-button"
                title="Limpiar código"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="toolbar-right">
              <span className="language-indicator">
                Python
              </span>
            </div>
          </div>
          
          <div className="monaco-editor-container">
            <Editor
              height="400px"
              language="python"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme={theme}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                cursorBlinking: 'blink',
                cursorWidth: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 17,
                  horizontalScrollbarSize: 17,
                },
              }}
            />
          </div>
        </div>

        {/* Output */}
        <div className={`output-section ${isOutputVisible ? 'visible' : ''}`}>
          <div className="output-header">
            <div className="output-title">
              <Monitor size={16} />
              <span>Output</span>
            </div>
            <div className="output-controls">
              <button
                onClick={handleClearOutput}
                className="icon-button"
                title="Limpiar output"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOutputVisible(!isOutputVisible)}
                className="icon-button"
                title="Alternar output"
              >
                <Monitor size={16} />
              </button>
            </div>
          </div>
          
          <div className="output-content">
            {output ? (
              <div className={`output-result ${output.success ? 'success' : 'error'}`}>
                {output.success ? (
                  <div>
                    <div className="output-stdout">
                      <pre>{output.output}</pre>
                    </div>
                    {output.error && (
                      <div className="output-stderr">
                        <pre>{output.error}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="output-error">
                    <pre>{output.error}</pre>
                  </div>
                )}
                
                <div className="output-meta">
                  <span>Tiempo: {output.execution_time}s</span>
                  <span>Memoria: {output.memory_used}MB</span>
                </div>
              </div>
            ) : (
              <div className="output-placeholder">
                <Terminal size={32} />
                <p>Ejecuta código para ver el resultado aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
