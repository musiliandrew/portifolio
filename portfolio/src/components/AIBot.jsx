import { useState, useEffect, useRef } from 'react';

const AIBot = ({ onSubmit, theme }) => {
  const [chatHistory, setChatHistory] = useState([
    { sender: 'AI', message: 'Hello! I am your AI Assistant. Ask me anything about this portfolio!' }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  // Scroll to the bottom of the chat history when new messages are added
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Add user's question to chat history
    setChatHistory([...chatHistory, { sender: 'User', message: input }]);

    // Get AI response using the onSubmit callback
    const aiResponse = onSubmit(input);

    // Add AI response to chat history
    setChatHistory(prev => [...prev, { sender: 'AI', message: aiResponse }]);

    // Clear input field
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-[600px] p-4">
      {/* Chat History */}
      <div
        ref={chatRef}
        className={`flex-1 overflow-y-auto p-4 rounded mb-4 ${
          theme === 'dark' ? 'bg-gray-900 text-green-500' : 'bg-gray-100 text-black'
        }`}
      >
        {chatHistory.map((entry, index) => (
          <div
            key={index}
            className={`mb-2 ${
              entry.sender === 'User' ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded ${
                entry.sender === 'User'
                  ? theme === 'dark'
                    ? 'bg-green-700 text-white'
                    : 'bg-blue-200 text-black'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-green-500'
                    : 'bg-white text-black'
              }`}
            >
              <strong>{entry.sender}:</strong> {entry.message}
            </span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className={`flex-1 p-2 rounded outline-none ${
            theme === 'dark'
              ? 'bg-gray-800 text-green-500 placeholder-green-700'
              : 'bg-white text-black placeholder-gray-500 border border-gray-300'
          }`}
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded font-semibold ${
            theme === 'dark'
              ? 'bg-green-500 text-black hover:bg-green-300'
              : 'bg-black text-white hover:bg-gray-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIBot;