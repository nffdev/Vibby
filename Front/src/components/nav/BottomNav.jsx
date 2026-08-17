import React from 'react';
import { Home, Plus, User } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';
import NotificationBell from '@/components/nav/NotificationBell';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex h-[4.5rem] max-w-md items-center justify-around gap-2 border-t border-white/10 bg-black/60 px-4 backdrop-blur-xl md:rounded-t-3xl md:border-x">
      <Button
        variant="ghost"
        size={null}
        aria-label="Accueil"
        className="rounded-full p-3 text-white transition-colors hover:bg-white/10 hover:text-white"
        onClick={() => navigate('/videoscreen')}
      >
        <Home className="h-6 w-6" />
      </Button>

      <Button
        size={null}
        aria-label="Publier"
        className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3.5 text-white shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 active:scale-95"
        onClick={() => navigate('/upload')}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NotificationBell />

      <Button
        variant="ghost"
        size={null}
        aria-label="Profil"
        className="rounded-full p-3 text-white transition-colors hover:bg-white/10 hover:text-white"
        onClick={() => navigate('/profile')}
      >
        <User className="h-6 w-6" />
      </Button>
    </div>
  );
}