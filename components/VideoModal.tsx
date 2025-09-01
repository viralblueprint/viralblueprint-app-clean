'use client'

import { useState, useEffect } from 'react'
import { X, Eye, Heart, MessageCircle, TrendingUp, ExternalLink, Users, Hash, Bookmark } from 'lucide-react'
import AlbumModal from './AlbumModal'
import { getAlbums, saveVideoToAlbum, isVideoSaved } from '@/lib/api-albums'

interface VideoModalProps {
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
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [albums, setAlbums] = useState<any[]>([])
  const [savedAlbumIds, setSavedAlbumIds] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [checkingSaved, setCheckingSaved] = useState(true)

  // Check if video is saved when modal opens
  useEffect(() => {
    async function checkSavedStatus() {
      if (!video?.id || !isOpen) return
      
      try {
        const savedAlbums = await isVideoSaved(video.id)
        // isVideoSaved already returns an array of album_ids
        setSavedAlbumIds(savedAlbums)
        setIsSaved(savedAlbums.length > 0)
      } catch (error) {
        // Silently handle error
      } finally {
        setCheckingSaved(false)
      }
    }
    
    if (isOpen) {
      checkSavedStatus()
    }
  }, [video?.id, isOpen])

  if (!isOpen) return null

  const handleSaveClick = async () => {
    try {
      // Load both albums and current saved status
      const [albumsData, savedData] = await Promise.all([
        getAlbums(),
        isVideoSaved(video.id)
      ])
      setAlbums(albumsData)
      // savedData is already an array of album_ids
      setSavedAlbumIds(savedData)
    } catch (error) {
      console.error('Error loading albums:', error)
      setAlbums([])
      setSavedAlbumIds([])
    }
    setShowSaveModal(true)
  }

  const handleSaveToAlbum = async (albumId: string) => {
    if (video) {
      try {
        await saveVideoToAlbum(albumId, video.id)
        // Don't close modal - let user continue adding/removing
        setSavedAlbumIds(prev => [...prev, albumId])
        setIsSaved(true) // Update saved status after successful save
      } catch (error) {
        // Silently handle error
      }
    }
  }
  
  const handleRemoveFromAlbum = async (albumId: string) => {
    if (video) {
      try {
        const { removeVideoFromAlbum } = await import('@/lib/api-albums')
        await removeVideoFromAlbum(albumId, video.id)
        setSavedAlbumIds(prev => {
          const newIds = prev.filter(id => id !== albumId)
          if (newIds.length === 0) {
            setIsSaved(false)
          }
          return newIds
        })
      } catch (error) {
        // Silently handle error
      }
    }
  }

  const handleCreateAlbum = async (name: string, description: string, color: string, icon: string) => {
    // This will be handled by the AlbumModal component
  }

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

  const getPlatformBadge = () => {
    const colors = {
      tiktok: 'bg-black text-white',
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      youtube: 'bg-red-600 text-white'
    }
    return colors[video.platform.toLowerCase()] || 'bg-gray-600 text-white'
  }

  const getNicheColor = (niche: string) => {
    if (!niche) return 'bg-gray-500/90 text-white'
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


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" />
      
      {/* Modal Container - allows scrolling on mobile */}
      <div 
        className="relative bg-white md:rounded-2xl max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col-reverse md:flex-row overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-4 right-4 z-30 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Save Button - Top Left */}
        <button
          onClick={handleSaveClick}
          className="fixed md:absolute top-4 left-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
          disabled={checkingSaved}
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'fill-purple-600 text-purple-600' : 'text-gray-600'
            }`} 
          />
        </button>

        {/* Mobile: Bottom, Desktop: Left Side - Clickable Video Preview */}
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full md:w-2/5 h-64 md:h-auto bg-gray-900 relative flex flex-col cursor-pointer group flex-shrink-0"
        >
          {/* External Link Icon - shows on hover */}
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 p-2 rounded-full">
              <ExternalLink className="w-4 h-4 text-gray-700" />
            </div>
          </div>

          {/* Video Placeholder or Display URL Image */}
          <div className="flex-1 flex items-center justify-center relative">
            {video.display_url || video.thumbnail ? (
              <img 
                src={getImageUrl(video.display_url || video.thumbnail) || ''} 
                alt="Video preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-white">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-70">Click to view original</p>
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{video.creator || '@creator'}</p>
              </div>
            </div>
          </div>
        </a>

        {/* Mobile: Top (appears first), Desktop: Right Side - Analysis */}
        <div className="flex-1 p-6 md:p-8 md:overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Why This Video Went Viral</h2>

          {/* Opening Hook Display */}
          {(video.hook || video.written_hook || video.verbal_hook || video.visual_hook) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Opening Hook:</p>
              <p className="text-lg font-medium text-gray-900 italic">
                "{video.hook || video.written_hook || video.verbal_hook || video.visual_hook}"
              </p>
            </div>
          )}

          {/* Two Sections - Format and Hook Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Format Section */}
            <div className="border border-gray-200 rounded-lg p-4 md:p-6 bg-white shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-center text-lg">Format</h3>
              {video.post_type ? (
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-base font-medium">
                    {video.post_type}
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No format data available</p>
              )}
            </div>

            {/* Hook Type Section */}
            <div className="border border-gray-200 rounded-lg p-4 md:p-6 bg-white shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <Hash className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-center text-lg">Hook Type</h3>
              {(video.visual_hook_type || video.audio_hook_type || video.written_hook_type) ? (
                <div className="space-y-2">
                  {video.visual_hook_type && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {video.visual_hook_type}
                      </span>
                    </div>
                  )}
                  {video.audio_hook_type && video.audio_hook_type !== video.visual_hook_type && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {video.audio_hook_type}
                      </span>
                    </div>
                  )}
                  {video.written_hook_type && video.written_hook_type !== video.visual_hook_type && video.written_hook_type !== video.audio_hook_type && (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {video.written_hook_type}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No hook type data available</p>
              )}
            </div>
          </div>

          {/* Engagement Metrics Bar */}
          <div className="bg-gray-100 rounded-lg p-4 mt-auto">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900">{formatViews(video.views)}</span>
                </div>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900">
                    {video.likes ? formatViews(video.likes) : formatViews(Math.floor(video.views * 0.12))}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Likes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900">
                    {video.comments ? formatViews(video.comments) : formatViews(Math.floor(video.views * 0.02))}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
            </div>
          </div>

          {/* Video Info Stickers - Platform, Industry, Viral Score */}
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-4">
            <div className={`px-4 md:px-6 py-2 md:py-3 rounded-full ${getPlatformBadge()}`}>
              <span className="text-base md:text-xl font-bold">
                {video.platform?.toLowerCase() === 'instagram' ? 'Instagram' :
                 video.platform?.toLowerCase() === 'tiktok' ? 'TikTok' :
                 video.platform?.toLowerCase() === 'youtube' ? 'YouTube' :
                 video.platform || 'Unknown'}
              </span>
            </div>
            {video.industry && (
              <div className={`px-4 md:px-6 py-2 md:py-3 rounded-full ${getNicheColor(video.industry)}`}>
                <span className="text-base md:text-xl font-bold">{video.industry}</span>
              </div>
            )}
            {video.viral_score && (
              <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" />
                <span className="text-base md:text-xl font-bold">{video.viral_score}x Viral</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Album Save Modal */}
      {showSaveModal && (
        <AlbumModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          mode="save"
          videoId={video.id}
          existingAlbums={albums}
          onSaveToAlbum={handleSaveToAlbum}
          onRemoveFromAlbum={handleRemoveFromAlbum}
          onCreateAlbum={handleCreateAlbum}
          savedAlbumIds={savedAlbumIds}
        />
      )}
    </div>
  )
}