import { useState, useEffect, useRef } from 'react';
import { Loader2, Check } from 'lucide-react';
import { BASE_API, API_VERSION } from '../../config.json';

export default function Step1Username({ onNext, data }) {
  const [username, setUsername] = useState(data.username || '');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const checkId = useRef(0);

  const formatError = (value) => {
    if (!/^[a-z]*$/.test(value)) return 'Only lowercase letters are allowed.';
    if (value.length < 3) return 'Username must be at least 3 characters long.';
    if (value.length > 50) return 'Username must not exceed 50 characters.';
    return '';
  };

  useEffect(() => {
    const value = username.trim();
    const formatIssue = formatError(value);

    setError(formatIssue);
    if (formatIssue) {
      setStatus('idle');
      return;
    }

    if (value === (data.username || '').toLowerCase().trim()) {
      setStatus('available');
      return;
    }

    setStatus('checking');
    const id = ++checkId.current;
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/profiles/${encodeURIComponent(value)}`);
        if (id !== checkId.current) return; 
        if (r.ok) {
          setStatus('taken');
          setError('Ce pseudo est déjà pris.');
        } else if (r.status === 404) {
          setStatus('available');
          setError('');
        } else {
          setStatus('idle');
        }
      } catch {
        if (id === checkId.current) setStatus('idle');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [username, data.username]);

  const manageChange = (e) => {
    const value = e.target.value;
    if (/^[a-z]*$/.test(value) && value.length <= 50) {
      setUsername(value);
    }
  };

  const manageSubmit = (e) => {
    e.preventDefault();
    if (formatError(username) || status === 'taken' || status === 'checking') return;
    onNext({ username });
  };

  const blocked = !!error || status === 'checking' || status === 'taken';

  return (
    <form onSubmit={manageSubmit} className="space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">@</span>
        <input
          type="text"
          value={username}
          onChange={manageChange}
          placeholder="pseudo"
          className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-8 pr-11 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-colors focus:border-fuchsia-400/50 focus:outline-none"
          minLength={3}
          maxLength={50}
          required
        />
        {status === 'checking' && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
        {status === 'available' && (
          <Check className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
        )}
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={blocked}
        className="w-full rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
      >
        Continuer
      </button>
    </form>
  );
}
