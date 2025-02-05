import { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';

// Component cho mỗi client
const App = ({ clientId }) => {
  const [player, setPlayer] = useState(null);
  const [castles, setCastles] = useState(Array(30).fill(null));
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [clientSize, setClientSize] = useState(0);
  const [ws, setWs] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001", ["VALID_TOKEN"]);
    setWs(socket);

    socket.onopen = () => {
      console.log(`Client ${clientId}: Connected to server`);
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1000);
      }, 1000);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "init") {
        setPlayer(message.player);
        setCastles(message.castles);
        setCurrentTime(message.currentTime);
        setClientSize(message.clients);
      } else if (message.type === "update") {
        setCastles(message.castles);
        setCurrentTime(message.currentTime);
        setClientSize(message.clients);
      }
    };

    socket.onclose = () => {
      console.log(`Client ${clientId}: Disconnected from server`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentTime(0);
      setCastles(Array(30).fill(null));
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      socket.close();
    };
  }, [clientId]);

  const handleClaim = (index) => {
    ws.send(JSON.stringify({ type: "claim", index }));
  };

  const calculateScore = (castle) => {
    if (!castle) {
      return 0;
    };
    const elapsedTime = Math.floor((currentTime - castle.startTime) / 1000);
    return elapsedTime;
  };

  const calculateCastlesOwned = () => {
    const castlesOwned = castles.filter((castle) => castle?.owner === player?.name);
    if (castlesOwned.length === 0 && ws?.readyState === 1) {
      ws.close();
      alert(`Game over for ${player?.name}`);
      return 0;
    }
    return castlesOwned.length;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center gap-4">
        <div
          className="text-xl font-bold border-2 rounded-lg p-4 w-1/4 flex flex-col items-center"
          style={{ backgroundColor: player?.color }}
        >
          <div className="text-white">Player</div>
          <div className="text-white">{ws?.readyState === 1 ? "Online" : "Offline"}</div>
        </div>

        <div className="grid grid-cols-5 gap-4 w-full">
          {castles.map((castle, index) => (
            <button
              key={index}
              className={`h-20 rounded-lg flex items-center justify-center`}
              style={{
                backgroundColor: castle ? castle.ownerColor : "#ffffff",
                color: castle ? "#ffffff" : "#000000",
                border: "2px solid #e2e8f0"
              }}
              onClick={() => handleClaim(index)}
              disabled={castle?.owner === player?.name}
            >
              {castle ? `${calculateScore(castle)}s` : ""}
            </button>
          ))}
        </div>

        <div className="text-xl font-bold border-2 rounded-lg p-4 w-1/4 flex flex-col items-center">
          <div>Score: {castles.filter(c => c?.owner === player?.name).reduce((sum, c) => sum + calculateScore(c), 0)}</div>
          <div>Players: {clientSize}</div>
          <div>Castles: {calculateCastlesOwned()}</div>
        </div>
      </div>
    </div>
  );
};

// Add prop type validation
App.propTypes = {
  clientId: PropTypes.number.isRequired,
};

// Component chính để quản lý nhiều client
const MultiClientApp = () => {
  const clientCount = 10; // Ví dụ có 3 client trên một trang

  return (
    <div className="grid grid-cols-3 gap-10">
      {Array.from({ length: clientCount }).map((_, index) => (
        <div className="border-2 rounded-lg p-4" key={index}>
          <App clientId={index + 1} />
        </div>
      ))}
    </div>
  );
};

export default MultiClientApp;
