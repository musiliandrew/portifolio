import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandHistoryModal = ({ isOpen, onClose, history, theme }) => {
  const [focusedHistoryIndex, setFocusedHistoryIndex] = useState(-1);
  const modalRef = useRef(null);
  const historyRefs = useRef([]);

  // Keyboard navigation for the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (history.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedHistoryIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : 0;
            historyRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return newIndex;
          });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedHistoryIndex(prev => {
            const newIndex = prev < history.length - 1 ? prev + 1 : history.length - 1;
            historyRefs.current[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return newIndex;
          });
        }
      }
    };

    if (isOpen) {
      modalRef.current.focus();
      modalRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isOpen, onClose, history, focusedHistoryIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 px-4 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={modalRef}
            tabIndex={0}
            className={`relative border-2 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-full sm:max-w-4xl overflow-y-auto max-h-[90vh] ${theme === 'dark' ? 'bg-black border-green-500' : 'bg-white border-black'}`}
            initial={{ scale: 0.8, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className={`absolute top-2 right-2 ${theme === 'dark' ? 'text-green-500 hover:text-green-300' : 'text-black hover:text-gray-600'}`}
            >
              [X]
            </button>

            <div className={theme === 'dark' ? 'text-green-500' : 'text-black'}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-lg sm:text-xl mb-4">Command History</h2>
                {history.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((cmd, index) => (
                      <motion.div
                        key={index}
                        ref={(el) => (historyRefs.current[index] = el)}
                        className={`p-2 rounded ${focusedHistoryIndex === index ? (theme === 'dark' ? 'bg-green-900 bg-opacity-20' : 'bg-gray-200') : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <span className="font-semibold">{index + 1}. </span>{cmd}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p>No commands in history.</p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandHistoryModal;