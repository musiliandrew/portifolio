import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Dashboard from './Dashboard';
import CommandHistoryModal from './CommandHistoryModal';
import CinematicLoader from './CinematicLoader';
import filesystemData from '../data/filesystem.json';
import aboutData from '../data/about.json';
import quotesData from '../data/quotes.json';
import skillsData from '../data/skills.json';
import certificationsData from '../data/certifications.json';
import experienceData from '../data/experience.json';
import statsData from '../data/stats.json';
import projectsData from '../data/projects.json';
import aiAssistantData from '../data/ai_assistant.json';
import cvFile from '../data/CV.pdf';

const Terminal = ({ theme, setTheme }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [displayedOutput, setDisplayedOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState(['home']);
  const [isCinematic, setIsCinematic] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [db, setDb] = useState(null);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const blipSound = new Audio('/assets/blip.mp3');
  const glitchSound = new Audio('/assets/terminal_glitch.mp3');
  const ambientHum = new Audio('/assets/ambient_hum.mp3');

  const getPrompt = () => `musili@portfolio:~$ `;

  useEffect(() => {
    if (output.length === 0) {
      setDisplayedOutput([]);
      return;
    }

    const latestOutput = output.slice(-1)[0];
    if (displayedOutput.length >= output.length) return;

    let currentText = '';
    let charIndex = 0;
    const typingSpeed = 50;

    const typeText = () => {
      if (charIndex < latestOutput.length) {
        currentText += latestOutput.charAt(charIndex);
        setDisplayedOutput([...output.slice(0, -1), currentText]);
        charIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setDisplayedOutput([...output]);
      }
    };

    typeText();
  }, [output]);

  useEffect(() => {
    inputRef.current.focus();
    setOutput([
      'Hi, I\'m Musili Andrew, a Fullstack Developer + Data Scientist.',
      'Welcome to my interactive portfolio terminal!',
      'Type \'help\' to see available commands.'
    ]);
    ambientHum.loop = true;
    ambientHum.volume = 0.3;
    ambientHum.play().catch(err => {
      console.warn('Ambient hum playback failed:', err);
      setOutput(prev => [...prev, 'Background audio failed to load. Proceeding without sound.']);
    });

    return () => {
      ambientHum.pause();
      ambientHum.src = '';
      blipSound.pause();
      blipSound.src = '';
      glitchSound.pause();
      glitchSound.src = '';
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [displayedOutput]);

  const getCurrentDir = () => {
    let dir = filesystemData;
    currentPath.forEach(path => {
      dir = dir[path] || {};
    });
    return dir;
  };

  const formatSkills = (skills) => {
    return Object.entries(skills).flatMap(([category, items]) => [
      `${category.replace('_', ' ').toUpperCase()}:`,
      ...items.map(item => `- ${item}`),
      ''
    ]);
  };

  const formatCertifications = (certifications) => {
    return certifications.map(cert => `${cert.title} - ${cert.issuer}`);
  };

  const formatExperience = (experience) => {
    return experience.map(exp => `${exp.title} (${exp.period})\n${exp.description}\n`);
  };

  const formatEducation = (education) => {
    return education.map(edu => `${edu.degree} - ${edu.institution} (${edu.period})`);
  };

  const formatSocials = (contact) => {
    return [
      `LinkedIn: ${contact.linkedin}`,
      `GitHub: ${contact.github.join(', ')}`,
      `Twitter: ${contact.twitter}`,
      `Kaggle: ${contact.kaggle}`,
      `W3Schools: ${contact.w3schools}`,
      `Portfolio: ${contact.portfolio}`
    ];
  };

  const formatStats = (stats) => {
    return [
      `GitHub Projects: ${stats.github_projects}`,
      `Years of Experience: ${stats.years_of_experience}`,
      `Certifications: ${stats.certifications}`,
      `Projects Completed: ${stats.projects_completed}`,
      `Freelance Clients: ${stats.freelance_clients}`,
      `Open Source Contributions: ${stats.open_source_contributions}`
    ];
  };

  const handleProjectClick = (project) => {
    setModalType('chart');
    setModalData(project);
    setModalOpen(true);
  };

  const handleAiAssistantSubmit = (question) => {
    const matchedResponse = aiAssistantData.find(item => 
      question.toLowerCase().includes(item.question.toLowerCase())
    );
    return matchedResponse ? matchedResponse.answer : "I don't have an answer for that. Try asking something else!";
  };

  const handleDownloadCV = () => {
    setOutput([...output, 'Downloading CV...', 'Download complete: Musili_Andrew_Mwau_CV.pdf']);
    const blob = new Blob([cvFile], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Musili_Andrew_Mwau_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    blipSound.play().catch(err => console.warn('Blip sound playback failed:', err));
  };

  const handleDownload = (filename, dir) => {
    if (currentPath.includes('documents') && filename === 'cv.pdf') {
      handleDownloadCV();
    } else if (currentPath.includes('certifications')) {
      const cert = certificationsData.find(c => c.id === dir[filename]);
      if (cert) {
        setOutput([...output, `Downloading ${filename}...`, `Download complete: ${cert.title}.png`]);
        const link = document.createElement('a');
        link.href = cert.image;
        link.download = `${cert.title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        blipSound.play().catch(err => console.warn('Blip sound playback failed:', err));
      } else {
        setOutput([...output, `download: ${filename}: No such file`]);
      }
    } else {
      setOutput([...output, `download: ${filename}: No such file`]);
    }
  };

  const handleRunQuery = (query) => {
    if (!db) {
      return { error: 'Database not initialized.' };
    }
    try {
      const results = db.exec(query);
      return results;
    } catch (e) {
      return { error: e.message };
    }
  };

  const handleCommand = (cmd) => {
    if (!cmd.trim()) return;

    setHistory([...history, cmd]);
    setHistoryIndex(-1);

    const args = cmd.trim().toLowerCase().split(' ');
    const command = args[0];
    const param = args[1];

    blipSound.play().catch(err => console.warn('Blip sound playback failed:', err));

    if (command === 'help') {
      setOutput([...output, `> ${cmd}`, 'Commands: cd, ls, open, clear, help, run, view, dashboard, analyze, history, exit, contact, skills, certs, exp, socials, education, stats, download <filename>, downloadCV, theme, sql']);
    } else if (command === 'clear') {
      setOutput([]);
    } else if (command === 'ls') {
      const dir = getCurrentDir();
      const items = Object.keys(dir).join(' ');
      setOutput([...output, `> ${cmd}`, items || 'dir empty']);
    } else if (command === 'cd') {
      if (!param) {
        setOutput([...output, `> ${cmd}`, 'cd: missing argument']);
        return;
      }
      const dir = getCurrentDir();
      if (param === '..') {
        if (currentPath.length > 1) {
          setCurrentPath(currentPath.slice(0, -1));
        }
      } else if (dir[param]) {
        setCurrentPath([...currentPath, param]);
      } else {
        setOutput([...output, `> ${cmd}`, `cd: ${param}: No such directory`]);
      }
    } else if (command === 'open' && param === 'about.txt') {
      const aboutText = `${aboutData.name}\n${aboutData.bio}\n\nEducation:\n${aboutData.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.period})`).join('\n')}\n\nTarget Roles:\n${aboutData.target_roles.join('\n')}`;
      setIsCinematic(true);
      setOutput([]);
    } else if (command === 'open') {
      const dir = getCurrentDir();
      if (dir[param]) {
        if (currentPath.includes('skills')) {
          const skillKey = dir[param].split('_').slice(1).join('_');
          const skills = skillsData[skillKey] || [];
          setOutput([...output, `> ${cmd}`, ...skills.map(skill => `- ${skill}`)]);
        } else if (currentPath.includes('certifications')) {
          const cert = certificationsData.find(c => c.id === dir[param]);
          if (cert) {
            setOutput([...output, `> ${cmd}`, `${cert.title} - ${cert.issuer}`, `Image: ${cert.image}`]);
          }
        } else if (currentPath.includes('experience')) {
          const exp = experienceData.find(e => e.id === dir[param]);
          if (exp) {
            setOutput([...output, `> ${cmd}`, `${exp.title} (${exp.period})`, exp.description]);
          }
        } else {
          setOutput([...output, `> ${cmd}`, `cat ${param}`, 'File content placeholder']);
        }
      } else {
        setOutput([...output, `> ${cmd}`, `open: ${param}: No such file`]);
      }
    } else if (command === 'contact') {
      const contact = aboutData.contact;
      setOutput([
        ...output,
        `> ${cmd}`,
        'Contact Information:',
        `Phone: ${contact.phone.join(', ')}`,
        `Email: ${contact.email.join(', ')}`,
        `WhatsApp: ${contact.whatsapp}`,
        `LinkedIn: ${contact.linkedin}`,
        `GitHub: ${contact.github.join(', ')}`,
        `Twitter: ${contact.twitter}`,
        `Kaggle: ${contact.kaggle}`,
        `W3Schools: ${contact.w3schools}`,
        `Portfolio: ${contact.portfolio}`
      ]);
    } else if (command === 'skills') {
      setOutput([...output, `> ${cmd}`, ...formatSkills(skillsData)]);
    } else if (command === 'certs') {
      setOutput([...output, `> ${cmd}`, ...formatCertifications(certificationsData)]);
    } else if (command === 'exp') {
      setOutput([...output, `> ${cmd}`, ...formatExperience(experienceData)]);
    } else if (command === 'socials') {
      setOutput([...output, `> ${cmd}`, ...formatSocials(aboutData.contact)]);
    } else if (command === 'education') {
      setOutput([...output, `> ${cmd}`, ...formatEducation(aboutData.education)]);
    } else if (command === 'stats') {
      setOutput([...output, `> ${cmd}`, ...formatStats(statsData)]);
    } else if (command === 'run' && param === 'ai_assistant') {
      setModalType('ai_assistant');
      setModalData({
        title: 'AI Assistant',
        onSubmit: (question) => {
          const answer = handleAiAssistantSubmit(question);
          return answer;
        }
      });
      setModalOpen(true);
    } else if (command === 'sql') {
      setModalType('sql_simulator');
      setModalData({
        title: 'SQL Simulator',
        onRunQuery: (databaseOrQuery) => {
          if (typeof databaseOrQuery === 'string') {
            return handleRunQuery(databaseOrQuery);
          } else {
            setDb(databaseOrQuery);
            return null;
          }
        }
      });
      setModalOpen(true);
    } else if (command === 'view' && currentPath.includes('projects')) {
      const dir = getCurrentDir();
      const project = projectsData.find(p => p.id === dir[param]);
      if (project) {
        setModalType('chart');
        setModalData(project);
        setModalOpen(true);
      } else {
        setOutput([...output, `> ${cmd}`, `view: ${param}: No such project`]);
      }
    } else if (command === 'view' && currentPath.includes('certifications')) {
      const dir = getCurrentDir();
      const cert = certificationsData.find(c => c.id === dir[param]);
      if (cert) {
        setModalType('image');
        setModalData(cert);
        setModalOpen(true);
      } else {
        setOutput([...output, `> ${cmd}`, `view: ${param}: No such certification`]);
      }
    } else if (command === 'dashboard') {
      setModalType('dashboard');
      setModalData({
        title: 'Project Dashboard',
        content: <Dashboard onProjectClick={handleProjectClick} theme={theme} />
      });
      setModalOpen(true);
    } else if (command === 'analyze') {
      setModalType('text');
      setModalData({
        title: 'Analyze',
        content: 'Analysis tools coming soon! This will run the AI assistant for deeper insights.'
      });
      setModalOpen(true);
    } else if (command === 'download') {
      if (!param) {
        setOutput([...output, `> ${cmd}`, 'download: missing argument (e.g., download cv.pdf in home/documents)']);
        return;
      }
      if (currentPath.includes('documents') || currentPath.includes('certifications')) {
        const dir = getCurrentDir();
        if (dir[param]) {
          handleDownload(param, dir);
        } else {
          setOutput([...output, `> ${cmd}`, `download: ${param}: No such file`]);
        }
      } else {
        setOutput([...output, `> ${cmd}`, `download: not in documents or certifications directory`]);
      }
    } else if (command === 'downloadcv') {
      setOutput([...output, `> ${cmd}`]);
      handleDownloadCV();
    } else if (command === 'sudo' && cmd.includes('make me a sandwich')) {
      setOutput([...output, `> ${cmd}`, 'Okay, boss 😎']);
    } else if (command === 'fortune') {
      const quote = quotesData[Math.floor(Math.random() * quotesData.length)];
      setOutput([...output, `> ${cmd}`, quote]);
    } else if (command === 'theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      setOutput([...output, `> ${cmd}`, `Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode.`]);
    } else if (command === 'history') {
      setHistoryModalOpen(true);
    } else {
      setOutput([...output, `> ${cmd}`, `${command}: command not found`]);
    }
  };

  const handleKeyDown = (e) => {
    if (isCinematic) return;

    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setInput(history[history.length - 1 - historyIndex - 1] || '');
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > -1) {
        setHistoryIndex(historyIndex - 1);
        setInput(historyIndex === 0 ? '' : history[history.length - 1 - historyIndex + 1]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = [
        'help', 'cd', 'ls', 'open', 'clear', 'run', 'view', 'dashboard', 'analyze',
        'history', 'exit', 'contact', 'skills', 'certs', 'exp', 'socials', 'education',
        'stats', 'download', 'downloadCV', 'theme', 'sql'
      ];
      const match = commands.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    } else {
      if (e.key.length === 1) {
        blipSound.play().catch(err => console.warn('Blip sound playback failed:', err));
      }
    }
  };

  const aboutText = `${aboutData.name}\n${aboutData.bio}\n\nEducation:\n${aboutData.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.period})`).join('\n')}\n\nTarget Roles:\n${aboutData.target_roles.join('\n')}`;

  return (
    <div className={`relative h-full w-full p-4 ${theme === 'dark' ? 'bg-black text-green-500' : 'bg-white text-black'} text-sm border-2 border-green-500`} style={{ backgroundImage: `url('/assets/rough-overlay.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className={theme === 'dark' ? 'scanlines' : ''} />
      {/* Status Bar Above Command Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">Musili Andrew</span>
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
        </div>
        <span className="text-green-500 text-lg glitch">ACCESS GRANTED</span>
      </div>
      {/* Command Bar with | Separator */}
      <div className="flex flex-wrap mb-2">
        {[
          'help', 'cd', 'ls', 'open', 'clear', 'run', 'view', 'dashboard', 'analyze',
          'history', 'contact', 'skills', 'certs', 'exp', 'socials', 'education',
          'stats', 'download', 'downloadCV', 'theme', 'sql'
        ].map((cmd, index, arr) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => {
                setInput(cmd);
                handleCommand(cmd);
              }}
              className={`px-2 py-1 rounded ${theme === 'dark' ? 'text-green-500 hover:bg-green-900 hover:bg-opacity-20' : 'text-black hover:bg-gray-200'}`}
            >
              {cmd}
            </button>
            {index < arr.length - 1 && (
              <span className={theme === 'dark' ? 'text-green-500 mx-1' : 'text-black mx-1'}>|</span>
            )}
          </div>
        ))}
      </div>
      <div ref={outputRef} className="h-[calc(100%-8rem)] overflow-auto">
        {displayedOutput.map((line, i) => (
          <div key={i} className={line === 'ACCESS GRANTED' ? 'text-lg glitch' : ''}>
            <span className="text-blue-500">{getPrompt()}</span>{line}
          </div>
        ))}
        <CinematicLoader
          isActive={isCinematic}
          content={aboutText}
          onComplete={() => {
            setIsCinematic(false);
            setOutput([aboutText]);
          }}
          glitchSound={glitchSound}
          blipSound={blipSound}
          theme={theme}
        />
      </div>
      {!isCinematic && (
        <div className="mt-2 flex items-center">
          <span className="text-blue-500">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`bg-transparent outline-none w-full ${theme === 'dark' ? 'text-green-500' : 'text-black'}`}
            autoFocus
          />
          <span className={theme === 'dark' ? 'blinking-cursor' : 'blinking-cursor-light'}>█</span>
        </div>
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        data={modalData}
        theme={theme}
      />
      <CommandHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={history}
        theme={theme}
      />
    </div>
  );
};

export default Terminal;