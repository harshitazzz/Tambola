import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';

interface NicknameStepProps {
  onNext: (nickname: string) => void;
}

const NicknameStep: React.FC<NicknameStepProps> = ({ onNext }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onNext(nickname.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="step-container"
    >
      <h2 className="step-title">Welcome, Player!</h2>
      <p className="step-subtitle">Choose a cool nickname to start your room.</p>
      
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
          Next
          <ArrowRight size={20} />
        </button>
      </form>
    </motion.div>
  );
};

export default NicknameStep;
