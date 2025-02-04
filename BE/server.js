const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3001 });

let clients = []; // Danh sách client { id, name, ws, lastActive }
let castles = Array(8).fill(null); // Trạng thái các lâu đài [{ owner, startTime }]
let scores = {}; // Điểm số { clientName: totalScore }

server.on("connection", (ws) => {
  // Gán tên cho client (A, B, C...)
  const clientName = String.fromCharCode(65 + clients.length);
  if (clients.length >= 5) {
    ws.send(JSON.stringify({ type: "error", message: "Server full" }));
    ws.close();
    return;
  }

  const client = { id: clients.length, name: clientName, ws, lastActive: Date.now() };
  clients.push(client);
  scores[clientName] = 0;

  console.log(`Client ${clientName} connected`);

  // Gửi trạng thái ban đầu
  ws.send(JSON.stringify({ type: "init", castles, scores, name: clientName }));

  // Xử lý khi client gửi dữ liệu
  ws.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.type === "claim") {
      const castleIndex = message.index;
      const castle = castles[castleIndex];

      // Nếu lâu đài trống hoặc đã chiếm hơn 10 giây
	  console.log(Date.now() - (castle?.startTime || 0));
      if (
        !castle ||
        (castle.owner !== clientName && Date.now() - castle.startTime > 10000)
      ) {
        castles[castleIndex] = { owner: clientName, startTime: Date.now(), castleIndex };
        broadcastState();
      }
    }

    // Cập nhật hoạt động cuối cùng
    client.lastActive = Date.now();
  });

  // Xử lý khi client đóng kết nối
  ws.on("close", () => {
    console.log(`Client ${clientName} disconnected`);
    clients = clients.filter((c) => c.ws !== ws);

    // Xóa điểm và lâu đài liên quan đến client
    delete scores[clientName];
    castles = castles.map((castle) =>
      castle?.owner === clientName ? null : castle
    );

    broadcastState();
  });
});

// Gửi trạng thái đến tất cả client
function broadcastState() {
  const state = { type: "update", castles, scores };
  clients.forEach((client) => {
    client.ws.send(JSON.stringify(state));
  });
}

// Cập nhật điểm số và kiểm tra hoạt động định kỳ
setInterval(() => {
  const now = Date.now();

  // Cập nhật điểm
  castles.forEach((castle, index) => {
    if (castle) {
      const elapsedTime = Math.floor((now - castle.startTime) / 1000);
      scores[castle.owner] = (scores[castle.owner] || 0) + elapsedTime;

      // Reset thời gian lâu đài
      //castle.startTime = now;
    }
  });

  // Kick client không hoạt động
  clients.forEach((client) => {
    if (now - client.lastActive > 30000) {
      client.ws.close();
      console.log(`Client ${client.name} kicked due to inactivity`);
    }
  });

  broadcastState();
}, 1000);

console.log("WebSocket server running on ws://localhost:3001");
