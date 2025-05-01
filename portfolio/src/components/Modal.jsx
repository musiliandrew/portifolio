import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AIBot from './AIBot';
import SQLSimulator from './SQLSimulator';

const Modal = ({ isOpen, onClose, type, data, theme }) => {
  const modalRef = useRef(null);

  // Define renderChart before any hooks or early returns
  const renderChart = (chartType, metrics) => {
    const chartData = Object.entries(metrics).map(([key, value]) => ({ name: key, value }));

    if (chartType === 'line') {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <LineChart width={500} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <XAxis dataKey="name" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <YAxis stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: `1px solid ${theme === 'dark' ? '#00ff00' : '#000000'}`, color: theme === 'dark' ? '#00ff00' : '#000000' }} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
          </LineChart>
        </motion.div>
      );
    } else if (chartType === 'bar') {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <BarChart width={500} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <XAxis dataKey="name" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <YAxis stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: `1px solid ${theme === 'dark' ? '#00ff00' : '#000000'}`, color: theme === 'dark' ? '#00ff00' : '#000000' }} />
            <Legend />
            <Bar dataKey="value" fill={theme === 'dark' ? '#00ff00' : '#000000'} />
          </BarChart>
        </motion.div>
      );
    } else if (chartType === 'scatter') {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <ScatterChart width={500} height={300} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <XAxis type="number" dataKey="value" name="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <YAxis type="number" dataKey="value" name="value" stroke={theme === 'dark' ? '#00ff00' : '#000000'} />
            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: `1px solid ${theme === 'dark' ? '#00ff00' : '#000000'}`, color: theme === 'dark' ? '#00ff00' : '#000000' }} />
            <Scatter name="Metrics" data={chartData} fill={theme === 'dark' ? '#00ff00' : '#000000'} />
          </ScatterChart>
        </motion.div>
      );
    }
    return null;
  };

  // Keyboard navigation for modal (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

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
              {type === 'text' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  <p>{data.content}</p>
                </motion.div>
              )}
              {type === 'chart' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-4"
                  >
                    {data.description}
                  </motion.p>
                  {renderChart(data.chart, data.metrics)}
                </motion.div>
              )}
              {type === 'image' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-4"
                  >
                    {data.issuer}
                  </motion.p>
                  <motion.img
                    src={data.image}
                    alt={data.title}
                    className="max-w-full h-auto"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </motion.div>
              )}
              {type === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  {data.content}
                </motion.div>
              )}
              {type === 'ai_assistant' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  <AIBot onSubmit={data.onSubmit} theme={theme} />
                </motion.div>
              )}
              {type === 'sql_simulator' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl mb-4">{data.title}</h2>
                  <SQLSimulator onRunQuery={data.onRunQuery} theme={theme} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;