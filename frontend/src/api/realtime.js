import { io } from 'socket.io-client';
import { API_BASE_URL, refreshAccessToken } from './client';

export function collegaRealtimeOrdini(token, onOrderChange) {
  let active = true;
  const socket = io(API_BASE_URL, {
    auth: { token },
  });

  socket.on('orderCreated', onOrderChange);
  socket.on('orderUpdated', onOrderChange);
  socket.on('connect_error', async () => {
    const nuovoToken = await refreshAccessToken();

    if (!active || !nuovoToken) {
      return;
    }

    socket.auth = { token: nuovoToken };
    socket.connect();
  });

  return () => {
    active = false;
    socket.disconnect();
  };
}