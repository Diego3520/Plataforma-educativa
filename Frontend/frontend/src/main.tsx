import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import GoogleSuccess from './components/GoogleSuccess'
import "./index.css"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/google-success" element={<GoogleSuccess />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)