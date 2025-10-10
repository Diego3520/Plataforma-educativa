import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import pool from './db';

dotenv.config();

const app = express();
const pORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

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