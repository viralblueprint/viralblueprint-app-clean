'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import VideoGrid from '@/components/VideoGrid'
import { getViralVideos, getIndustries, getPostTypes } from '@/lib/api-scraper'
import { TrendingUp, Filter, Smartphone, Hash, BarChart3, Calendar, Users, Target, Search } from 'lucide-react'

export default function PatternsPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [creatorNiches, setCreatorNiches] = useState<any[]>([])
  const [postTypes, setPostTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const videosPerPage = 24
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedNiche, setSelectedNiche] = useState<string>('')
  const [selectedPostType, setSelectedPostType] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('')
  const [selectedViews, setSelectedViews] = useState<string>('')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(0)
      setVideos([])
      loadData(true)
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, selectedNiche, selectedPostType, selectedPlatform, selectedTimeframe, selectedViews])

  async function loadData(reset = false) {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    const offset = reset ? 0 : currentPage * videosPerPage
    
    try {
      const [videosData, industriesData, postTypesData] = await Promise.all([
        getViralVideos({
          searchQuery: searchQuery || undefined,
          industry: selectedNiche || undefined,
          postType: selectedPostType || undefined,
          viewsRange: selectedViews || undefined,
          limit: videosPerPage + offset,
          orderBy: 'views', // Always order by views
          timeframe: selectedTimeframe || undefined,
          platform: selectedPlatform || undefined
        }),
        getIndustries(),
        getPostTypes()
      ])
      
      // No more client-side filtering needed - all done server-side
      let filtered = videosData
      
      // Only get new videos if not reset
      const newVideos = reset ? filtered : filtered.slice(currentPage * videosPerPage)
      
      if (reset) {
        setVideos(newVideos)
      } else {
        setVideos(prev => [...prev, ...newVideos])
      }
      
      setHasMore(videosData.length >= videosPerPage + offset)
      setCreatorNiches(industriesData || [])
      setPostTypes(postTypesData || [])
      
      if (!reset) {
        setCurrentPage(prev => prev + 1)
      } else {
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setVideos([])
      setCreatorNiches([])
      setPostTypes([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }
  
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(false)
    }
  }

  const platforms = [
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram Reels' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by creator, hook, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="font-semibold text-gray-900">Filter Videos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Smartphone className="inline w-4 h-4 mr-1" />
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Industry
              </label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="">All Industries</option>
                {creatorNiches.map(niche => (
                  <option key={niche.id} value={niche.name}>{niche.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline w-4 h-4 mr-1" />
                Format
              </label>
              <select
                value={selectedPostType}
                onChange={(e) => setSelectedPostType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="">All Formats</option>
                {postTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                Viral Score
              </label>
              <select
                value={selectedViews}
                onChange={(e) => setSelectedViews(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="">All Scores</option>
                <option value="3-5">3-5x</option>
                <option value="5-10">5-10x</option>
                <option value="10+">10x+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="90plus">90+ Days Ago</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {videos.length} viral videos
            </span>
            {(searchQuery || selectedPlatform || selectedNiche || selectedPostType || selectedTimeframe || selectedViews) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedPlatform('')
                  setSelectedNiche('')
                  setSelectedPostType('')
                  setSelectedTimeframe('')
                  setSelectedViews('')
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading viral content...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <VideoGrid videos={videos} showSaveButton={true} />
        )}
        
        {/* Load More Button */}
        {!loading && hasMore && videos.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </span>
              ) : (
                'Load More Videos'
              )}
            </button>
          </div>
        )}
        
        {!loading && !hasMore && videos.length > 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p>No more videos to load</p>
          </div>
        )}
      </div>
    </div>
  )
}