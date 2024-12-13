import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step2Avatar({ onNext, data }) {
  const [avatar, setAvatar] = useState(data.avatar);
  const [previewUrl, setPreviewUrl] = useState(null);

  const manageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ avatar });
  };

  return (
    <motion.form
      onSubmit={manageSubmit}
      className="bg-white rounded-lg p-6 shadow-xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar preview"
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>
      <input
        type="file"
        onChange={manageFileChange}
        accept="image/*"
        className="w-full p-3 border border-gray-300 rounded-md mb-4"
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
