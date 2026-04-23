import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Users, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../infrastructure/SocketService';

interface Player {
  id: string;
  name: string;
}

interface LobbyStepProps {
  roomData: {
    code: string;
    joinLink: string;
    players: Player[];
  };
}

const LobbyStep: React.FC<LobbyStepProps> = ({ roomData }) => {
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>(roomData.players);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Join the specific room via socket
    socketService.joinRoom(roomData.code);

    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/rooms/get/${roomData.code}`);
        const result = await response.json();
        if (result.success) {
          setPlayers(result.data.players);
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
      }
    };

    // When a player joins, refetch the participant list
    socketService.on('player_joined', () => {
      fetchPlayers();
    });

    // If host starts the game, automatically navigate to the game page
    socketService.on('game_started', () => {
       navigate(`/game/${roomData.code}`);
    });

    return () => {
      socketService.off('player_joined');
      socketService.off('game_started');
    };
  }, [roomData.code, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomData.joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    setStarting(true);
    try {
      await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomData.code })
      });
      // Emitting through socket so everyone navigates
      socketService.emit('start_game', roomData.code);
      navigate(`/game/${roomData.code}`);
    } catch (err) {
      console.error('Failed to start game', err);
      setStarting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="lobby-container"
    >
      <div className="lobby-header">
        <h2 className="step-title">Room Created!</h2>
        <p className="step-subtitle">Share the code or link with your friends.</p>
      </div>

      <div className="share-section">
        <div className="share-card">
          <label>Room Code</label>
          <div className="code-display">{roomData.code}</div>
        </div>

        <div className="share-card">
          <label>Sharable Link</label>
          <div className="link-display">
            <span>{roomData.joinLink}</span>
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyToClipboard}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="copy-toast"
              >
                Copied to clipboard!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="participants-section">
        <h3><Users size={18} /> Participants ({players.length})</h3>
        <div className="participants-list">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="participant-item"
            >
              <div className="avatar">{player.name.charAt(0).toUpperCase()}</div>
              <span className="player-name">{player.name}</span>
              {index === 0 && <span className="host-badge">Host</span>}
            </motion.div>
          ))}
          {players.length === 1 && (
            <div className="waiting-text">Waiting for others to join...</div>
          )}
        </div>
      </div>

      <button className="btn btn-start" onClick={handleStartGame} disabled={players.length < 1 || starting}>
        <Play size={20} fill="currentColor" />
        {starting ? 'Starting...' : 'Start Game'}
      </button>
    </motion.div>
  );
};

export default LobbyStep;
