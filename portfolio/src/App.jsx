import { useState } from 'react';
import Terminal from './components/Terminal';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState('dark'); // Centralized theme state

  const handleEnter = () => {
    setShowWelcome(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {showWelcome ? (
        <WelcomeScreen onEnter={handleEnter} theme={theme} setTheme={setTheme} />
      ) : (
        <Terminal theme={theme} setTheme={setTheme} />
      )}
    </div>
  );
}

export default App;