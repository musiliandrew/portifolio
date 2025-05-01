import { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';

// Load the WebAssembly file for sql.js
const SQLJS_WASM_URL = '/assets/sql-wasm.wasm';

const SQLSimulator = ({ onRunQuery, theme }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Initialize the database with sample data
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: () => SQLJS_WASM_URL,
        });
        const db = new SQL.Database();

        // Create sample tables
        db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT
          );
          INSERT INTO users VALUES (1, 'Alice', 'alice@example.com');
          INSERT INTO users VALUES (2, 'Bob', 'bob@example.com');
          INSERT INTO users VALUES (3, 'Charlie', 'charlie@example.com');

          CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY,
            user_id INTEGER,
            product TEXT,
            amount REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
          INSERT INTO orders VALUES (1, 1, 'Laptop', 999.99);
          INSERT INTO orders VALUES (2, 1, 'Mouse', 29.99);
          INSERT INTO orders VALUES (3, 2, 'Keyboard', 59.99);
        `);

        // Pass the database to the onRunQuery callback
        onRunQuery(db);
      } catch (err) {
        setError('Failed to initialize database: ' + err.message);
      }
    };

    initDatabase();
  }, [onRunQuery]);

  const handleRunQuery = () => {
    if (!query.trim()) return;

    setError(null);
    setResults(null);

    try {
      const result = onRunQuery(query);
      if (result.error) {
        setError(result.error);
      } else {
        setResults(result);
      }
    } catch (err) {
      setError('Error executing query: ' + err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleRunQuery();
    }
  };

  // Render query results as a table
  const renderResults = () => {
    if (!results || results.length === 0) return <p>No results to display.</p>;

    const firstResult = results[0];
    const columns = firstResult.columns;
    const values = firstResult.values;

    return (
      <table className={`w-full border-collapse ${theme === 'dark' ? 'border-green-500' : 'border-black'}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`border p-2 ${theme === 'dark' ? 'border-green-500' : 'border-black'}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`border p-2 ${theme === 'dark' ? 'border-green-500' : 'border-black'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex flex-col h-[500px] w-[700px] p-4">
      {/* Query Input Area */}
      <div className="mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your SQL query here (e.g., SELECT * FROM users WHERE id = 1;)"
          className={`w-full h-32 p-2 rounded outline-none resize-none ${
            theme === 'dark'
              ? 'bg-gray-800 text-green-500 placeholder-green-700 border-green-500'
              : 'bg-white text-black placeholder-gray-500 border-black'
          } border`}
        />
        <button
          onClick={handleRunQuery}
          className={`mt-2 px-4 py-2 rounded font-semibold ${
            theme === 'dark'
              ? 'bg-green-500 text-black hover:bg-green-300'
              : 'bg-black text-white hover:bg-gray-600'
          }`}
        >
          Run Query (Ctrl+Enter)
        </button>
      </div>

      {/* Results or Error Display */}
      <div
        className={`flex-1 overflow-y-auto p-4 rounded ${
          theme === 'dark' ? 'bg-gray-900 text-green-500' : 'bg-gray-100 text-black'
        }`}
      >
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : results ? (
          renderResults()
        ) : (
          <p>Run a query to see results. Sample tables: `users` (id, name, email), `orders` (order_id, user_id, product, amount).</p>
        )}
      </div>
    </div>
  );
};

export default SQLSimulator;