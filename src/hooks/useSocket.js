import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// Direct connection to the backend Socket.io server.
// In dev: always connect to port 4000 directly (not through Vite proxy).
// In prod: VITE_API_BASE_URL should be set to the backend origin.
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);

// Module-level socket singleton — one connection shared across all components.
let _socket = null;

function getSocket() {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    _socket.on('connect', () => {
      console.log('[socket] connected:', _socket.id);
    });
    _socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });
    _socket.on('connect_error', (err) => {
      console.error('[socket] connect error:', err.message);
    });
  }
  return _socket;
}

export default function useSocket() {
  const [connected, setConnected] = useState(false);
  const [orderUpdate, setOrderUpdate] = useState(null);
  // Track pending room joins that should be sent once connected.
  const pendingRooms = useRef([]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      // Flush any pending room joins
      pendingRooms.current.forEach((orderNumber) => {
        socket.emit('join_order', { orderNumber });
        console.log('[socket] joined order room (after connect):', orderNumber);
      });
      pendingRooms.current = [];
    };
    const onDisconnect = () => setConnected(false);
    const onOrderUpdate = (data) => {
      console.log('[socket] order_status_update received:', data);
      setOrderUpdate(data);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('order_status_update', onOrderUpdate);

    // If already connected, reflect that immediately
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order_status_update', onOrderUpdate);
    };
  }, []);

  const joinOrderRoom = (orderNumber) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('join_order', { orderNumber });
      console.log('[socket] joined order room:', orderNumber);
    } else {
      // Queue it — will be flushed once the socket connects
      if (!pendingRooms.current.includes(orderNumber)) {
        pendingRooms.current.push(orderNumber);
        console.log('[socket] queued order room join:', orderNumber);
      }
    }
  };

  return { connected, orderUpdate, joinOrderRoom };
}
