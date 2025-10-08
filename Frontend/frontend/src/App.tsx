import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/homePage"
import LoginPage from "./pages/loginPage"
import RegisterPage from "./pages/registerPage"

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    )
}

export default App
