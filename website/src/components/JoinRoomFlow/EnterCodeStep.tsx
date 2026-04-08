import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, ArrowRight } from 'lucide-react';

interface EnterCodeStepProps {
  onNext: (code: string) => void;
}

const EnterCodeStep: React.FC<EnterCodeStepProps> = ({ onNext }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Room code must be 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rooms/get/${trimmed}`);
      const result = await res.json();
      if (result.success) {
        onNext(trimmed);
      } else {
        setError('Room not found. Please check the code.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="step-container"
    >
      <h2 className="step-title">Join a Room</h2>
      <p className="step-subtitle">Enter the 6-character room code from your host.</p>

      <form onSubmit={handleSubmit} className="nickname-form">
        <div className={`input-group ${error ? 'error' : ''}`}>
          <Hash className="input-icon" size={20} />
          <input
            type="text"
            placeholder="e.g. AB12CD"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            maxLength={6}
            autoFocus
            required
          />
        </div>
        {error && <p className="input-error">{error}</p>}
        <button type="submit" className="btn btn-next" disabled={!code.trim() || loading}>
          {loading ? 'Checking...' : 'Next'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </motion.div>
  );
};

export default EnterCodeStep;
