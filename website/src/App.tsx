import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Bell, CircleUserRound, PlusCircle, Users } from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';
import Bubble from './components/Bubble';
import CreateRoomFlow from './components/CreateRoomFlow/CreateRoomFlow';
import JoinRoomFlow from './components/JoinRoomFlow/JoinRoomFlow';
import GamePage from './pages/GamePage';
import './App.css';

// ── Home page ──────────────────────────────────────────────────────────────
function HomePage() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const letters = ['T', 'A', 'M', 'B', 'O', 'L', 'A'];

  const bubbles = [
    { num: 23, bottom: '10%', right: '10%', size: 100 },
    { num: 8,  bottom: '65%', right: '6%',  size: 70  },
    { num: 45, top: '20%',    left: '8%',   size: 85  },
    { num: 67, bottom: '30%', left: '12%',  size: 90  },
    { num: 12, top: '15%',    right: '25%', size: 60  },
    { num: 89, bottom: '8%',  left: '35%',  size: 75  },
    { num: 7,  top: '40%',    right: '15%', size: 55  },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } }
  };

  const letterVariants: Variants = {
    hidden: { y: -250, opacity: 0, scale: 0.8, rotate: -20 },
    visible: {
      y: 0, opacity: 1, scale: 1,
      rotate: Math.random() > 0.5 ? 4 : -4,
      transition: { type: 'spring', damping: 10, stiffness: 80, mass: 1.2 }
    }
  };

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const bottomStagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 1.4 } }
  };

  return (
    <>
      <ThreeBackground />

      <header className="header">
        <div className="logo-text">Tambola </div>
        <nav className="nav-links">
          <span className="nav-link active">Lobby</span>
          <span className="nav-link">Rooms</span>
          <span className="nav-link">Profile</span>
        </nav>
        <div className="nav-actions">
          <Bell className="nav-icon" size={24} />
          <CircleUserRound className="nav-icon" size={24} />
        </div>
      </header>

      <main className="main-content">
        <motion.div
          className="title-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, index) => (
            <motion.span key={index} className="title-letter" variants={letterVariants}>
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.div variants={bottomStagger} initial="hidden" animate="visible">
          <motion.p className="subtitle" variants={fadeUpVariants}>
            The high-stakes social game of numbers, luck, and community.
            <br />Play with friends or join players worldwide in the most vibrant lobby.
          </motion.p>

          <motion.div className="button-group" variants={fadeUpVariants}>
            <motion.button
              className="btn btn-create"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateRoom(true)}
            >
              <PlusCircle size={22} color="white" strokeWidth={2.5} />
              Create Room
            </motion.button>

            <motion.button
              className="btn btn-join"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoinRoom(true)}
            >
              <Users size={22} color="var(--tambola-green-dark)" strokeWidth={2.5} />
              Join Room
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {bubbles.map((bubble, i) => (
        <Bubble key={i} {...bubble} delay={2 + i * 0.15} />
      ))}

      <AnimatePresence>
        {showCreateRoom && <CreateRoomFlow onClose={() => setShowCreateRoom(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinRoom && <JoinRoomFlow onClose={() => setShowJoinRoom(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── App router ─────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Direct join via sharable link */}
      <Route path="/join/:code" element={<JoinLinkPage />} />
      {/* Game room */}
      <Route path="/game/:code" element={<GamePage />} />
    </Routes>
  );
}

// Thin wrapper so JoinRoomFlow can read :code from useParams
function JoinLinkPage() {
  return <JoinRoomFlow onClose={() => window.location.href = '/'} />;
}

export default App;
