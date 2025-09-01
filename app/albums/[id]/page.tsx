'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import VideoGrid from '@/components/VideoGrid'
import { getSavedVideos, deleteAlbum, removeVideoFromAlbum, updateAlbum } from '@/lib/api-albums'
import { getAlbums } from '@/lib/api-albums'
import { useAuth } from '@/components/AuthProvider'
import { ArrowLeft, Trash2, Edit, Folder, X, Check } from 'lucide-react'

export default function AlbumDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const albumId = params.id as string
  
  const [album, setAlbum] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [mounted, setMounted] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadAlbumData()
  }, [albumId, user])

  async function loadAlbumData() {
    if (!user || !albumId) {
      setLoading(false)
      return
    }

    try {
      // Get album details
      const albums = await getAlbums()
      const currentAlbum = albums.find((a: any) => a.id === albumId)
      setAlbum(currentAlbum)
      if (currentAlbum) {
        setEditedName(currentAlbum.name)
        setEditedDescription(currentAlbum.description || '')
      }

      // Get videos in this album
      const savedVideos = await getSavedVideos(albumId)
      const videosData = savedVideos.map((sv: any) => sv.video).filter(Boolean)
      setVideos(videosData)
    } catch (error) {
      console.error('Error loading album:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlbum = async () => {
    if (!albumId) return
    
    try {
      const success = await deleteAlbum(albumId)
      if (success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting album:', error)
    }
  }

  const handleRemoveVideo = async (videoId: string) => {
    if (!albumId) return
    
    try {
      const success = await removeVideoFromAlbum(albumId, videoId)
      if (success) {
        await loadAlbumData()
      }
    } catch (error) {
      console.error('Error removing video:', error)
    }
  }

  const handleSaveName = async () => {
    if (!albumId || !editedName.trim()) return
    
    try {
      const updatedAlbum = await updateAlbum(albumId, { name: editedName })
      if (updatedAlbum) {
        setAlbum({ ...album, name: editedName })
        setIsEditingName(false)
      }
    } catch (error) {
      console.error('Error updating album name:', error)
    }
  }

  const handleSaveDescription = async () => {
    if (!albumId) return
    
    try {
      const updatedAlbum = await updateAlbum(albumId, { description: editedDescription })
      if (updatedAlbum) {
        setAlbum({ ...album, description: editedDescription })
        setIsEditingDescription(false)
      }
    } catch (error) {
      console.error('Error updating album description:', error)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading album...</p>
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
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Album not found</h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-purple-600 hover:text-purple-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: album.color }}
              >
                <span className="text-lg font-bold text-white">{album.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                {/* Album Name - Editable */}
                <div className="flex items-center gap-2 group">
                  {isEditingName ? (
                    <>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') {
                            setEditedName(album.name)
                            setIsEditingName(false)
                          }
                        }}
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-600 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditedName(album.name)
                          setIsEditingName(false)
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">{album.name}</h1>
                      {mounted && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                {/* Album Description - Editable */}
                <div className="mt-1 group">
                  {isEditingDescription ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        ref={descriptionRef}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditedDescription(album.description || '')
                            setIsEditingDescription(false)
                          }
                        }}
                        className="flex-1 text-gray-600 bg-gray-50 rounded px-2 py-1 outline-none resize-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        placeholder="Add a description..."
                      />
                      <button
                        onClick={handleSaveDescription}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditedDescription(album.description || '')
                          setIsEditingDescription(false)
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      {album.description ? (
                        <p className="text-gray-600">{album.description}</p>
                      ) : (
                        <p className="text-gray-400 italic">No description</p>
                      )}
                      {mounted && (
                        <button
                          onClick={() => {
                            setIsEditingDescription(true)
                            setTimeout(() => {
                              if (descriptionRef.current) {
                                descriptionRef.current.focus()
                                descriptionRef.current.setSelectionRange(
                                  descriptionRef.current.value.length,
                                  descriptionRef.current.value.length
                                )
                              }
                            }, 0)
                          }}
                          className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Album
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos saved yet</h3>
            <p className="text-gray-600">
              Go to the <button onClick={() => router.push('/patterns')} className="text-purple-600 hover:text-purple-700">Viral Database</button> to save videos to this album
            </p>
          </div>
        ) : (
          <VideoGrid 
            videos={videos} 
            showSaveButton={false}
            showRemoveButton={true}
            onRemoveVideo={handleRemoveVideo}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Album</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{album.name}"? This will remove the album but not delete the videos themselves.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAlbum}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Album
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}