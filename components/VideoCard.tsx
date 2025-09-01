'use client'

import { useState, useEffect } from 'react'
import { Eye, Heart, MessageCircle, TrendingUp, Bookmark, X } from 'lucide-react'
import { isVideoSaved } from '@/lib/api-albums'

interface VideoCardProps {
  video: {
    id: string
    url: string
    input_url?: string
    creator?: string
    thumbnail?: string | null
    display_url?: string | null
    views: number
    likes?: number
    comments?: number
    followers?: number
    viral_score?: number
    industry: string
    post_type: string
    platform: string
    visual_hook_type?: string | null
    audio_hook_type?: string | null
    written_hook_type?: string | null
    hook?: string | null
    // Legacy fields
    verbal_hook?: string | null
    visual_hook?: string | null
    written_hook?: string | null
    video_created_date?: string | null
  }
  onClick: () => void
  onSave?: () => void
  onRemove?: () => void
}

export default function VideoCard({ video, onClick, onSave, onRemove }: VideoCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [checkingSaved, setCheckingSaved] = useState(true)
  
  // Check if video is saved
  useEffect(() => {
    async function checkSavedStatus() {
      try {
        const savedAlbums = await isVideoSaved(video.id)
        setIsSaved(savedAlbums.length > 0)
      } catch (error) {
        // Silently handle error - likely just means the video isn't saved
      } finally {
        setCheckingSaved(false)
      }
    }
    if (onSave) {
      checkSavedStatus()
    } else {
      setCheckingSaved(false)
    }
  }, [video.id, onSave])
  
  // Proxy Instagram/TikTok images to avoid CORS issues
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null
    // Check if it's an Instagram or TikTok CDN URL that needs proxying
    if (url.includes('cdninstagram.com') || url.includes('fbcdn.net') || url.includes('tiktokcdn.com')) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`
    }
    return url
  }

  const formatViews = (views: number) => {
    if (!views || typeof views !== 'number') return '0'
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`
    }
    return views.toString()
  }

  const getPlatformColor = (platform: string) => {
    const platformLower = (platform || 'unknown').toLowerCase()
    switch (platformLower) {
      case 'tiktok':
        return 'bg-black text-white'
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'youtube':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getNicheColor = (niche: string) => {
    // Check for exact matches first, then fallback to partial matching for flexibility
    if (niche === 'Lifestyle Influencers' || niche.toLowerCase().includes('lifestyle')) {
      return 'bg-purple-500/90 text-white'
    } else if (niche === 'Education & Business' || niche.toLowerCase().includes('education') || niche.toLowerCase().includes('business')) {
      return 'bg-green-500/90 text-white'
    } else if (niche === 'Fitness Influencers' || niche.toLowerCase().includes('fitness')) {
      return 'bg-orange-500/90 text-white'
    } else if (niche === 'Beauty & Fashion' || niche.toLowerCase().includes('beauty') || niche.toLowerCase().includes('fashion')) {
      return 'bg-pink-500/90 text-white'
    } else if (niche === 'Tech Creators' || niche.toLowerCase().includes('tech')) {
      return 'bg-blue-500/90 text-white'
    } else if (niche === 'Gaming Creators' || niche.toLowerCase().includes('gaming') || niche.toLowerCase().includes('game')) {
      return 'bg-red-500/90 text-white'
    } else {
      return 'bg-gray-500/90 text-white'
    }
  }

  const getMainHook = () => {
    // Prefer the full hook, then fall back to legacy fields
    return video.hook || video.verbal_hook || video.written_hook || video.visual_hook || 'No hook available'
  }

  const hasHookTypes = () => {
    return video.visual_hook_type || video.audio_hook_type || video.written_hook_type
  }

  return (
    <div 
      onClick={onClick}
      className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-gray-100 to-gray-200"
    >
      {!imageError && (video.display_url || video.thumbnail) ? (
        <img 
          src={getImageUrl(video.display_url || video.thumbnail) || ''} 
          alt="Video thumbnail"
          className="w-full h-auto"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Click to view analysis</p>
          </div>
        </div>
      )}
      
      {/* Save/Remove Button */}
      {onSave && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSave()
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
          disabled={checkingSaved}
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'fill-purple-600 text-purple-600' : 'text-gray-600'
            }`} 
          />
        </button>
      )}
      
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-3 right-3 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-colors z-10"
          title="Remove from album"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {/* Platform, Category, and Views Badges */}
      <div className="absolute top-3 left-3 space-y-1.5">
        <div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getPlatformColor(video.platform || 'unknown')}`}>
            {video.platform?.toLowerCase() === 'instagram' ? 'Instagram' :
             video.platform?.toLowerCase() === 'tiktok' ? 'TikTok' :
             video.platform?.toLowerCase() === 'youtube' ? 'YouTube' :
             video.platform || 'Unknown'}
          </span>
        </div>
        {video.industry && (
          <div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getNicheColor(video.industry)}`}>
              {video.industry}
            </span>
          </div>
        )}
        {video.post_type && (
          <div>
            <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-500/90 text-white">
              {video.post_type}
            </span>
          </div>
        )}
        <div>
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {video.viral_score || 3}x Viral
          </span>
        </div>
      </div>

      {/* Engagement Stats Bar - Overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2.5">
        <div className="flex items-center justify-around text-xs text-white font-medium">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5" />
            {formatViews(video.views)}
          </span>
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="w-3.5 h-3.5" />
            {video.likes ? formatViews(video.likes) : formatViews(Math.floor(video.views * 0.12))}
          </span>
          <span className="flex items-center gap-1" title="Comments">
            <MessageCircle className="w-3.5 h-3.5" />
            {video.comments ? formatViews(video.comments) : formatViews(Math.floor(video.views * 0.02))}
          </span>
        </div>
      </div>
    </div>
  )
}