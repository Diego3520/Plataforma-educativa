import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Code } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5b9dd9] to-[#8fbc5f] flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[#6ba3e0] rounded-3xl shadow-lg">
          <Code className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-6xl font-bold text-white tracking-tight">
          Bienvenido al curso de Python
        </h1>
        
        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Plataforma educativa interactiva para dominar Python
          <br />
          desde cero hasta nivel avanzado
        </p>
        
        <div className="pt-4">
          <Button
            onClick={() => navigate("/curso")}
            className="bg-white text-primary hover:bg-white/95 text-lg px-12 py-6 rounded-xl font-semibold shadow-lg"
            size="lg"
          >
            Comenzar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
