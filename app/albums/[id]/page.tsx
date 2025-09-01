'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import VideoGrid from '@/components/VideoGrid'
import { getAlbum, getAlbumVideos, deleteAlbum, updateAlbum } from '@/lib/api-albums'
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react'

export default function AlbumPage() {
  const params = useParams()
  const router = useRouter()
  const albumId = params.id as string
  
  const [album, setAlbum] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  useEffect(() => {
    loadAlbumData()
  }, [albumId])
  
  async function loadAlbumData() {
    try {
      const [albumData, videosData] = await Promise.all([
        getAlbum(albumId),
        getAlbumVideos(albumId)
      ])
      
      setAlbum(albumData)
      setVideos(videosData)
      setEditName(albumData.name)
      setEditDescription(albumData.description || '')
    } catch (error) {
      console.error('Error loading album:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
      try {
        await deleteAlbum(albumId)
        router.push('/dashboard')
      } catch (error) {
        console.error('Error deleting album:', error)
      }
    }
  }
  
  const handleSave = async () => {
    try {
      await updateAlbum(albumId, {
        name: editName,
        description: editDescription
      })
      setAlbum({ ...album, name: editName, description: editDescription })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating album:', error)
    }
  }
  
  const handleRemoveVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId))
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!album) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Album not found</p>
        </div>
      </div>
    )
  }
  
  const getIconEmoji = (icon: string) => {
    const icons: Record<string, string> = {
      'star': '⭐',
      'heart': '❤️',
      'fire': '🔥',
      'rocket': '🚀',
      'trophy': '🏆',
      'bookmark': '📌',
      'folder': '📁',
      'sparkles': '✨'
    }
    return icons[icon] || '📁'
  }
  
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      'purple': 'bg-purple-100 border-purple-300',
      'blue': 'bg-blue-100 border-blue-300',
      'green': 'bg-green-100 border-green-300',
      'yellow': 'bg-yellow-100 border-yellow-300',
      'red': 'bg-red-100 border-red-300',
      'pink': 'bg-pink-100 border-pink-300',
      'indigo': 'bg-indigo-100 border-indigo-300',
      'gray': 'bg-gray-100 border-gray-300'
    }
    return colors[color] || 'bg-gray-100 border-gray-300'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        {/* Album Header */}
        <div className={`rounded-lg p-6 mb-8 border-2 ${getColorClasses(album.color)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{getIconEmoji(album.icon)}</div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold bg-white px-3 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Album name"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Album description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">{album.name}</h1>
                    {album.description && (
                      <p className="text-gray-600 mt-1">{album.description}</p>
                    )}
                  </>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditName(album.name)
                      setEditDescription(album.description || '')
                    }}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Edit album"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete album"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Videos Grid */}
        {videos.length > 0 ? (
          <VideoGrid 
            videos={videos} 
            showSaveButton={false}
            showRemoveButton={true}
            onRemoveVideo={handleRemoveVideo}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No videos in this album yet</p>
            <button
              onClick={() => router.push('/patterns')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Videos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}