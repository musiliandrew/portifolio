import { useState, useEffect } from 'react';

const CinematicLoader = ({ isActive, content, onComplete, glitchSound, blipSound, theme }) => {
  const [displayText, setDisplayText] = useState('');
  const [stage, setStage] = useState('initial'); // 'initial', 'access', 'typing'

  useEffect(() => {
    if (!isActive) return;

    // Stage 1: Show "ACCESS GRANTED" with glitch effect
    setStage('initial');
    setTimeout(() => {
      setStage('access');
      glitchSound.play();
      setTimeout(() => {
        // Stage 2: Start typewriter animation
        setStage('typing');
        setDisplayText('');
        let i = 0;
        const type = () => {
          if (i < content.length) {
            setDisplayText(content.slice(0, i + 1));
            blipSound.play();
            i++;
            setTimeout(type, 50);
          } else {
            // Animation complete
            onComplete();
          }
        };
        type();
      }, 1000);
    }, 500);
  }, [isActive, content, glitchSound, blipSound, onComplete]);

  if (!isActive) return null;

  return (
    <div className="h-full w-full">
      {stage === 'initial' && <div>Loading...</div>}
      {stage === 'access' && (
        <div className={`text-2xl glitch ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>
          ACCESS GRANTED
        </div>
      )}
      {stage === 'typing' && (
        <div className={`typewriter ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}>
          {displayText}
        </div>
      )}
    </div>
  );
};

export default CinematicLoader;