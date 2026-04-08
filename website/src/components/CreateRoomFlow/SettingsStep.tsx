import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Settings2, Info } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  count: number;
  points: number;
  enabled: boolean;
  description: string;
}

interface SettingsStepProps {
  onNext: (settings: any) => void;
  onBack: () => void;
}

const DEFAULT_RULES: Rule[] = [
  { id: 'housefull', name: 'Housefull', count: 1, points: 500, enabled: true, description: 'All 15 numbers on the ticket are struck off.' },
  { id: 'first_row', name: '1st Row', count: 1, points: 100, enabled: true, description: 'All 5 numbers in the top row are struck off.' },
  { id: 'second_row', name: '2nd Row', count: 1, points: 100, enabled: true, description: 'All 5 numbers in the middle row are struck off.' },
  { id: 'third_row', name: '3rd Row', count: 1, points: 100, enabled: true, description: 'All 5 numbers in the bottom row are struck off.' },
  { id: 'corners', name: 'Corners', count: 1, points: 150, enabled: true, description: 'The four corner numbers (1st and last of top and bottom rows) are struck off.' },
  { id: 'biggest_num', name: 'Biggest Num', count: 1, points: 50, enabled: false, description: 'The highest number on the ticket is struck off.' },
  { id: 'smallest_num', name: 'Smallest Num', count: 1, points: 50, enabled: false, description: 'The lowest number on the ticket is struck off.' },
];

const SettingsStep: React.FC<SettingsStepProps> = ({ onNext, onBack }) => {
  const [callingMethod, setCallingMethod] = useState<'auto' | 'manual'>('auto');
  const [autoInterval, setAutoInterval] = useState<3 | 5 | 7>(5);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRule = (id: string, field: 'count' | 'points', value: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = () => {
    onNext({
      callingMethod,
      autoInterval: callingMethod === 'auto' ? autoInterval : null,
      rules: rules.filter(r => r.enabled)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="settings-container"
    >
      <div className="settings-header">
        <button className="btn-icon" onClick={onBack} title="Go back">
          <ArrowLeft size={24} />
        </button>
        <h2 className="step-title">Game Settings</h2>
        <div style={{ width: 44 }} /> {/* Spacer */}
      </div>

      <div className="settings-section">
        <h3><Settings2 size={18} /> Calling Method</h3>
        <div className="toggle-group">
          <button 
            className={`toggle-btn ${callingMethod === 'auto' ? 'active' : ''}`}
            onClick={() => setCallingMethod('auto')}
          >
            Auto
          </button>
          <button 
            className={`toggle-btn ${callingMethod === 'manual' ? 'active' : ''}`}
            onClick={() => setCallingMethod('manual')}
          >
            Manual
          </button>
        </div>

        {callingMethod === 'auto' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="interval-picker"
          >
            <span className="interval-label">Call next number every:</span>
            <div className="interval-pills">
              {([3, 5, 7] as const).map(sec => (
                <button
                  key={sec}
                  className={`interval-pill ${autoInterval === sec ? 'active' : ''}`}
                  onClick={() => setAutoInterval(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="rules-section">
        <h3>Rules & Points</h3>
        <div className="rules-grid">
          {rules.map((rule) => (
            <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : ''}`}>
              <div className="rule-main">
                <div className="rule-info-header">
                  <div className="rule-checkbox" onClick={() => toggleRule(rule.id)}>
                    {rule.enabled && <Check size={14} color="white" />}
                  </div>
                  <span className="rule-name">{rule.name}</span>
                  <button 
                    className="info-icon"
                    onClick={() => setActiveHelp(activeHelp === rule.id ? null : rule.id)}
                  >
                    <Info size={16} />
                  </button>
                </div>
                
                <AnimatePresence>
                  {activeHelp === rule.id && (
                    <motion.p 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="rule-description"
                    >
                      {rule.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="rule-inputs">
                  <div className="input-field">
                    <label>Count</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={rule.count}
                      onChange={(e) => updateRule(rule.id, 'count', parseInt(e.target.value) || 1)}
                      disabled={!rule.enabled}
                    />
                  </div>
                  <div className="input-field">
                    <label>Points</label>
                    <input 
                      type="number" 
                      step="50"
                      value={rule.points}
                      onChange={(e) => updateRule(rule.id, 'points', parseInt(e.target.value) || 0)}
                      disabled={!rule.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-next" onClick={handleSubmit}>
        Next
        <ArrowRight size={20} />
      </button>
    </motion.div>
  );
};

export default SettingsStep;
