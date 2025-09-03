import { getViralVideos, getIndustries } from '@/lib/api-scraper'
import DashboardClient from './dashboard-client'
import { Video } from '@/types/video'

export default async function DashboardPage() {
  // Fetch industries on the server
  const industries = await getIndustries()
  
  // Get the first industry's data as default
  const defaultIndustry = industries[0]?.name || ''
  const defaultPlatform = 'all'
  
  // Fetch initial data for the default industry
  let initialData = {
    totalVideos: 0,
    totalViews: 0,
    avgViews: 0,
    avgEngagement: 0,
    topPlatform: '',
    topPostTypes: [],
    evergreenTopics: [],
    recentHooks: [],
    performanceByPlatform: [],
    trendingTopics: []
  }

  if (defaultIndustry) {
    const videos: Video[] = await getViralVideos({
      industry: defaultIndustry,
      limit: 1000
    })

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
      if (v.platform) {
        platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1
      }
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
    const topPostTypes: { type: string; count: number }[] = Object.entries(postTypeCounts)
      .map(([type, count]) => ({ type, count }))
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

    initialData = {
      totalVideos: videos.length,
      totalViews,
      avgViews,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      topPlatform: Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      topPostTypes,
      evergreenTopics,
      hookAnalytics,
      performanceByPlatform,
      formatAnalytics
    }
  }

  return (
    <DashboardClient 
      industries={industries}
      defaultIndustry={defaultIndustry}
      defaultPlatform={defaultPlatform}
      initialData={initialData}
    />
  )
}