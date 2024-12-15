import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react'
import Step1Username from '@/components/steps/Step1Username';
import Step2Avatar from '@/components/steps/Step2Avatar';
import Step3Bio from '@/components/steps/Step3Bio';
import Step4Interests from '@/components/steps/Step4Interests';
import ProgressBar from '@/components/ui/progressbar';
import { BASE_API, API_VERSION } from "../../config.json";

const steps = [
  { component: Step1Username, title: 'Choose Username' },
  { component: Step2Avatar, title: 'Upload Avatar' },
  { component: Step3Bio, title: 'Write Bio' },
  { component: Step4Interests, title: 'Select Interests' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    username: '',
    avatar: null,
    bio: '',
    interests: [],
  });

  const postProfileData = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Access token not found.');

      const response  = await fetch(`${BASE_API}/v${API_VERSION}/profiles/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      const result = await response.json();
      console.log('Profile created:', result);

      window.location.replace('/dash/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  }

  const manageNext = (data) => {
    setProfile((prev) => ({ ...prev, ...data }));
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log('Profile created:', { ...profile, ...data });
      postProfileData({...profile, ...data});
    }
  };

  const manageBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-pink-500 flex flex-col">
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              {steps[currentStep].title}
            </h1>
            {React.createElement(steps[currentStep].component, {
              onNext: manageNext,
              data: profile,
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      {currentStep > 0 && (
        <button
          onClick={manageBack}
          className="absolute top-4 left-4 text-white text-xl"
        >
            <ArrowLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
}
