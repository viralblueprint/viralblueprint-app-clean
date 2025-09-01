'use client'

import { useState, useEffect } from 'react'
import { X, Folder, Heart, Lightbulb, BookOpen, Star, Music, Camera, Zap, Check } from 'lucide-react'

interface AlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAlbum: (name: string, description: string, color: string, icon: string) => void
  mode?: 'create' | 'save'
  videoId?: string
  existingAlbums?: Array<{
    id: string
    name: string
    description?: string
    color: string
    icon: string
  }>
  onSaveToAlbum?: (albumId: string) => void
  onRemoveFromAlbum?: (albumId: string) => void
  savedAlbumIds?: string[]
}

const ALBUM_COLORS = [
  { name: 'Purple', value: '#6B46C1' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Gray', value: '#6B7280' }
]

const ALBUM_ICONS = [
  { name: 'folder', icon: Folder },
  { name: 'heart', icon: Heart },
  { name: 'lightbulb', icon: Lightbulb },
  { name: 'book-open', icon: BookOpen },
  { name: 'star', icon: Star },
  { name: 'music', icon: Music },
  { name: 'camera', icon: Camera },
  { name: 'zap', icon: Zap }
]

export default function AlbumModal({ 
  isOpen, 
  onClose, 
  onCreateAlbum, 
  mode = 'create',
  existingAlbums = [],
  onSaveToAlbum,
  onRemoveFromAlbum,
  savedAlbumIds = []
}: AlbumModalProps) {
  const [albumName, setAlbumName] = useState('')
  const [albumDescription, setAlbumDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#6B46C1')
  const [selectedIcon, setSelectedIcon] = useState('folder')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [localSavedAlbumIds, setLocalSavedAlbumIds] = useState<string[]>(savedAlbumIds || [])

  // Update local state when modal opens or savedAlbumIds changes
  useEffect(() => {
    if (isOpen) {
      setLocalSavedAlbumIds(savedAlbumIds || [])
    }
  }, [isOpen, savedAlbumIds])

  if (!isOpen) return null

  const handleCreate = () => {
    if (albumName.trim()) {
      onCreateAlbum(albumName, albumDescription, selectedColor, selectedIcon)
      setAlbumName('')
      setAlbumDescription('')
      setSelectedColor('#6B46C1')
      setSelectedIcon('folder')
      setShowCreateForm(false)
      if (mode === 'create') {
        onClose()
      }
    }
  }

  const handleToggleAlbum = async (albumId: string) => {
    if (localSavedAlbumIds.includes(albumId)) {
      // Remove from album (unsave)
      if (onRemoveFromAlbum) {
        setLocalSavedAlbumIds(prev => prev.filter(id => id !== albumId))
        await onRemoveFromAlbum(albumId)
      }
    } else {
      // Add to album (save)
      if (onSaveToAlbum) {
        setLocalSavedAlbumIds(prev => [...prev, albumId])
        await onSaveToAlbum(albumId)
      }
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconData = ALBUM_ICONS.find(i => i.name === iconName)
    return iconData ? iconData.icon : Folder
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'save' ? 'Save to Album' : 'Create New Album'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'save' && !showCreateForm && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {existingAlbums.map((album) => {
                const isAlreadySaved = localSavedAlbumIds.includes(album.id)
                return (
                  <button
                    key={album.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleToggleAlbum(album.id)
                    }}
                    className={`aspect-square rounded-lg transition-all flex items-center justify-center p-3 relative ${
                      isAlreadySaved 
                        ? 'ring-4 ring-gray-800 ring-offset-1' 
                        : 'hover:opacity-90'
                    }`}
                    style={{ 
                      backgroundColor: album.color,
                      filter: isAlreadySaved ? 'brightness(0.8)' : 'none'
                    }}
                  >
                    <p className="font-bold text-white text-center text-sm break-words">{album.name}</p>
                    {isAlreadySaved && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                )
              })}
              
              {/* Create New Album Button as a square */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="aspect-square rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-3xl text-gray-600 mb-1">+</div>
                  <p className="text-xs text-gray-600 font-medium">Create New</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {(mode === 'create' || showCreateForm) && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Album Name
                </label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g., Favorites, Inspiration"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="What's this album for?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 placeholder-gray-400"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {ALBUM_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>


              <div className="pt-4 flex gap-3">
                {showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleCreate}
                  disabled={!albumName.trim()}
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Create Album
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}