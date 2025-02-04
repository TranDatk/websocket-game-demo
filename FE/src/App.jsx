import { useEffect, useState } from "react";

const App = () => {
  const [name, setName] = useState("");
  const [castles, setCastles] = useState(Array(8).fill(null));
  const [scores, setScores] = useState({});
  const [ws, setWs] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(Array(8).fill(0)); // Thời gian chiếm giữ cho mỗi lâu đài

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    setWs(socket);

    socket.onopen = () => console.log("Connected to server");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "init") {
        setName(message.name);
        setCastles(message.castles);
        setScores(message.scores);
        setElapsedTime(
          message.castles.map((castle) =>
            castle ? Math.floor((Date.now() - castle.startTime) / 1000) : 0
          )
        );
      } else if (message.type === "update") {
        setCastles(message.castles);
        setScores(message.scores);

        // Cập nhật thời gian chiếm giữ
        setElapsedTime(() =>
          message.castles.map((castle) =>
            castle ? (Math.floor((Date.now() - castle.startTime) / 1000)) : 0
          )
        );
        console.log(message.castles);
        console.log(elapsedTime);
      }
    };

    socket.onclose = () => console.log("Disconnected from server");

    return () => socket.close();
  }, []);

  // Cập nhật thời gian hiển thị trên client mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) =>
        prev.map((time, index) =>
          castles[index]?.owner && castles[index]?.owner === name
            ? time + 1
            : time
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [castles, name]);

  const handleClaim = (index) => {
    ws.send(JSON.stringify({ type: "claim", index }));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center min-h-screen">
        <div className="text-xl font-bold border-2 border-gray-300 rounded-lg p-2 w-1/4 items-center justify-center flex mr-4 h-40">
          Player: {name}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 w-full">
          {castles.map((castle, index) => (
            <button
              key={index}
              className={`h-20 rounded-lg ${castle ? "bg-blue-500 text-white" : "bg-green-500 text-transparent"
                }`}
              onClick={() => handleClaim(index)}
              disabled={castle?.owner === name}
            >
              {castle ? (
                <div>
                  <div>{castle.owner}</div>
                  <div className="text-sm">{elapsedTime[index]}s</div>
                </div>
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
        <div className="text-xl font-bold border-2 border-gray-300 rounded-lg p-2 w-1/4 items-center justify-center flex ml-4 h-40">
          Score: {scores[name] || 0}
        </div>
      </div>
    </div>
  );
};

export default App;
