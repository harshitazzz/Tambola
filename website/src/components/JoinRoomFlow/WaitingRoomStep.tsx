import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Zap, Hand, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Rule {
  name: string;
  count: number;
  points: number;
  description: string;
}

interface GameSettings {
  callingMethod: 'auto' | 'manual';
  autoInterval?: number | null;
  rules: Rule[];
}

interface Player {
  id: string;
  name: string;
}

interface WaitingRoomStepProps {
  roomCode: string;
  initialSettings: GameSettings;
  initialPlayers: Player[];
  playerId: string;
}

const WaitingRoomStep: React.FC<WaitingRoomStepProps> = ({
  roomCode,
  initialSettings,
  initialPlayers,
  playerId
}) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [settings] = useState<GameSettings>(initialSettings);
  const navigate = useNavigate();

  useEffect(() => {
    import('../../infrastructure/SocketService').then(({ socketService }) => {
      socketService.joinRoom(roomCode);

      const fetchState = async () => {
        try {
          const res = await fetch(`/api/rooms/get/${roomCode}`);
          const result = await res.json();
          if (result.success) {
            setPlayers(result.data.players);
            if (result.data.status === 'started') {
              navigate(`/game/${roomCode}`);
            }
          }
        } catch (err) {
          console.error('Fetch error:', err);
        }
      };

      // Call immediately on mount to check if game is already started
      fetchState();

      const onPlayerJoined = () => fetchState();
      const onGameStarted = () => navigate(`/game/${roomCode}`);

      socketService.on('player_joined', onPlayerJoined);
      socketService.on('game_started', onGameStarted);

      return () => {
        socketService.off('player_joined', onPlayerJoined);
        socketService.off('game_started', onGameStarted);
      };
    });
  }, [roomCode, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="waiting-room"
    >
      {/* Header */}
      <div className="waiting-header">
        <div className="pulse-dot" />
        <h2 className="step-title">You're in! 🎉</h2>
        <p className="step-subtitle">Waiting for the host to start the game...</p>
      </div>

      {/* Room Code */}
      <div className="room-code-badge">
        <span className="room-code-label">Room Code</span>
        <span className="room-code-value">{roomCode}</span>
      </div>

      {/* Game Settings (Read-Only) */}
      <div className="settings-preview">
        <h3 className="preview-title">Game Settings</h3>

        <div className="settings-preview-grid">
          <div className="preview-chip">
            {settings.callingMethod === 'auto' ? <Zap size={15} /> : <Hand size={15} />}
            <span>{settings.callingMethod === 'auto' ? 'Auto Call' : 'Manual Call'}</span>
          </div>
          {settings.callingMethod === 'auto' && settings.autoInterval && (
            <div className="preview-chip">
              <Clock size={15} />
              <span>Every {settings.autoInterval}s</span>
            </div>
          )}
        </div>

        <h4 className="rules-preview-title"><Trophy size={14} /> Active Rules</h4>
        <div className="rules-preview-list">
          {settings.rules.map((rule, i) => (
            <div key={i} className="rule-preview-item">
              <div className="rule-preview-left">
                <span className="rule-preview-name">{rule.name}</span>
                {rule.count > 1 && <span className="rule-count-badge">×{rule.count}</span>}
              </div>
              <span className="rule-preview-points">{rule.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="participants-section">
        <h3><Users size={18} /> Players ({players.length})</h3>
        <div className="participants-list">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="participant-item"
            >
              <div className={`avatar ${player.id === playerId ? 'you' : ''}`}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="player-name">
                {player.name}
                {player.id === playerId && <span className="you-label"> (You)</span>}
              </span>
              {index === 0 && <span className="host-badge">Host</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer waiting message */}
      <div className="waiting-footer">
        <div className="waiting-anim">
          <span /><span /><span />
        </div>
        <p>Waiting for host to start the game</p>
      </div>
    </motion.div>
  );
};

export default WaitingRoomStep;
