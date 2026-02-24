import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react'
import Step1Username from '@/components/steps/Step1Username';
import Step2Name from '@/components/steps/Step2Name';
import Step3Avatar from '@/components/steps/Step3Avatar';
import Step4Bio from '@/components/steps/Step4Bio';
import Step5Interests from '@/components/steps/Step5Interests';
import ProgressBar from '@/components/ui/progressbar';
import { toBase64 } from '@/lib/utils';
import { BASE_API, API_VERSION } from '../../config.json';

const steps = [
  { component: Step1Username, title: 'Choose Username' },
  { component: Step2Name, title: 'Enter FullName' },
  { component: Step3Avatar, title: 'Upload Avatar' },
  { component: Step4Bio, title: 'Write Bio' },
  { component: Step5Interests, title: 'Select Interests' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    avatar: null,
    bio: '',
    interests: [],
  });

  const postProfileData = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Access token not found.');

      const avatarStr = data.avatar instanceof File
        ? await toBase64(data.avatar)
        : (typeof data.avatar === 'string' ? data.avatar : null);

      const payload = {
        username: (data.username || '').toLowerCase().trim(),
        name: (data.name || '').trim(),
        bio: typeof data.bio === 'string' ? data.bio : '',
        avatar: avatarStr,
        interests: Array.isArray(data.interests) ? data.interests : []
      };

      const response = await fetch(`${BASE_API}/v${API_VERSION}/profiles/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = 'Failed to create profile';
        try {
          const err = await response.json();
          if (err?.message) errMsg = err.message;
          else if (err?.error) errMsg = err.error;
        } catch {}
        throw new Error(errMsg);
      }

      window.location.replace('/dash/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(error?.message || 'Failed to complete onboarding. Please try again.');
    }
  }

  const manageNext = (data) => {
    setProfile((prev) => ({ ...prev, ...data }));
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
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
