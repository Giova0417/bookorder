const { Server } = require('socket.io');
const Utente = require('../models/Utente');
const tokenService = require('./tokenService');

let io;

function getUserRoom(userId) {
  return `user:${userId}`;
}

function getStaffRoom() {
  return 'role:staff';
}

function initializeRealtime(server, corsOptions) {
  io = new Server(server, {
    cors: corsOptions,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Token mancante'));
      }

      const datiToken = tokenService.verifyAccessToken(token);
      const utente = await Utente.findById(datiToken.id).select('-password');

      if (!utente) {
        return next(new Error('Utente non trovato'));
      }

      socket.user = utente;
      socket.userId = utente._id.toString();
      return next();
    } catch (errore) {
      return next(new Error('Token non valido o scaduto'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(getUserRoom(socket.userId));

    if (socket.user.role === 'staff') {
      socket.join(getStaffRoom());
    }
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (!io) {
    return;
  }

  io.to(getUserRoom(userId)).emit(event, payload);
}

function emitToStaff(event, payload) {
  if (!io) {
    return;
  }

  io.to(getStaffRoom()).emit(event, payload);
}

module.exports = {
  initializeRealtime,
  emitToUser,
  emitToStaff,
};
