import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  // If URL has a code, validate it on mount
  useEffect(() => {
    if (hasUrlCode && urlCode) {
      fetch(`/api/rooms/get/${urlCode.toUpperCase()}`)
        .then(r => r.json())
        .then(result => {
          if (!result.success) {
            setErrorMsg('Invalid room link. The room may have expired.');
            setTimeout(() => navigate('/'), 3000);
          }
        })
        .catch(() => {
          setErrorMsg('Could not connect to server.');
          setTimeout(() => navigate('/'), 3000);
        });
    }
  }, [hasUrlCode, urlCode, navigate]);

  const handleCodeNext = (code: string) => {
    setErrorMsg(null);
    setRoomCode(code);
    setStep(2);
  };

  const handleNicknameNext = async (nickname: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, playerName: nickname, playerId })
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem('currentPlayerId', playerId);
        if (result.data.status === 'started') {
          navigate(`/game/${roomCode}`);
        } else {
          setRoomData(result.data);
          setStep(3);
        }
      } else {
        setErrorMsg(result.message || 'Failed to join room.');
      }
    } catch {
      setErrorMsg('Could not connect to server.');
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
          {/* Error Toast */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'linear-gradient(135deg, #fff1f1, #ffe4e4)',
                  border: '1.5px solid rgba(220, 50, 50, 0.3)',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: '#991b1b',
                  boxShadow: '0 4px 14px rgba(220, 50, 50, 0.12)',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, color: '#dc3232' }} />
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#991b1b',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
