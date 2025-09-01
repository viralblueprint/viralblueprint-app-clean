'use client'

import { useState } from 'react'
import VideoCard from './VideoCard'
import VideoModal from './VideoModal'
import AlbumModal from './AlbumModal'
import { getAlbums, saveVideoToAlbum, removeVideoFromAlbum, isVideoSaved } from '@/lib/api-albums'

interface VideoGridProps {
  videos: any[]
  showSaveButton?: boolean
  showRemoveButton?: boolean
  onRemoveVideo?: (videoId: string) => void
}

export default function VideoGrid({ videos, showSaveButton = true, showRemoveButton = false, onRemoveVideo }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [videoToSave, setVideoToSave] = useState<any>(null)
  const [albums, setAlbums] = useState<any[]>([])
  const [savedAlbumIds, setSavedAlbumIds] = useState<string[]>([])

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
  }

  const handleSaveClick = async (video: any) => {
    setVideoToSave(video)
    // Load albums and check saved status
    try {
      const [albumsData, savedData] = await Promise.all([
        getAlbums(),
        isVideoSaved(video.id)
      ])
      setAlbums(albumsData)
      // isVideoSaved already returns an array of album_ids
      setSavedAlbumIds(savedData)
    } catch (error) {
      // If error loading albums, still show modal with empty list
      setAlbums([])
      setSavedAlbumIds([])
    }
    setShowSaveModal(true)
  }

  const handleSaveToAlbum = async (albumId: string) => {
    if (videoToSave) {
      try {
        const result = await saveVideoToAlbum(albumId, videoToSave.id)
        // Update saved albums list
        setSavedAlbumIds(prev => [...prev, albumId])
      } catch (error) {
        // Silently handle error
      }
    }
  }
  
  const handleRemoveFromAlbum = async (albumId: string) => {
    if (videoToSave) {
      try {
        await removeVideoFromAlbum(albumId, videoToSave.id)
        setSavedAlbumIds(prev => prev.filter(id => id !== albumId))
      } catch (error) {
        // Silently handle error
      }
    }
  }

  const handleCreateAlbum = async (name: string, description: string, color: string, icon: string) => {
    // This will be handled by the AlbumModal component
    // The modal will create the album and then we can save the video to it
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => handleVideoClick(video)}
            onSave={showSaveButton ? () => handleSaveClick(video) : undefined}
            onRemove={showRemoveButton && onRemoveVideo ? () => onRemoveVideo(video.id) : undefined}
          />
        ))}
      </div>

      {showVideoModal && selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false)
            setSelectedVideo(null)
          }}
        />
      )}

      {showSaveModal && (
        <AlbumModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            setVideoToSave(null)
            setSavedAlbumIds([])
          }}
          mode="save"
          videoId={videoToSave?.id}
          existingAlbums={albums}
          onSaveToAlbum={handleSaveToAlbum}
          onRemoveFromAlbum={handleRemoveFromAlbum}
          onCreateAlbum={handleCreateAlbum}
          savedAlbumIds={savedAlbumIds}
        />
      )}
    </>
  )
}