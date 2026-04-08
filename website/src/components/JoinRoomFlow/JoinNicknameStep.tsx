import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

interface JoinNicknameStepProps {
  onNext: (nickname: string) => void;
}

const JoinNicknameStep: React.FC<JoinNicknameStepProps> = ({ onNext }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) onNext(nickname.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="step-container"
    >
      <h2 className="step-title">What's your name?</h2>
      <p className="step-subtitle">Choose a nickname before joining the room.</p>

      <form onSubmit={handleSubmit} className="nickname-form">
        <div className="input-group">
          <User className="input-icon" size={20} />
          <input
            type="text"
            placeholder="Enter your nickname..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoFocus
            required
            maxLength={15}
          />
        </div>

        <button type="submit" className="btn btn-next" disabled={!nickname.trim()}>
          Join Room
          <ArrowRight size={20} />
        </button>
      </form>
    </motion.div>
  );
};

export default JoinNicknameStep;
