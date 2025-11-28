import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import session from 'express-session';
import passport from './config/passport';

import usuarioRoutes from './routes/usuarioRoutes';
import editorRoutes from './routes/editorRoutes';
import cursoRoutes from './routes/cursoRoutes';
import materialRoutes from './routes/materialRoutes';
import topicoRoutes from './routes/topicoRoutes';
import inscritoRoutes from './routes/inscritoRoutes';
import tareaRoutes from './routes/tareaRoutes';
import respuestaRoutes from './routes/respuestaRoutes';
import evaluacionRoutes from './routes/evaluacionRoutes';
import notaRoutes from './routes/notaRoutes';
import diagnosticoRoutes from './routes/diagnosticoRoutes';
import codeExecutorRoutes from './routes/codeExecutorRoutes';
import authRoutes from './routes/authRoutes';
import comentarioEditorRoutes from './routes/comentarioEditorRoutes';
import uploadRoutes from './routes/uploadRoutes';
import pool from './db';
import { initializeSocket } from './socket/socketServer';
import { uploadsDir } from './utils/uploadsPath';

dotenv.config();

// Debug logs
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('PWD:', process.cwd());

const app = express();
const httpServer = createServer(app);
const pORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://straydogs-290096756800.southamerica-east1.run.app',
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// --- RUTAS DE API ---
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/editores', editorRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/topicos', topicoRoutes);
app.use('/api/inscritos', inscritoRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/respuestas', respuestaRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/diagnosticos', diagnosticoRoutes);
app.use('/api/code-executor', codeExecutorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comentarios-editor', comentarioEditorRoutes);
app.use('/api/uploads', uploadRoutes);

// Ruta adicional para OAuth callbacks
app.use('/auth', authRoutes);

app.get('/api/hello', (req, res) => {
    res.json({ mensaje: 'Hello from the backend!' });
});

// --- INTEGRACIÓN FRONTEND (NUEVO) ---
// Esto permite que Node sirva los archivos de React construidos.
// La ruta asume que en Docker la estructura es: /app/backend/dist (aquí) y /app/frontend/dist (allá)

// 1. Servir archivos estáticos (JS, CSS, imágenes del build de React)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// 2. Manejar cualquier otra ruta (*) devolviendo el index.html
// Esto es vital para que React Router funcione (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

async function comprobarDB() {
    try {
        await pool.query('SELECT 1');
        console.log('Conexión a BD OK');
    } catch (error) {
        console.error('Error conectando a BD:', error);
        process.exit(1);
    }
}

comprobarDB().then(() => {
    // Inicializar WebSocket
    initializeSocket(httpServer);

    httpServer.listen(pORT, () => {
        console.log(`Servidor iniciado en puerto ${pORT}`);
        console.log(`WebSocket server activo`);
    });
});