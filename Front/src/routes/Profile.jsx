import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/nav/BottomNav";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Grid, Heart, Share2, MessageCircle, Loader2, Settings, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from "@/lib/hooks/useAuth";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn, resolvePlaybackIds } from '@/lib/utils';
import { BASE_API, API_VERSION } from '../config.json';
import VideoGrid from '@/components/video/VideoGrid';
import FollowOverlay from '@/components/profile/FollowOverlay';
import EditProfileModal from '@/components/profile/EditProfileModal';

function mapVideos(json) {
  return json.map(v => ({
    id: v.id,
    title: v.title || 'Untitled',
    views: typeof v.views === 'number' ? v.views : 0,
    likes: typeof v.likes === 'number' ? v.likes : 0,
    playback_id: v.playback_id,
    thumbnail: v.playback_id ? `https://image.mux.com/${v.playback_id}/thumbnail.jpg` : `/placeholder.svg?text=${encodeURIComponent(v.title || 'Video')}`
  }));
}

async function loadAndResolveVideos(json) {
  let mapped = mapVideos(json);
  const resolved = await resolvePlaybackIds(mapped);
  return resolved.map(v => ({
    ...v,
    thumbnail: v.playback_id ? `https://image.mux.com/${v.playback_id}/thumbnail.jpg` : v.thumbnail
  }));
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const isOwner = user?.id === profileUser?.id;

  useEffect(() => {
    if (isOwner && searchParams.get('edit') === '1') {
      setShowEdit(true);
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [isOwner, searchParams, setSearchParams]);

  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;
      const id = searchParams.get('id');
      const u = searchParams.get('u');
      try {
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
      } catch {
        setProfileUser(user);
      }
    };
    loadUser();
  }, [user, searchParams]);

  useEffect(() => {
    const loadRelationship = async () => {
      if (!profileUser || !user || user.id === profileUser.id) {
        setRelationship({ i_follow: false, follows_me: false });
        return;
      }
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
        const url = isOwner ? `${BASE_API}/v${API_VERSION}/videos/me` : `${BASE_API}/v${API_VERSION}/videos/user/${profileUser.id}`;
        const headers = isOwner ? { 'Authorization': localStorage.getItem('token') } : undefined;
        const response = await fetch(url, { headers });
        const json = await response.json();
        if (!response.ok) {
          setError(json.message || 'Impossible to load videos.');
          setVideos([]);
        } else {
          const mapped = await loadAndResolveVideos(json);
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
      if (!profileUser || activeTab !== 'liked') return;
      setLoadingLiked(true);
      setLikedError('');
      try {
        const url = isOwner ? `${BASE_API}/v${API_VERSION}/likes/me` : `${BASE_API}/v${API_VERSION}/likes/user/${profileUser.id}`;
        const headers = isOwner ? { 'Authorization': localStorage.getItem('token') } : undefined;
        const response = await fetch(url, { headers });
        const json = await response.json();
        if (!response.ok) {
          setLikedError(json.message || 'Impossible to load liked videos.');
          setLikedVideos([]);
        } else {
          const mapped = await loadAndResolveVideos(json);
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

  const toggleFollow = async (targetId) => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/${targetId}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } });
      const j = await r.json();
      if (!r.ok) { toast.error(j.message || 'Action failed'); return null; }
      return j;
    } catch {
      toast.error('Network error');
      return null;
    }
  };

  const handleFollowToggle = async () => {
    const data = await toggleFollow(profileUser.id);
    if (data) {
      setRelationship(prev => ({ ...prev, i_follow: data.following }));
      setProfileUser(prev => ({ ...prev, followers: Math.max(0, (prev.followers || 0) + (data.following ? 1 : -1)) }));
    }
  };

  const loadFollowers = async () => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/followers/${profileUser.id}`, { headers: { 'Authorization': localStorage.getItem('token') } });
      const j = await r.json();
      if (r.ok) setFollowersList(Array.isArray(j) ? j : []);
    } catch { setFollowersList([]); }
    setShowFollowers(true);
  };

  const loadFollowing = async () => {
    try {
      const r = await fetch(`${BASE_API}/v${API_VERSION}/follows/following/${profileUser.id}`, { headers: { 'Authorization': localStorage.getItem('token') } });
      const j = await r.json();
      if (r.ok) setFollowingList(Array.isArray(j) ? j : []);
    } catch { setFollowingList([]); }
    setShowFollowing(true);
  };

  const handleFollowListToggle = async (u, listSetter) => {
    const data = await toggleFollow(u.id);
    if (data) {
      listSetter(prev => prev.map(x => x.id === u.id ? { ...x, isFollowing: data.following } : x));
      if (isOwner) {
        setProfileUser(prev => ({ ...prev, following: Math.max(0, (prev.following || 0) + (data.following ? 1 : -1)) }));
      }
    }
  };

  if (!user || !profileUser) {
    return (
      <div className="vibby-landing flex min-h-screen w-full items-center justify-center bg-[#07070a] text-white">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  const profileUrl = profileUser.username
    ? `${window.location.origin}/profile?u=${profileUser.username}`
    : `${window.location.origin}/profile?id=${profileUser.id}`;

  return (
    <div className="vibby-landing relative min-h-screen w-full bg-[#07070a] pb-28 text-white antialiased selection:bg-fuchsia-500/30">
      <div className="relative h-44 overflow-hidden sm:h-52">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700/50 via-fuchsia-700/30 to-[#07070a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.25),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07070a] to-transparent" />
      </div>

      <div className="mx-auto max-w-2xl px-5">
        <div className="-mt-16 flex flex-col items-center text-center">
          <Avatar className="h-28 w-28 border-4 border-[#07070a] shadow-2xl">
            <AvatarImage src={profileUser.avatar || "/placeholder.svg"} alt={profileUser.name || "User"} />
            <AvatarFallback className="bg-white/10 text-2xl font-semibold text-white/70">{profileUser.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{profileUser.name || "Anonymous User"}</h1>
          {profileUser.username && (
            <p className="mt-0.5 text-sm text-white/40">@{profileUser.username}</p>
          )}
          {profileUser.banned && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
              <Ban className="h-3.5 w-3.5" />
              Compte banni
            </span>
          )}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{profileUser.bio || "Pas encore de bio."}</p>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {isOwner ? (
            <>
              <Button
                variant="ghost"
                size={null}
                onClick={() => setShowEdit(true)}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <CopyButton variant="ghost" size={null} text={profileUrl} successMessage="Profile link copied" errorMessage="Copy failed" className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white">
                <Share2 className="h-4 w-4" />
              </CopyButton>
              <Button
                variant="ghost"
                size={null}
                onClick={() => navigate('/settings')}
                aria-label="Paramètres"
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size={null}
                onClick={handleFollowToggle}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95",
                  relationship.i_follow
                    ? "border border-white/15 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
                    : "bg-white text-black hover:bg-white"
                )}
              >
                {relationship.i_follow ? 'Abonné' : (relationship.follows_me ? 'Suivre en retour' : 'Suivre')}
              </Button>
              <Button
                variant="ghost"
                size={null}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Message"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <CopyButton variant="ghost" size={null} text={profileUrl} successMessage="Profile link copied" errorMessage="Copy failed" className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white">
                <Share2 className="h-4 w-4" />
              </CopyButton>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-4">
          <button onClick={loadFollowing} className="flex flex-col items-center transition-opacity hover:opacity-70">
            <span className="text-xl font-bold tabular-nums">{profileUser.following?.toLocaleString() || 0}</span>
            <span className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-white/40">Abonnements</span>
          </button>
          <button onClick={loadFollowers} className="flex flex-col items-center transition-opacity hover:opacity-70">
            <span className="text-xl font-bold tabular-nums">{profileUser.followers?.toLocaleString() || 0}</span>
            <span className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-white/40">Abonnés</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tabular-nums">{(typeof totalLikes === 'number' ? totalLikes : 0).toLocaleString()}</span>
            <span className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-white/40">J'aime</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 w-full">
          <TabsList className="flex w-full justify-around gap-2 border-b border-white/10 bg-transparent p-0">
            <TabsTrigger
              value="videos"
              className="flex-1 gap-2 rounded-none border-b-2 border-transparent bg-transparent py-3 text-white/40 transition-colors data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Grid className="h-4 w-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="flex-1 gap-2 rounded-none border-b-2 border-transparent bg-transparent py-3 text-white/40 transition-colors data-[state=active]:border-fuchsia-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Heart className="h-4 w-4" />
              J'aime
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            {loadingVideos ? (
              <div className="flex h-48 items-center justify-center gap-2 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : videos.length ? (
              <VideoGrid
                videos={videos}
                onSelect={(id) => navigate(`/video/${id}`)}
                isOwner={isOwner}
                onDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">{error || 'Aucune vidéo'}</div>
            )}
          </TabsContent>
          <TabsContent value="liked">
            {loadingLiked ? (
              <div className="flex h-48 items-center justify-center gap-2 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : likedVideos.length ? (
              <VideoGrid
                videos={likedVideos}
                onSelect={(id) => navigate(`/video/${id}`)}
                isOwner={false}
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-white/40">{likedError || 'Aucune vidéo aimée'}</div>
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
            onToggle={(u) => handleFollowListToggle(u, setFollowersList)}
            showFollowBackLabel={isOwner}
          />
        )}
        {showFollowing && (
          <FollowOverlay
            title="Following"
            users={followingList}
            onClose={() => setShowFollowing(false)}
            onToggle={(u) => handleFollowListToggle(u, setFollowingList)}
            showFollowBackLabel={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
