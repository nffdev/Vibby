import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Grid, Heart, Lock, Play, User, UserPlus, Settings, Share2, MessageCircle } from 'lucide-react'

const VideoGrid = ({ videos }) => (
  <div className="grid grid-cols-2 gap-4 p-4">
    {videos.map((video, index) => (
      <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
        <img src={video.thumbnail} alt="" className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="p-2 bg-white">
          <h3 className="font-semibold text-sm truncate">{video.title}</h3>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Play className="w-3 h-3 mr-1" />
            <span>{video.views} views</span>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default function Profile() {
  const [activeTab, setActiveTab] = useState("videos")
  
  const user = {
    username: "@vibby",
    name: "Vibby Profile",
    avatar: "/placeholder.svg",
    bio: "Just a chill guy making videos",
    followers: 10500,
    following: 500,
    likes: 55000
  }

  const videos = Array(6).fill().map((_, i) => ({
    id: i,
    thumbnail: `/placeholder.svg?text=Video${i+1}`,
    title: `Video ${i + 1}`,
    views: `${Math.floor(Math.random() * 100)}K`
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-purple-400 to-pink-500">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.username}</p>
          <p className="mt-2 px-4">{user.bio}</p>
        </div>

        <div className="flex justify-center space-x-4 mt-4">
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
        </div>

        <div className="flex justify-center space-x-8 py-6 border-y border-gray-200 mt-6">
          <div className="text-center">
            <p className="font-semibold text-xl">{user.following.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-xl">{user.followers.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-xl">{user.likes.toLocaleString()}</p>
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
            <VideoGrid videos={videos} />
          </TabsContent>
          <TabsContent value="liked">
            <div className="h-48 flex items-center justify-center text-gray-500">
              Liked videos will appear here
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}
