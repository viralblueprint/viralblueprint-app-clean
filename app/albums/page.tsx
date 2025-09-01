'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AlbumModal from '@/components/AlbumModal'
import { getAlbums } from '@/lib/api-albums'
import { Plus, Folder, Star, Heart, Flame, Rocket, Trophy, Bookmark, Sparkles } from 'lucide-react'

export default function AlbumsPage() {
  const router = useRouter()
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  useEffect(() => {
    loadAlbums()
  }, [])
  
  async function loadAlbums() {
    try {
      const data = await getAlbums()
      setAlbums(data)
    } catch (error) {
      console.error('Error loading albums:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateAlbum = () => {
    // Reload albums after creation
    loadAlbums()
    setShowCreateModal(false)
  }
  
  const getIconComponent = (icon: string) => {
    const icons: Record<string, any> = {
      'star': Star,
      'heart': Heart,
      'fire': Flame,
      'rocket': Rocket,
      'trophy': Trophy,
      'bookmark': Bookmark,
      'folder': Folder,
      'sparkles': Sparkles
    }
    const IconComponent = icons[icon] || Folder
    return IconComponent
  }
  
  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      'purple': 'bg-purple-100 border-purple-300 text-purple-700',
      'blue': 'bg-blue-100 border-blue-300 text-blue-700',
      'green': 'bg-green-100 border-green-300 text-green-700',
      'yellow': 'bg-yellow-100 border-yellow-300 text-yellow-700',
      'red': 'bg-red-100 border-red-300 text-red-700',
      'pink': 'bg-pink-100 border-pink-300 text-pink-700',
      'indigo': 'bg-indigo-100 border-indigo-300 text-indigo-700',
      'gray': 'bg-gray-100 border-gray-300 text-gray-700'
    }
    return colors[color] || 'bg-gray-100 border-gray-300 text-gray-700'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Albums</h1>
            <p className="text-gray-600 mt-2">Organize your saved videos into collections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Album
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-40"></div>
              </div>
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => {
              const IconComponent = getIconComponent(album.icon)
              return (
                <div
                  key={album.id}
                  onClick={() => router.push(`/albums/${album.id}`)}
                  className={`rounded-lg p-6 border-2 cursor-pointer hover:shadow-lg transition-all ${getColorClasses(album.color)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <IconComponent className="w-8 h-8" />
                    <span className="text-sm font-medium opacity-75">
                      {album.video_count || 0} videos
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{album.name}</h3>
                  {album.description && (
                    <p className="text-sm opacity-75 line-clamp-2">{album.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No albums yet</h2>
            <p className="text-gray-600 mb-6">Create your first album to start organizing videos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Album
            </button>
          </div>
        )}
      </div>
      
      {showCreateModal && (
        <AlbumModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          mode="create"
          onCreateAlbum={handleCreateAlbum}
        />
      )}
    </div>
  )
}