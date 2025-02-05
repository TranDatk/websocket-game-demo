const WebSocket = require("ws");

const server = new WebSocket.Server({
  port: 3001,
  verifyClient: (info, done) => {
    const token = info.req.headers["sec-websocket-protocol"];
    if (token === "VALID_TOKEN") {
      done(true);
    } else {
      done(false, 401, "Unauthorized");
    }
  },
});

let castles = Array(30).fill(null);
const colors = [
  "#1abc9c", "#3498db", "#9b59b6", "#e74c3c", "#34495e",
  "#f1c40f", "#e67e22", "#2ecc71", "#d35400", "#7f8c8d",
];
const maxClients = 10;
const players = new Map();

function getRandomAvailableColor() {
  const usedColors = new Set(Array.from(players.values()).map(player => player.color));
  const availableColors = colors.filter(color => !usedColors.has(color));
  
  if (availableColors.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
}

// Hàm lấy vị trí ngẫu nhiên còn trống
function getRandomAvailablePosition() {
  const emptyPositions = castles.reduce((positions, castle, index) => {
    if (castle === null) positions.push(index);
    return positions;
  }, []);
  
  if (emptyPositions.length === 0) {
    return -1;
  }
  
  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  return emptyPositions[randomIndex];
}

server.on("connection", (ws) => {
  if (server.clients.size > maxClients) {
    ws.send(JSON.stringify({ type: "error", message: "Server full" }));
    ws.close();
    return;
  }

  // Lấy vị trí ngẫu nhiên cho lâu đài
  const availableCastleIndex = getRandomAvailablePosition();
  if (availableCastleIndex === -1) {
    ws.send(JSON.stringify({ type: "error", message: "No castles available" }));
    ws.close();
    return;
  }

  // Lấy màu ngẫu nhiên cho người chơi mới
  const playerColor = getRandomAvailableColor();
  if (!playerColor) {
    ws.send(JSON.stringify({ type: "error", message: "No colors available" }));
    ws.close();
    return;
  }

  ws.color = playerColor;
  ws.name = `Player-${playerColor}`;
  ws.lastActive = Date.now();
  ws.isAlive = true;

  players.set(ws.name, {
    name: ws.name,
    color: playerColor,
  });

  castles[availableCastleIndex] = { 
    owner: ws.name, 
    ownerColor: playerColor,
    startTime: Date.now() 
  };

  ws.send(JSON.stringify({
    type: "init",
    castles,
    clients: server.clients.size,
    player: { name: ws.name, color: playerColor },
    currentTime: Date.now(),
    players: Array.from(players.values())
  }));

  broadcastState();

  ws.on('pong', () => {
    ws.isAlive = true;
    ws.lastActive = Date.now();
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    if (message.type === "claim") {
      const index = message.index;
      const castle = castles[index];
      if (!castle || (castle.owner !== ws.name && Date.now() - castle.startTime > 10000)) {
        castles[index] = { 
          owner: ws.name, 
          ownerColor: playerColor,
          startTime: Date.now() 
        };
        broadcastState();
      }
    }
    ws.lastActive = Date.now();
  });

  ws.on("close", () => {
    console.log(`${ws.name} disconnected`);
    players.delete(ws.name);
    castles = castles.map(castle => castle?.owner === ws.name ? null : castle);
    broadcastState();
  });
});

function broadcastState() {
  const state = {
    type: "update",
    castles,
    clients: server.clients.size,
    currentTime: Date.now(),
    players: Array.from(players.values())
  };
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

const interval = setInterval(() => {
  server.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log(`${ws.name} timed out - terminating connection`);
      players.delete(ws.name);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.on('close', () => {
  clearInterval(interval);
});

console.log("WebSocket server running on ws://localhost:3001");