import React, { useState } from 'react';

export default function Step3Bio({ onNext, data }) {
  const [bio, setBio] = useState(data.bio);

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ bio });
  };

  return (
    <form onSubmit={manageSubmit} className="space-y-2">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Raconte-toi en une phrase"
        className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-colors focus:border-fuchsia-400/50 focus:outline-none"
        maxLength={150}
      />
      <p className="text-right text-xs text-white/30">{bio.length}/150</p>
      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
      >
        Continuer
      </button>
    </form>
  );
}
