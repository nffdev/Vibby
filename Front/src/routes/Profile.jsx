import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/nav/BottomNav";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Grid, Heart, UserPlus, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from "@/lib/hooks/useAuth";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolvePlaybackIds } from '@/lib/utils';
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

  const isOwner = user?.id === profileUser?.id;

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
    return <div>Loading...</div>;
  }

  const profileUrl = profileUser.username
    ? `${window.location.origin}/profile?u=${profileUser.username}`
    : `${window.location.origin}/profile?id=${profileUser.id}`;

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
          {isOwner ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <CopyButton variant="outline" size="sm" text={profileUrl} successMessage="Profile link copied" errorMessage="Copy failed">
                <Share2 className="w-4 h-4" />
              </CopyButton>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleFollowToggle}>
                <UserPlus className="w-4 h-4 mr-2" />
                {relationship.i_follow ? 'Unfollow' : (relationship.follows_me ? 'Follow back' : 'Follow')}
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <CopyButton variant="outline" size="sm" text={profileUrl} successMessage="Profile link copied" errorMessage="Copy failed">
                <Share2 className="w-4 h-4" />
              </CopyButton>
            </>
          )}
        </div>

        <div className="flex justify-center space-x-8 py-6 border-y border-gray-200 mt-6">
          <button onClick={loadFollowing} className="text-center">
            <p className="font-semibold text-xl">{profileUser.following?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </button>
          <button onClick={loadFollowers} className="text-center">
            <p className="font-semibold text-xl">{profileUser.followers?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </button>
          <div className="text-center">
            <p className="font-semibold text-xl">{(typeof totalLikes === 'number' ? totalLikes : 0).toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Likes</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
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
                isOwner={isOwner}
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
