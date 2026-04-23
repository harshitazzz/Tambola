import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import NicknameStep from './NicknameStep';
import SettingsStep from './SettingsStep';
import LobbyStep from './LobbyStep';

interface CreateRoomFlowProps {
  onClose: () => void;
}

const CreateRoomFlow: React.FC<CreateRoomFlowProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleNicknameNext = (name: string) => {
    setNickname(name);
    setStep(2);
  };

  const handleSettingsNext = async (settings: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Automatically join as host
        const hostId = `host-${Date.now()}`;
        const joinResponse = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: result.data.code,
            playerName: nickname,
            playerId: hostId
          })
        });
        
        const joinResult = await joinResponse.json();
        if (joinResult.success) {
          localStorage.setItem('currentPlayerId', hostId);
          setRoomData(joinResult.data);
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      setErrorMsg('Error connecting to backend server. Make sure it is running on port 3000.');
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
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

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
              <div className="spinner"></div>
              <p>Setting up your room...</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <NicknameStep key="step1" onNext={handleNicknameNext} />
            )}
            {step === 2 && (
              <SettingsStep 
                key="step2" 
                onNext={handleSettingsNext} 
                onBack={() => setStep(1)} 
              />
            )}
            {step === 3 && (
              <LobbyStep 
                key="step3" 
                roomData={roomData} 
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomFlow;
