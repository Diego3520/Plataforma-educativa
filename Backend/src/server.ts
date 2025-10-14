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

const app = express();
const pORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors());
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
        // Obtén el perfil de Google
        const profile = req.user as any;
        const correo = profile.emails[0].value;
        const nombre = profile.name.givenName;
        const apellido = profile.name.familyName;
        const googleId = profile.id;

        // Buscar usuario por correo
        let usuarioRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        let usuario = usuarioRes.rows[0];

        // Si no existe, crear usuario con google_id y microsoft_id en null
        if (!usuario) {
            let nuevoRes = await pool.query(
                `INSERT INTO usuarios
                 (nombre, apellido, tipo, correo, activo, cod_sis, google_id, microsoft_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING *`,
                [nombre, apellido, 'alumno', correo, true, null, googleId, null]
            );
            usuario = nuevoRes.rows[0];
        }

        // Generar JWT
        const token = jwt.sign({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            tipo: usuario.tipo
        }, process.env.JWT_SECRET!, { expiresIn: '2h' });

        // Redirige al frontend con el token por query param
        res.redirect(`http://localhost:8000/google-success?token=${token}`);
    }
);

// Microsoft OAuth endpoints
app.get('/auth/microsoft',
    passport.authenticate('microsoft')
);

app.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    async (req, res) => {
        // Obtén el perfil de Microsoft
        const profile = req.user as any;
        // El perfil puede variar, pero normalmente:
        // profile.id, profile.displayName, profile.emails[0].value
        const correo = profile.emails?.[0]?.value ?? profile._json.mail;
        const nombre = profile.name?.givenName ?? profile.displayName ?? 'MicrosoftUser';
        const apellido = profile.name?.familyName ?? '';
        const microsoftId = profile.id;

        // Buscar usuario por correo
        let usuarioRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        let usuario = usuarioRes.rows[0];

        // Si no existe, crear usuario con microsoft_id y google_id en null
        if (!usuario) {
            let nuevoRes = await pool.query(
                `INSERT INTO usuarios 
                 (nombre, apellido, tipo, correo, activo, cod_sis, google_id, microsoft_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING *`,
                [nombre, apellido, 'alumno', correo, true, null, null, microsoftId]
            );
            usuario = nuevoRes.rows[0];
        }

        // Generar JWT
        const token = jwt.sign({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            tipo: usuario.tipo
        }, process.env.JWT_SECRET!, { expiresIn: '2h' });

        // Redirige al frontend con el token por query param
        res.redirect(`http://localhost:8000/microsoft-success?token=${token}`);
    }
);

// rutas normales
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

// ruta simple
app.get('/api/hello', (req, res) => {
    res.json({ mensaje: 'Hello from the backend!' });
});

// comprobar conexion DB al iniciar
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