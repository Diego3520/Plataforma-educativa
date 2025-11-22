import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
dotenv.config();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('PWD:', process.cwd());
import passport from './config/passport';
import session from 'express-session';
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


const app = express();
const httpServer = createServer(app);
const pORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Configuración de sesión para passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// rutas
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
// Ruta adicional para Microsoft OAuth sin /api (para compatibilidad con callback URL)
app.use('/auth', authRoutes);

app.get('/api/hello', (req, res) => {
    res.json({ mensaje: 'Hello from the backend!' });
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