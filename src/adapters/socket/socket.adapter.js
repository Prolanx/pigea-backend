import { Server } from 'socket.io';
import { verifyToken } from '@adapters/jwt/jwt.js';
import { constants } from '@common/constants/_index.js';

let io = null;

/**
 * Initialise Socket.io and attach it to the provided http.Server.
 * Must be called once during bootstrap, after http.createServer(app).
 *
 * @param {import('http').Server} httpServer
 * @returns {Server} Socket.io server instance
 */
function init(httpServer) {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : '*';

  io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── Auth middleware ──────────────────────────────────────────────────────
  // Verify JWT on every socket connection.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token, constants.env.JWT_ACCESS_SECRET);
      if (!decoded) {
        return next(new Error('Invalid authentication token'));
      }

      socket.merchantId = String(decoded.accountId || decoded.id || decoded._id);
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { merchantId } = socket;

    if (!merchantId) {
      socket.disconnect(true);
      return;
    }

    // Join merchant-scoped room so emits are targeted
    socket.join(`merchant:${merchantId}`);

    console.log(`[Socket] Merchant ${merchantId} connected (socket ${socket.id})`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Merchant ${merchantId} disconnected — ${reason}`);
    });
  });

  return io;
}

/**
 * Emit an event to a specific room.
 * Safe to call even if socket.io has not been initialised (no-op).
 *
 * @param {string} room   - e.g. 'merchant:abc123'
 * @param {string} event  - e.g. 'new_message'
 * @param {Object} payload
 */
function emit(room, event, payload) {
  if (!io) return;
  io.to(room).emit(event, payload);
}

export const socketAdapter = { init, emit };
