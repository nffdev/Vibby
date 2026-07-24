import React, { useState } from 'react';

export default function Step1Username({ onNext, data }) {
  const [username, setUsername] = useState(data.username || '');
  const [error, setError] = useState('');

  const validateInput = (value) => {
    if (!/^[a-z]*$/.test(value)) {
      setError('Only lowercase letters are allowed.');
      return false;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    if (value.length > 50) {
      setError('Username must not exceed 50 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const manageChange = (e) => {
    const value = e.target.value;
    if (/^[a-z]*$/.test(value) && value.length <= 50) {
      setUsername(value); 
    }
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    if (validateInput(username)) {
      onNext({ username });
    }
  };

  return (
    <form onSubmit={manageSubmit} className="space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">@</span>
        <input
          type="text"
          value={username}
          onChange={manageChange}
          onBlur={() => validateInput(username)}
          placeholder="pseudo"
          className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-8 pr-4 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-colors focus:border-fuchsia-400/50 focus:outline-none"
          minLength={3}
          maxLength={50}
          required
        />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
      >
        Continuer
      </button>
    </form>
  );
}
