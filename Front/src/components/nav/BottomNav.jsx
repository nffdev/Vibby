import React from 'react';
import { Home, Plus, User } from 'lucide-react'; 
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-between items-center p-1 bg-black/30">
      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/20 flex flex-col items-center"
        onClick={() => navigate('/videoscreen')}
      >
        <Home className="h-16 w-16" />
      </Button>

      <Button className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700">
        <Plus className="h-6 w-6 text-white" />
      </Button>

      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/20 flex flex-col items-center"
        onClick={() => navigate('/profile')}
      >
        <User className="h-16 w-16" />
      </Button>
    </div>
  );
}