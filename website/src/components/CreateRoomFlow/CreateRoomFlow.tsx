import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

  const handleNicknameNext = (name: string) => {
    setNickname(name);
    setStep(2);
  };

  const handleSettingsNext = async (settings: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Automatically join as host
        const joinResponse = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: result.data.code,
            playerName: nickname,
            playerId: `host-${Date.now()}`
          })
        });
        
        const joinResult = await joinResponse.json();
        if (joinResult.success) {
          setRoomData(joinResult.data);
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Error connecting to backend server. Make sure it is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    console.log('Starting game with data:', roomData);
    // Future implementation: Navigate to game page
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
                onStart={handleStartGame} 
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomFlow;
