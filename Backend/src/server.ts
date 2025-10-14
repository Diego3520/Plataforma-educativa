import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('PWD:', process.cwd());
import passport from './passportConfig';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import pool from './db';
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
import pool from './db';


const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth endpoints
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        const profile = req.user as any;
        const correo = profile.emails[0].value;
        const nombre = profile.name.givenName;
        const apellido = profile.name.familyName;
        const googleId = profile.id;

        const usuarioRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        let usuario = usuarioRes.rows[0];

        if (!usuario) {
            const nuevoRes = await pool.query(
                `INSERT INTO usuarios
                 (nombre, apellido, tipo, correo, activo, cod_sis, google_id, microsoft_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING *`,
                [nombre, apellido, 'alumno', correo, true, null, googleId, null]
            );
            usuario = nuevoRes.rows[0];
        }

        const token = jwt.sign({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            tipo: usuario.tipo
        }, process.env.JWT_SECRET!, { expiresIn: '2h' });

        res.redirect(`http://localhost:8000/google-success?token=${token}`);
    }
);

app.get('/auth/microsoft',
    passport.authenticate('microsoft')
);

app.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    async (req, res) => {
        const profile = req.user as any;
        const correo = profile.emails?.[0]?.value ?? profile._json.mail;
        const nombre = profile.name?.givenName ?? profile.displayName ?? 'MicrosoftUser';
        const apellido = profile.name?.familyName ?? '';
        const microsoftId = profile.id;

        const usuarioRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        let usuario = usuarioRes.rows[0];

        if (!usuario) {
            const nuevoRes = await pool.query(
                `INSERT INTO usuarios 
                 (nombre, apellido, tipo, correo, activo, cod_sis, google_id, microsoft_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING *`,
                [nombre, apellido, 'alumno', correo, true, null, null, microsoftId]
            );
            usuario = nuevoRes.rows[0];
        }

        const token = jwt.sign({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            tipo: usuario.tipo
        }, process.env.JWT_SECRET!, { expiresIn: '2h' });

        res.redirect(`http://localhost:8000/microsoft-success?token=${token}`);
    }
);

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
    app.listen(pORT, () => {
        console.log(`Servidor iniciado en puerto ${pORT}`);
    });
});