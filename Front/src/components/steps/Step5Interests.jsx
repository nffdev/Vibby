import { useState } from 'react';
import { cn } from '@/lib/utils';

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
    <form onSubmit={manageSubmit} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              selectedInterests.includes(interest)
                ? 'border-transparent bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white'
            )}
          >
            {interest}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
      >
        Terminer
      </button>
    </form>
  );
}
