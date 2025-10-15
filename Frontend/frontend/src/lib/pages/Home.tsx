import './home.css';
import { Code } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import LoginPage from '../../components/LoginPage';
import RegisterPage from '../../components/RegisterPage';
import CodeEditor from '../../components/CodeEditor';

type HomeProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function Home({ open: openProp, onClose }: HomeProps) {
  const navigate = useNavigate();
  const [openInternal, setOpenInternal] = useState(true);
  const controlled = typeof openProp === 'boolean';
  const open = controlled ? openProp! : openInternal;

  useEffect(() => {
    if (!controlled) return;
    setOpenInternal(openProp ? true : false);
  }, [openProp, controlled]);

  if (!open) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else setOpenInternal(false);
  };

  // 🔹 En lugar de abrir modales, redirigimos a otras rutas
  const handleOpenLogin = () => navigate('/login');
  const handleOpenRegister = () => navigate('/register');
  const handleOpenCode = () => navigate('/code');

  return (
    <div className="hero-modal">
      <div className="hero-backdrop" onClick={handleClose} />

      <div className="hero-card" role="dialog" aria-modal="true">
        <Header
          compact
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onOpenCode={handleOpenCode}
        />

        <div className="hero-icon">
          <Code size={36} color="white" />
        </div>

        <h1 className="hero-title">
          Bienvenido al curso de<br />Python
        </h1>

        <p className="hero-subtitle">
          Plataforma educativa interactiva para dominar Python<br />
          desde cero hasta nivel avanzado
        </p>

        <button className="hero-cta" onClick={handleClose}>
          Comenzar
        </button>
      </div>
    </div>
  );
}
