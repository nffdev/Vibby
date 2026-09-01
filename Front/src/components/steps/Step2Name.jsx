import { useState } from 'react';

export default function Step2Name({ onNext, data }) {
  const [name, setName] = useState(data.name);

  const manageSubmit = (e) => {
    e.preventDefault();
    onNext({ name });
  };

  return (
    <form onSubmit={manageSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ton nom complet"
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-colors focus:border-fuchsia-400/50 focus:outline-none"
        required
      />
      <button
        type="submit"
        className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
      >
        Continuer
      </button>
    </form>
  );
}
