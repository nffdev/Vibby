import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step3Bio({ onNext, data }) {
  const [bio, setBio] = useState(data.bio);

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ bio });
  };

  return (
    <motion.form
      onSubmit={manageSubmit}
      className="bg-white rounded-lg p-6 shadow-xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write a short bio about yourself"
        className="w-full p-3 border border-gray-300 rounded-md mb-4 h-32 resize-none"
        maxLength={150}
      />
      <p className="text-right text-sm text-gray-500 mb-4">
        {bio.length}/150 characters
      </p>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Next
      </button>
    </motion.form>
  );
}
