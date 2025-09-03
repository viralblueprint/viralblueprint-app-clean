'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AlbumModal from '@/components/AlbumModal'
import AuthModal from '@/components/AuthModal'
import { getViralVideos } from '@/lib/api-scraper'
import { getAlbumsWithCounts, createAlbum } from '@/lib/api-albums'
import { useAuth } from '@/components/AuthProvider'
import { 
  Eye,
  Heart,
  BarChart3,
  Hash,
  Users,
  Zap,
  Activity,
  Bookmark,
  Folder,
  Plus,
  User
} from 'lucide-react'

interface Industry {
  value: string;
  label: string;
}

interface Video {
  id?: string;
  url?: string;
  platform?: string;
  views: number;
  likes?: number;
  comments?: number;
  post_type?: string;
  hook?: string;
  written_hook?: string;
  verbal_hook?: string;
  visual_hook_type?: string;
  audio_hook_type?: string;
  written_hook_type?: string;
}

interface Album {
  id: string;
  name: string;
  video_count?: number;
}

interface SearchParams {
  industry?: string;
  platform?: string;
  minViews?: number;
  maxViews?: number;
  limit?: number;
}

interface InitialData {
  totalVideos: number;
  totalViews: number;
  avgViews: number;
  avgEngagement: number;
  topPlatform: string;
  topPostTypes: { type: string; count: number }[];
  evergreenTopics: { type: string; avgViews: number; count: number }[];
  hookAnalytics: { hookType: string; count: number; avgViews: number; totalViews: number; avgEngagement: number }[];
  performanceByPlatform: { platform: string; videos: number; totalViews: number; avgViews: number }[];
  formatAnalytics: { format: string; count: number; avgViews: number; totalViews: number; avgEngagement: number }[];
}

interface DashboardClientProps {
  industries: Industry[]
  defaultIndustry: string
  defaultPlatform: string
  initialData: InitialData
}

const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' }
]

export default function DashboardClient({ industries, defaultIndustry, defaultPlatform, initialData }: DashboardClientProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(defaultIndustry)
  const [selectedPlatform, setSelectedPlatform] = useState<string>(defaultPlatform)
  const [data, setData] = useState<any>(initialData)
  const [loading, setLoading] = useState(false)
  const [albums, setAlbums] = useState<any[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(true)
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading: authLoading } = useAuth()
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load albums when user is logged in
  useEffect(() => {
    async function loadAlbumsData() {
      if (!user) {
        setLoadingAlbums(false)
        return
      }
      
      try {
        const albumsData = await getAlbumsWithCounts()
        setAlbums(albumsData)
      } catch (_error) {
        // Silently handle error - dashboard will just show empty albums
      } finally {
        setLoadingAlbums(false)
      }
    }
    loadAlbumsData()
  }, [user])

  async function loadDashboardData(industry?: string, platform?: string) {
    setLoading(true)
    
    try {
      const params: SearchParams = {
        industry: industry || selectedIndustry,
        limit: 1000
      }
      
      // Add platform filter if not 'all'
      if ((platform || selectedPlatform) !== 'all') {
        params.platform = platform || selectedPlatform
      }
      
      const videos = await getViralVideos(params)

      // Calculate analytics
      const totalViews = videos.reduce((sum: number, v: Video) => sum + (v.views || 0), 0)
      const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0
      
      // Calculate average engagement
      const avgEngagement = videos.reduce((sum: number, v: Video) => {
        const engagement = ((v.likes || 0) + (v.comments || 0)) / (v.views || 1) * 100
        return sum + engagement
      }, 0) / (videos.length || 1)

      // Get platform distribution
      const platformCounts: Record<string, number> = {}
      videos.forEach((v: Video) => {
        platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1
      })

      // Get performance by platform
      const performanceByPlatform = Object.entries(platformCounts).map(([platform, count]) => {
        const platformVideos = videos.filter((v: Video) => v.platform === platform)
        const platformViews = platformVideos.reduce((sum: number, v: Video) => sum + (v.views || 0), 0)
        return {
          platform,
          videos: count,
          totalViews: platformViews,
          avgViews: Math.round(platformViews / count)
        }
      }).sort((a, b) => b.totalViews - a.totalViews)

      // Get trending topics (top post types by count)
      const postTypeCounts: Record<string, number> = {}
      videos.forEach((v: Video) => {
        if (v.post_type) {
          postTypeCounts[v.post_type] = (postTypeCounts[v.post_type] || 0) + 1
        }
      })
      const topPostTypes = Object.entries(postTypeCounts)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get evergreen topics (post types with highest average views)
      const postTypeViews: Record<string, number> = {}
      const postTypeVideoCounts: Record<string, number> = {}
      videos.forEach((v: Video) => {
        if (v.post_type) {
          postTypeViews[v.post_type] = (postTypeViews[v.post_type] || 0) + (v.views || 0)
          postTypeVideoCounts[v.post_type] = (postTypeVideoCounts[v.post_type] || 0) + 1
        }
      })
      const evergreenTopics = Object.entries(postTypeViews)
        .map(([type, totalViews]) => ({
          type,
          avgViews: Math.round(totalViews / postTypeVideoCounts[type]),
          count: postTypeVideoCounts[type]
        }))
        .sort((a, b) => b.avgViews - a.avgViews)
        .slice(0, 5)

      // Aggregate hook types with analytics
      const hookTypeStats: Record<string, { count: number; totalViews: number; videos: Video[] }> = {}
      videos.forEach((v: Video) => {
        const hookType = v.hook || v.written_hook || v.verbal_hook || v.visual_hook_type || v.audio_hook_type || v.written_hook_type
        if (hookType) {
          if (!hookTypeStats[hookType]) {
            hookTypeStats[hookType] = { count: 0, totalViews: 0, videos: [] }
          }
          hookTypeStats[hookType].count++
          hookTypeStats[hookType].totalViews += v.views || 0
          hookTypeStats[hookType].videos.push(v)
        }
      })
      
      // Calculate average performance for each hook type
      const hookAnalytics = Object.entries(hookTypeStats)
        .map(([hookType, stats]) => ({
          hookType,
          count: stats.count,
          avgViews: Math.round(stats.totalViews / stats.count),
          totalViews: stats.totalViews,
          avgEngagement: stats.videos.reduce((sum, v) => {
            const engagement = ((v.likes || 0) + (v.comments || 0)) / (v.views || 1) * 100
            return sum + engagement
          }, 0) / stats.count
        }))
        .sort((a, b) => b.avgViews - a.avgViews)
        .slice(0, 5)

      // Aggregate format/post types with analytics
      const formatStats: Record<string, { count: number; totalViews: number; videos: Video[] }> = {}
      videos.forEach((v: Video) => {
        if (v.post_type) {
          if (!formatStats[v.post_type]) {
            formatStats[v.post_type] = { count: 0, totalViews: 0, videos: [] }
          }
          formatStats[v.post_type].count++
          formatStats[v.post_type].totalViews += v.views || 0
          formatStats[v.post_type].videos.push(v)
        }
      })
      
      // Calculate average performance for each format
      const formatAnalytics = Object.entries(formatStats)
        .map(([format, stats]) => ({
          format,
          count: stats.count,
          avgViews: Math.round(stats.totalViews / stats.count),
          totalViews: stats.totalViews,
          avgEngagement: stats.videos.reduce((sum, v) => {
            const engagement = ((v.likes || 0) + (v.comments || 0)) / (v.views || 1) * 100
            return sum + engagement
          }, 0) / stats.count
        }))
        .sort((a, b) => b.avgViews - a.avgViews)
        .slice(0, 5)

      setData({
        totalVideos: videos.length,
        totalViews,
        avgViews,
        avgEngagement: avgEngagement.toFixed(2),
        topPlatform: Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        topPostTypes,
        evergreenTopics,
        hookAnalytics,
        performanceByPlatform,
        formatAnalytics
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleIndustryChange(industry: string) {
    setSelectedIndustry(industry)
    await loadDashboardData(industry, selectedPlatform)
  }
  
  async function handlePlatformChange(platform: string) {
    setSelectedPlatform(platform)
    await loadDashboardData(selectedIndustry, platform)
  }

  function formatNumber(num: number): string {
    if (!num || typeof num !== 'number') return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  async function handleCreateAlbum(name: string, description: string, color: string, icon: string) {
    if (!user) {
      console.log('User not logged in, showing auth modal')
      setShowAlbumModal(false)
      setShowAuthModal(true)
      return
    }
    
    console.log('Creating album:', { name, description, color, icon })
    try {
      const newAlbum = await createAlbum(name, description, color, icon)
      console.log('Album creation result:', newAlbum)
      if (newAlbum) {
        // Reload albums after creating new one
        const albumsData = await getAlbumsWithCounts()
        setAlbums(albumsData)
        setShowAlbumModal(false)
      }
    } catch (_error) {
      console.error('Error in handleCreateAlbum:', error)
    }
  }
  
  const handleCreateAlbumClick = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowAlbumModal(true)
    }
  }


  const dashboardContent = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Industry Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track performance metrics and viral trends</p>
            </div>
            
            {/* Platform and Industry Selectors */}
            <div className="flex gap-3">
              {/* Platform Selector */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedPlatform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                  disabled={loading}
                >
                  {platforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Industry Selector */}
              <div className="w-full sm:w-64">
                <select
                  value={selectedIndustry}
                  onChange={(e) => handleIndustryChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                  disabled={loading}
                >
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.name}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={`space-y-6 ${loading ? 'opacity-50' : ''}`}>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.totalVideos}</p>
              <p className="text-xs text-gray-500 mt-1">In {selectedIndustry}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(data.totalViews)}</p>
              <p className="text-xs text-gray-500 mt-1">Combined reach</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Avg Views</p>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(data.avgViews)}</p>
              <p className="text-xs text-gray-500 mt-1">Per video</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.avgEngagement}%</p>
              <p className="text-xs text-gray-500 mt-1">Average rate</p>
            </div>
          </div>

          {/* Second Row - Platform Performance full width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Platform Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.performanceByPlatform.length === 0 ? (
                <p className="text-gray-500 text-center py-4 col-span-full">No platform data available</p>
              ) : (
                data.performanceByPlatform.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        platform.platform.toLowerCase() === 'tiktok' ? 'bg-black' :
                        platform.platform.toLowerCase() === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-red-600'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {platform.platform.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{platform.platform}</p>
                        <p className="text-xs text-gray-500">{platform.videos} videos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatNumber(platform.totalViews)}</p>
                      <p className="text-xs text-gray-500">total views</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Third Row - Best Hook Types and Best Performing Formats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Hook Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Best Hook Types
              </h3>
              <div className="space-y-3">
                {(!data.hookAnalytics || data.hookAnalytics.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">No hook data available</p>
                ) : (
                  data.hookAnalytics.map((hook, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{hook.hookType}</p>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {hook.count} videos
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Avg Views</p>
                          <p className="font-medium text-gray-900">{formatNumber(hook.avgViews)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Engagement</p>
                          <p className="font-medium text-gray-900">{hook.avgEngagement.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Best Performing Formats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-600" />
                Best Performing Formats
              </h3>
              <div className="space-y-3">
                {(!data.formatAnalytics || data.formatAnalytics.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">No format data available</p>
                ) : (
                  data.formatAnalytics.map((format, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{format.format}</p>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {format.count} videos
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Avg Views</p>
                          <p className="font-medium text-gray-900">{formatNumber(format.avgViews)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Engagement</p>
                          <p className="font-medium text-gray-900">{format.avgEngagement.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Fourth Row - My Saved Videos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-600" />
                My Saved Videos
              </h3>
              <button 
                onClick={handleCreateAlbumClick}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Album
              </button>
            </div>

            {!mounted || loadingAlbums || authLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 mb-3">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 text-sm">Loading saved videos...</p>
              </div>
            ) : !user ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Sign in to save and organize videos</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div>
                {/* Albums Row */}
                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                  {albums.length === 0 ? (
                    <div className="text-center py-4 w-full">
                      <Folder className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No albums yet. Create your first album to start saving videos!</p>
                    </div>
                  ) : (
                    albums.map((album: Album) => (
                      <div
                        key={album.id}
                        className="flex-shrink-0 cursor-pointer group pt-2 pr-2"
                        onClick={() => window.location.href = `/albums/${album.id}`}
                      >
                        <div className="relative">
                          <div
                            className="w-24 h-24 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 group-hover:opacity-90"
                            style={{ backgroundColor: album.color }}
                          >
                            <span className="text-sm font-bold text-white text-center px-2">{album.name}</span>
                          </div>
                          {album.video_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                              {album.video_count}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {dashboardContent}
      <AlbumModal
        isOpen={showAlbumModal}
        onClose={() => setShowAlbumModal(false)}
        onCreateAlbum={handleCreateAlbum}
        mode="create"
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}