import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import EnterCodeStep from './EnterCodeStep';
import JoinNicknameStep from './JoinNicknameStep';
import WaitingRoomStep from './WaitingRoomStep';

interface JoinRoomFlowProps {
  onClose: () => void;
}

const JoinRoomFlow: React.FC<JoinRoomFlowProps> = ({ onClose }) => {
  // If accessed via /join/:code URL, pre-fill the code and skip step 1
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const hasUrlCode = Boolean(urlCode);

  const [step, setStep] = useState<number>(hasUrlCode ? 2 : 1);
  const [roomCode, setRoomCode] = useState<string>(urlCode?.toUpperCase() || '');
  const [playerId] = useState(() => `player-${Date.now()}`);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // If URL has a code, validate it on mount
  useEffect(() => {
    if (hasUrlCode && urlCode) {
      fetch(`/api/rooms/get/${urlCode.toUpperCase()}`)
        .then(r => r.json())
        .then(result => {
          if (!result.success) {
            alert('Invalid room link. The room may have expired.');
            navigate('/');
          }
        })
        .catch(() => {
          alert('Could not connect to server.');
          navigate('/');
        });
    }
  }, [hasUrlCode, urlCode, navigate]);

  const handleCodeNext = (code: string) => {
    setRoomCode(code);
    setStep(2);
  };

  const handleNicknameNext = async (nickname: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerName: nickname, playerId })
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem('currentPlayerId', playerId);
        setRoomData(result.data);
        setStep(3);
      } else {
        alert(result.message || 'Failed to join room.');
      }
    } catch {
      alert('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal-content"
      >
        {step < 3 && (
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        )}

        <div className="flow-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <p>Joining room...</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <EnterCodeStep key="code" onNext={handleCodeNext} />
            )}
            {step === 2 && (
              <JoinNicknameStep key="nickname" onNext={handleNicknameNext} />
            )}
            {step === 3 && roomData && (
              <WaitingRoomStep
                key="waiting"
                roomCode={roomCode}
                initialSettings={roomData.settings}
                initialPlayers={roomData.players}
                playerId={playerId}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoomFlow;
