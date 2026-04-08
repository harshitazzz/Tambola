import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const GamePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  return (
    <div className="game-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-content"
      >
        <div className="game-header">
          <h1 className="game-title">Tambola <span>🎱</span></h1>
          <div className="game-code-pill">Room: {code}</div>
        </div>

        <div className="game-board-placeholder">
          <div className="placeholder-icon">🎲</div>
          <h2>Game is starting...</h2>
          <p>The number board will appear here once the game engine is built.</p>
          <p className="placeholder-note">Room Code: <strong>{code}</strong></p>
        </div>

        <button className="btn-leave" onClick={() => navigate('/')}>
          <Home size={18} />
          Leave Game
        </button>
      </motion.div>
    </div>
  );
};

export default GamePage;
