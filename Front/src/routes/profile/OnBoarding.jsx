import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react'
import Step1Username from '@/components/steps/Step1Username';
import Step2Name from '@/components/steps/Step2Name';
import Step3Avatar from '@/components/steps/Step3Avatar';
import Step4Bio from '@/components/steps/Step4Bio';
import Step5Interests from '@/components/steps/Step5Interests';
import ProgressBar from '@/components/ui/progressbar';
import { AuthBackdrop } from '@/components/auth/VideoWall';
import { toBase64 } from '@/lib/utils';
import { BASE_API, API_VERSION } from '../../config.json';

const steps = [
  { component: Step1Username, eyebrow: 'Étape 1 sur 5', title: 'Choisis ton', accent: 'pseudo.' },
  { component: Step2Name, eyebrow: 'Étape 2 sur 5', title: 'Ton', accent: 'nom.' },
  { component: Step3Avatar, eyebrow: 'Étape 3 sur 5', title: 'Une', accent: 'photo.' },
  { component: Step4Bio, eyebrow: 'Étape 4 sur 5', title: 'Deux mots sur', accent: 'toi.' },
  { component: Step5Interests, eyebrow: 'Étape 5 sur 5', title: 'Tes', accent: 'vibes.' },
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

      window.location.replace('/videoscreen');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(error?.message || 'Impossible de finaliser l\'inscription. Réessaie.');
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

  const step = steps[currentStep];

  return (
    <div className="vibby-landing relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#07070a] px-4 py-12 text-white antialiased selection:bg-fuchsia-500/30">
      <AuthBackdrop />
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />

      {currentStep > 0 && (
        <button
          onClick={manageBack}
          aria-label="Retour"
          className="absolute left-6 top-6 z-20 rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-black/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-[26rem]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 40, opacity: 0, filter: 'blur(8px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ x: -40, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{step.eyebrow}</span>
              <h1 className="mb-8 mt-4 text-[2.25rem] font-extrabold leading-[0.95] tracking-tight">
                {step.title}{' '}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                  {step.accent}
                </span>
              </h1>
              {React.createElement(step.component, {
                onNext: manageNext,
                data: profile,
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
