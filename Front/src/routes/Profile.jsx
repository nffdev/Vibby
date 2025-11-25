import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/nav/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Grid, Heart, Lock, Play, User, UserPlus, Settings, Share2, MessageCircle, X, MoreVertical } from 'lucide-react';
import { toast } from 'sonner'
import { useAuth } from "@/lib/hooks/useAuth";
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BASE_API, API_VERSION } from "../config.json";

const VideoGrid = ({ videos, onSelect, isOwner, onDeleted }) => {
  const VideoCard = ({ video }) => {
    const [showMenu, setShowMenu] = useState(false)
    return (
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <button className="absolute inset-0" onClick={() => onSelect(video.id)} aria-label="open" />
        <img src={video.thumbnail} alt="" className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <div className="relative">
            <Button variant="ghost" size="icon" className="bg-white/40 hover:bg-white/60" onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}>
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute top-8 right-0 bg-black/70 text-white rounded-md p-2 flex flex-col gap-2 min-w-[140px]">
              {isOwner && (
                <Button 
                  variant="ghost" 
                  className="justify-start text-white hover:bg-white/20" 
                  onClick={async (e) => { 
                    e.stopPropagation(); 
                    try {
                      const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${video.id}`, { method: 'DELETE', headers: { 'Authorization': localStorage.getItem('token') }})
                      const j = await r.json()
                      if (!r.ok) {
                        toast.error(j.message || 'Delete failed')
                      } else {
                        toast.success('Video deleted')
                        onDeleted && onDeleted(video.id)
                      }
                    } catch { toast.error('Network error') }
                    setShowMenu(false);
                  }}
                >
                  Delete video
                </Button>
              )}
                <Button variant="ghost" className="justify-start text-white hover:bg-white/20" onClick={async (e) => { e.stopPropagation(); const url = `${window.location.origin}/video/${video.id}`; try { await navigator.clipboard.writeText(url); toast.success('Link copied'); } catch {} setShowMenu(false); }}>
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="p-2 bg-white">
          <h3 className="font-semibold text-sm truncate">{video.title}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Play className="w-3 h-3 mr-1" />
            <span>{video.views} views</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

const FollowOverlay = ({ title, users, onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-xl z-50 flex flex-col max-h-[80vh]"
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {users.map((user, i) => (
          <div key={i} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
            </div>
            <Button variant="outline" size="sm">
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  </>
);

export default function Profile() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("videos");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [error, setError] = useState('');
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;
      const id = searchParams.get('id');
      const u = searchParams.get('u');
      if (id) {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/profiles/id/${id}`);
        const j = await r.json();
        if (r.ok) setProfileUser(j); else setProfileUser(user);
      } else if (u) {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/profiles/${u}`);
        const j = await r.json();
        if (r.ok) setProfileUser(j); else setProfileUser(user);
      } else {
        setProfileUser(user);
      }
    };
    loadUser();
  }, [user, searchParams]);

  useEffect(() => {
    const loadVideos = async () => {
      if (!profileUser) return;
      setLoadingVideos(true);
      setError('');
      try {
        const isOwner = user?.id === profileUser?.id;
        const url = isOwner ? `${BASE_API}/v${API_VERSION}/videos/me` : `${BASE_API}/v${API_VERSION}/videos/user/${profileUser.id}`;
        const headers = isOwner ? { 'Authorization': localStorage.getItem('token') } : undefined;
        const response = await fetch(url, { headers });
        const json = await response.json();
        if (!response.ok) {
          setError(json.message || 'Impossible to load videos.');
          setVideos([]);
        } else {
          let mapped = json.map(v => ({
            id: v.id,
            title: v.title || 'Untitled',
            views: typeof v.views === 'number' ? v.views : 0,
            playback_id: v.playback_id,
            thumbnail: v.playback_id ? `https://image.mux.com/${v.playback_id}/thumbnail.jpg` : `/placeholder.svg?text=${encodeURIComponent(v.title || 'Video')}`
          }));

          const toResolve = mapped.filter(v => !v.playback_id).map(v => v.id);
          if (toResolve.length) {
            const resolves = await Promise.all(toResolve.map(async (vid) => {
              try {
                const r = await fetch(`${BASE_API}/v${API_VERSION}/videos/${vid}/resolve`, { headers: { 'Authorization': localStorage.getItem('token') } });
                const j = await r.json();
                if (r.ok) return j;
                return null;
              } catch { return null; }
            }));
            const updates = resolves.filter(Boolean);
            if (updates.length) {
              mapped = mapped.map(v => {
                const u = updates.find(x => x.id === v.id);
                return u ? { ...v, playback_id: u.playback_id, thumbnail: u.playback_id ? `https://image.mux.com/${u.playback_id}/thumbnail.jpg` : v.thumbnail } : v;
              });
            }
          }

          setVideos(mapped);
        }
      } catch {
        setError('Network error when loading videos.');
        setVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };
    loadVideos();
  }, [profileUser, user]);

  const mockUsers = Array(20).fill().map((_, i) => ({
    name: `User ${i + 1}`,
    username: `@user${i + 1}`,
    avatar: `/placeholder.svg?text=U${i + 1}`,
    isFollowing: Math.random() > 0.5
  }));

  if (!user || !profileUser) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-purple-400 to-pink-500">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={profileUser.avatar || "/placeholder.svg"} alt={profileUser.name || "User"} />
                <AvatarFallback>{profileUser.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <h1 className="text-2xl font-bold">{profileUser.name || "Anonymous User"}</h1>
          <p className="text-gray-600 mt-1">{profileUser.username ? `@${profileUser.username}` : ''}</p>
          <p className="mt-2 px-4">{profileUser.bio || "No bio available"}</p>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
          {user?.id === profileUser?.id ? (
            <>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-center space-x-8 py-6 border-y border-gray-200 mt-6">
          <button onClick={() => setShowFollowing(true)} className="text-center">
            <p className="font-semibold text-xl">{profileUser.following?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </button>
          <button onClick={() => setShowFollowers(true)} className="text-center">
            <p className="font-semibold text-xl">{profileUser.followers?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </button>
          <div className="text-center">
            <p className="font-semibold text-xl">{profileUser.likes?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Likes</p>
          </div>
        </div>

        <Tabs defaultValue="videos" className="w-full mt-6">
          <TabsList className="w-full flex justify-around border-b">
            <TabsTrigger value="videos" className="flex-1 py-2">
              <Grid className="w-5 h-5 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 py-2">
              <Heart className="w-5 h-5 mr-2" />
              Liked
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            {loadingVideos ? (
              <div className="h-48 flex items-center justify-center text-gray-500">Loading videos...</div>
            ) : videos.length ? (
              <VideoGrid 
                videos={videos} 
                onSelect={(id) => navigate(`/video/${id}`)} 
                isOwner={user?.id === profileUser?.id}
                onDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">{error || 'No video'}</div>
            )}
          </TabsContent>
          <TabsContent value="liked">
            <div className="h-48 flex items-center justify-center text-gray-500">
              Liked videos will appear here
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      <AnimatePresence>
        {showFollowers && (
          <FollowOverlay
            title="Followers"
            users={mockUsers}
            onClose={() => setShowFollowers(false)}
          />
        )}
        {showFollowing && (
          <FollowOverlay
            title="Following"
            users={mockUsers}
            onClose={() => setShowFollowing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
