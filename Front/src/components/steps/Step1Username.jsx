import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step1Username({ onNext, data }) {
  const [username, setUsername] = useState(data.username || '');
  const [error, setError] = useState('');

  const validateInput = (value) => {
    if (!/^[a-z]*$/.test(value)) {
      setError('Only lowercase letters are allowed.');
      return false;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    if (value.length > 50) {
      setError('Username must not exceed 50 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const manageChange = (e) => {
    const value = e.target.value;
    if (/^[a-z]*$/.test(value) && value.length <= 50) {
      setUsername(value); 
    }
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    if (validateInput(username)) {
      onNext({ username });
    }
  };

  return (
    <motion.form
      onSubmit={manageSubmit}
      className="bg-white rounded-lg p-6 shadow-xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        value={username}
        onChange={manageChange}
        onBlur={() => validateInput(username)} 
        placeholder="Enter your username"
        className="w-full p-3 border border-gray-300 rounded-md mb-2"
        minLength={3}
        maxLength={50}
        required
      />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Next
      </button>
    </motion.form>
  );
}
