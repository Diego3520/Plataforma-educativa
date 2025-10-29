import { Button } from '../components/button';
import { LogIn, UserPlus, Code } from 'lucide-react';
import './header.css';

type HeaderProps = {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenCode?: () => void;
  compact?: boolean; // render a compact variant for inside hero
};

export default function Header({ onOpenLogin, onOpenRegister, onOpenCode, compact = false }: HeaderProps) {
  const containerClass = compact ? 'app-header header--inside-hero' : 'app-header';
  return (
    <header className={containerClass} aria-hidden={false}>
      <div className="header-inner">
        <div className="header-left" />
        <div className="header-right">
          <Button variant="ghost" size={compact ? 'sm' : 'sm'} onClick={onOpenLogin}><LogIn size={16} />Iniciar sesión</Button>
          <Button variant="default" size={compact ? 'sm' : 'sm'} onClick={onOpenRegister}><UserPlus size={16} />Registrarse</Button>
          <Button variant="outline" size={compact ? 'sm' : 'sm'} onClick={onOpenCode}><Code size={16} />Abrir código</Button>
        </div>
      </div>
    </header>
  );
}