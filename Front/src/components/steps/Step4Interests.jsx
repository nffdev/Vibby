import React, { useState } from 'react';
import { motion } from 'framer-motion';

const interests = [
  'Music', 'Dance', 'Comedy', 'Food', 'Travel', 'Fashion', 'Sports', 'Gaming',
  'Art', 'Beauty', 'Education', 'Technology', 'Fitness', 'Lifestyle', 'Nature'
];

export default function Step4Interests({ onNext, data }) {
  const [selectedInterests, setSelectedInterests] = useState(data.interests);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ interests: selectedInterests });
  };

  return (
    <motion.form
      onSubmit={manageSubmit}
      className="bg-white rounded-lg p-6 shadow-xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedInterests.includes(interest)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
      >
        Finish
      </button>
    </motion.form>
  );
}
