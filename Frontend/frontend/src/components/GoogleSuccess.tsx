import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            navigate("/"); // Redirige al dashboard o home
        }
    }, [location, navigate]);

    return <div>Autenticando con Google...</div>;
};

export default GoogleSuccess;