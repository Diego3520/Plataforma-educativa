import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import GoogleSuccess from './components/GoogleSuccess'
import MicrosoftSuccess from './components/MicrosoftSuccess'
import "./index.css"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/google-success" element={<GoogleSuccess />} />
                <Route path="/microsoft-success" element={<MicrosoftSuccess />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)