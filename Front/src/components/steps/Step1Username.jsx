import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step1Username({ onNext, data }) {
  const [username, setUsername] = useState(data.username);

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ username });
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
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
        required
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Next
      </button>
    </motion.form>
  );
}
