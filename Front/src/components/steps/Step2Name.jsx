import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step2Name({ onNext, data }) {
  const [name, setName] = useState(data.name);

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ name });
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
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
