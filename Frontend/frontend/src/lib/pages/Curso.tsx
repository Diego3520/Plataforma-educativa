import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const Curso = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5b9dd9] to-[#8fbc5f] flex items-center justify-center p-8">
      {/* Overlay modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-lg w-full text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Bienvenido</h2>
          <p className="text-gray-700 mb-6">Nos alegra verte. Explora el editor o tus cursos desde el menú.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/')} className="px-6 py-3" variant="default">Ir al inicio</Button>
            <Button onClick={() => navigate('/curso')} className="px-6 py-3" variant="ghost">Mantenerme aquí</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Curso;
