import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { comentarioEditorService } from '../services/comentarioEditorService';

let io: SocketServer | null = null;

export function initializeSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:8000',
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Cliente conectado:', socket.id);

    // Unirse a una sala de tópico
    socket.on('join-topico', (topicoId: number) => {
      const room = `topico-${topicoId}`;
      socket.join(room);
      console.log(`Cliente ${socket.id} se unió a la sala ${room}`);
    });

    // Salir de una sala de tópico
    socket.on('leave-topico', (topicoId: number) => {
      const room = `topico-${topicoId}`;
      socket.leave(room);
      console.log(`Cliente ${socket.id} salió de la sala ${room}`);
    });

    // Publicar comentario/contenido (solo editores)
    socket.on('publicar-comentario', async (data: {
      id_topico: number;
      id_editor: number;
      contenido: string;
      tipo: 'comentario' | 'contenido' | 'material';
      material_id?: number | null;
    }) => {
      try {
        const service = new comentarioEditorService();
        const nuevoComentario = await service.crearComentario({
          id_topico: data.id_topico,
          id_editor: data.id_editor,
          contenido: data.contenido,
          tipo: data.tipo,
          material_id: data.material_id || null,
          activo: true
        });

        // Emitir a todos los clientes en la sala del tópico
        const room = `topico-${data.id_topico}`;
        io?.to(room).emit('nuevo-comentario', nuevoComentario);
        
        console.log(`Comentario publicado en tópico ${data.id_topico}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        console.error('Error publicando comentario:', error);
      }
    });

    // Actualizar comentario
    socket.on('actualizar-comentario', async (data: {
      id_comentario: number;
      id_topico: number;
      contenido?: string;
      activo?: boolean;
    }) => {
      try {
        const service = new comentarioEditorService();
        const comentarioActualizado = await service.editarComentario(data.id_comentario, {
          contenido: data.contenido,
          activo: data.activo
        });

        const room = `topico-${data.id_topico}`;
        io?.to(room).emit('comentario-actualizado', comentarioActualizado);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        console.error('Error actualizando comentario:', error);
      }
    });

    // Eliminar comentario
    socket.on('eliminar-comentario', async (data: {
      id_comentario: number;
      id_topico: number;
    }) => {
      try {
        const service = new comentarioEditorService();
        await service.borrarComentario(data.id_comentario);

        const room = `topico-${data.id_topico}`;
        io?.to(room).emit('comentario-eliminado', { id_comentario: data.id_comentario });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        console.error('Error eliminando comentario:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketServer | null {
  return io;
}

