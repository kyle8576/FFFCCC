const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

// Store the latest tournament state
let latestState = null;

// Track connected clients
const clients = new Set();

console.log(`WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected. Total clients:', clients.size + 1);
  clients.add(ws);

  // Send current state to newly connected client
  if (latestState) {
    ws.send(JSON.stringify({
      type: 'SYNC_STATE',
      payload: latestState
    }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'SYNC_STATE') {
        // Update latest state
        latestState = data.payload;

        // Broadcast to all other clients
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });

        console.log('State broadcasted to', clients.size - 1, 'clients');
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Keep-alive ping
setInterval(() => {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);
