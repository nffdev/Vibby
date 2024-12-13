import React from 'react';

export default function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="w-full bg-white bg-opacity-30 h-2">
      <div
        className="bg-white h-full transition-all duration-300 ease-out"
        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      ></div>
    </div>
  );
}