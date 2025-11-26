import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/nav/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ActionMenu from "@/components/ui/ActionMenu";
import CopyButton from "@/components/ui/CopyButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Grid, Heart, Lock, Play, User, UserPlus, Settings, Share2, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner'
import { useAuth } from "@/lib/hooks/useAuth";
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { BASE_API, API_VERSION } from "../config.json";

const VideoGrid = ({ videos, onSelect, isOwner, onDeleted }) => {
  const VideoCard = ({ video }) => {
    return (
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <button className="absolute inset-0" onClick={() => onSelect(video.id)} aria-label="open" />
        <img src={video.thumbnail} alt="" className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <ActionMenu
            stopPropagation
            triggerClassName="bg-white/40 hover:bg-white/60"
            menuClassName="bg-black/70 text-white"
          >
            {({ close }) => (
              <>
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
                      close();
                    }}
                  >
                    Delete video
                  </Button>
                )}
                <CopyButton
                  variant="ghost"
                  size="default"
                  className="justify-start text-white hover:bg-white/20"
                  stopPropagation
                  text={`${window.location.origin}/video/${video.id}`}
                  onCopied={() => { close() }}
                  successMessage="Link copied"
                >
                  Share
                </CopyButton>
              </>
            )}
          </ActionMenu>
        </div>
        <div className="p-2 bg-white">
          <h3 className="font-semibold text-sm truncate">{video.title}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Play className="w-3 h-3 mr-1" />
            <span>{typeof video.views === 'number' ? video.views.toLocaleString() : 0} views</span>
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

const FollowOverlay = ({ title, users, onClose, onToggle, showFollowBackLabel }) => (
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
            <div className="flex-1 flex flex-col">
              <Link to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`} onClick={onClose} className="text-sm font-medium no-underline">
                {user.name}
              </Link>
              <Link to={user.username ? `/profile?u=${user.username}` : `/profile?id=${user.id}`} onClick={onClose} className="text-xs text-gray-500 dark:text-gray-400 no-underline">
                {user.username}
              </Link>
            </div>
            <Button variant="outline" size="sm" onClick={() => onToggle && onToggle(user)}>
              {user.isFollowing ? 'Unfollow' : (showFollowBackLabel ? 'Follow back' : 'Follow')}
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
  const [showEdit, setShowEdit] = useState(false);
  const [videos, setVideos] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [likedVideos, setLikedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [error, setError] = useState('');
  const [likedError, setLikedError] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [relationship, setRelationship] = useState({ i_follow: false, follows_me: false });
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

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
    const loadRelationship = async () => {
      if (!profileUser || !user) return;
      if (user.id === profileUser.id) { setRelationship({ i_follow: false, follows_me: false }); return; }
      try {
        const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/relationship/${profileUser.id}`, { headers: { 'Authorization': localStorage.getItem('token') } });
        const j = await r.json();
        if (r.ok) setRelationship(j);
      } catch {}
    };
    loadRelationship();
  }, [profileUser, user]);

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
            likes: typeof v.likes === 'number' ? v.likes : 0,
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
          setTotalLikes(mapped.reduce((acc, v) => acc + (typeof v.likes === 'number' ? v.likes : 0), 0));
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

  useEffect(() => {
    const loadLiked = async () => {
      if (!profileUser) return;
      if (activeTab !== 'liked') return;
      setLoadingLiked(true);
      setLikedError('');
      try {
        const isOwner = user?.id === profileUser?.id;
        const url = isOwner ? `${BASE_API}/v${API_VERSION}/likes/me` : `${BASE_API}/v${API_VERSION}/likes/user/${profileUser.id}`;
        const headers = isOwner ? { 'Authorization': localStorage.getItem('token') } : undefined;
        const response = await fetch(url, { headers });
        const json = await response.json();
        if (!response.ok) {
          setLikedError(json.message || 'Impossible to load liked videos.');
          setLikedVideos([]);
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

          setLikedVideos(mapped);
        }
      } catch {
        setLikedError('Network error when loading liked videos.');
        setLikedVideos([]);
      } finally {
        setLoadingLiked(false);
      }
    };
    loadLiked();
  }, [activeTab, profileUser, user]);

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
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <CopyButton
                variant="outline"
                size="sm"
                className=""
                text={profileUser.username ? `${window.location.origin}/profile?u=${profileUser.username}` : `${window.location.origin}/profile?id=${profileUser.id}`}
                successMessage="Profile link copied"
                errorMessage="Copy failed"
              >
                <Share2 className="w-4 h-4" />
              </CopyButton>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/${profileUser.id}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } });
                    const j = await r.json();
                    if (!r.ok) {
                      toast.error(j.message || 'Action failed');
                    } else {
                      setRelationship(prev => ({ ...prev, i_follow: j.following }));
                      setProfileUser(prev => ({ ...prev, followers: Math.max(0, (prev.followers || 0) + (j.following ? 1 : -1)) }));
                    }
                  } catch { toast.error('Network error'); }
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {relationship.i_follow ? 'Unfollow' : (relationship.follows_me ? 'Follow back' : 'Follow')}
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <CopyButton
                variant="outline"
                size="sm"
                className=""
                text={profileUser.username ? `${window.location.origin}/profile?u=${profileUser.username}` : `${window.location.origin}/profile?id=${profileUser.id}`}
                successMessage="Profile link copied"
                errorMessage="Copy failed"
              >
                <Share2 className="w-4 h-4" />
              </CopyButton>
            </>
          )}
        </div>

        <div className="flex justify-center space-x-8 py-6 border-y border-gray-200 mt-6">
          <button onClick={async () => {
            try {
              const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/following/${profileUser.id}`, { headers: { 'Authorization': localStorage.getItem('token') } });
              const j = await r.json();
              if (r.ok) setFollowingList(Array.isArray(j) ? j : []);
            } catch { setFollowingList([]); }
            setShowFollowing(true);
          }} className="text-center">
            <p className="font-semibold text-xl">{profileUser.following?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </button>
          <button onClick={async () => {
            try {
              const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/followers/${profileUser.id}`, { headers: { 'Authorization': localStorage.getItem('token') } });
              const j = await r.json();
              if (r.ok) setFollowersList(Array.isArray(j) ? j : []);
            } catch { setFollowersList([]); }
            setShowFollowers(true);
          }} className="text-center">
            <p className="font-semibold text-xl">{profileUser.followers?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </button>
          <div className="text-center">
            <p className="font-semibold text-xl">{(typeof totalLikes === 'number' ? totalLikes : 0).toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Likes</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full mt-6">
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
            {loadingLiked ? (
              <div className="h-48 flex items-center justify-center text-gray-500">Loading liked videos...</div>
            ) : likedVideos.length ? (
              <VideoGrid 
                videos={likedVideos} 
                onSelect={(id) => navigate(`/video/${id}`)} 
                isOwner={false}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">{likedError || 'No liked video'}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profileUser}
            onClose={() => setShowEdit(false)}
            onUpdated={(p) => setProfileUser(p)}
          />
        )}
        {showFollowers && (
          <FollowOverlay
            title="Followers"
            users={followersList}
            onClose={() => setShowFollowers(false)}
            onToggle={async (u) => {
              try {
                const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/${u.id}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } });
                const j = await r.json();
                if (!r.ok) {
                  toast.error(j.message || 'Action failed');
                } else {
                  setFollowersList(prev => prev.map(x => x.id === u.id ? { ...x, isFollowing: j.following } : x));
                  if (user.id === profileUser.id) {
                    setProfileUser(prev => ({ ...prev, following: Math.max(0, (prev.following || 0) + (j.following ? 1 : -1)) }));
                  }
                }
              } catch { toast.error('Network error'); }
            }}
            showFollowBackLabel={user.id === profileUser.id}
          />
        )}
        {showFollowing && (
          <FollowOverlay
            title="Following"
            users={followingList}
            onClose={() => setShowFollowing(false)}
            onToggle={async (u) => {
              try {
                const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/${u.id}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } });
                const j = await r.json();
                if (!r.ok) {
                  toast.error(j.message || 'Action failed');
                } else {
                  setFollowingList(prev => prev.map(x => x.id === u.id ? { ...x, isFollowing: j.following } : x));
                  if (user.id === profileUser.id) {
                    setProfileUser(prev => ({ ...prev, following: Math.max(0, (prev.following || 0) + (j.following ? 1 : -1)) }));
                  }
                }
              } catch { toast.error('Network error'); }
            }}
            showFollowBackLabel={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onUpdated }) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const manageAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await toBase64(file);
      setAvatar(b64);
    } catch {}
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { name, bio };
      if (avatar) body.avatar = avatar;
      const r = await fetch(`${BASE_API}/v${API_VERSION}/profiles/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.message || 'Update failed');
        toast.error(j.message || 'Update failed');
      } else {
        toast.success('Profile updated');
        onUpdated && onUpdated(j);
        onClose();
      }
    } catch {
      setError('Network error');
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || "/placeholder.svg"} />
              <AvatarFallback>{(name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="inline-block">
              <input type="file" accept="image/*" className="hidden" onChange={manageAvatarChange} />
              <span className="px-3 py-2 border rounded-md cursor-pointer">Change picture</span>
            </label>
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} minLength={3} maxLength={50} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} />
            <div className="text-right text-xs text-gray-500">{bio.length}/150</div>
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
