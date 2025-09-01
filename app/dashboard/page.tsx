import { getViralVideos, getIndustries } from '@/lib/api-scraper'
import DashboardClient from './dashboard-client'

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
    const videos = await getViralVideos({
      industry: defaultIndustry,
      limit: 1000
    })

    // Calculate analytics
    const totalViews = videos.reduce((sum: number, v: any) => sum + (v.views || 0), 0)
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0
    
    // Calculate average engagement
    const avgEngagement = videos.reduce((sum: number, v: any) => {
      const engagement = ((v.likes || 0) + (v.comments || 0)) / (v.views || 1) * 100
      return sum + engagement
    }, 0) / (videos.length || 1)

    // Get platform distribution
    const platformCounts: any = {}
    videos.forEach((v: any) => {
      platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1
    })

    // Get performance by platform
    const performanceByPlatform = Object.entries(platformCounts).map(([platform, count]: any) => {
      const platformVideos = videos.filter((v: any) => v.platform === platform)
      const platformViews = platformVideos.reduce((sum: number, v: any) => sum + (v.views || 0), 0)
      return {
        platform,
        videos: count,
        totalViews: platformViews,
        avgViews: Math.round(platformViews / count)
      }
    }).sort((a, b) => b.totalViews - a.totalViews)

    // Get trending topics (top post types by count)
    const postTypeCounts: any = {}
    videos.forEach((v: any) => {
      if (v.post_type) {
        postTypeCounts[v.post_type] = (postTypeCounts[v.post_type] || 0) + 1
      }
    })
    const topPostTypes: { type: string; count: number }[] = Object.entries(postTypeCounts)
      .map(([type, count]: any) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get evergreen topics (post types with highest average views)
    const postTypeViews: any = {}
    const postTypeVideoCounts: any = {}
    videos.forEach((v: any) => {
      if (v.post_type) {
        postTypeViews[v.post_type] = (postTypeViews[v.post_type] || 0) + (v.views || 0)
        postTypeVideoCounts[v.post_type] = (postTypeVideoCounts[v.post_type] || 0) + 1
      }
    })
    const evergreenTopics = Object.entries(postTypeViews)
      .map(([type, totalViews]: any) => ({
        type,
        avgViews: Math.round(totalViews / postTypeVideoCounts[type]),
        count: postTypeVideoCounts[type]
      }))
      .sort((a, b) => b.avgViews - a.avgViews)
      .slice(0, 5)

    // Get recent viral hooks
    const recentHooks = videos
      .filter((v: any) => v.hook || v.written_hook || v.verbal_hook)
      .slice(0, 5)
      .map((v: any) => ({
        hook: v.hook || v.written_hook || v.verbal_hook,
        views: v.views,
        platform: v.platform
      }))

    // Get trending topics (based on visual/audio/written hook types)
    const topicCounts: any = {}
    videos.forEach((v: any) => {
      if (v.visual_hook_type) topicCounts[v.visual_hook_type] = (topicCounts[v.visual_hook_type] || 0) + 1
      if (v.audio_hook_type) topicCounts[v.audio_hook_type] = (topicCounts[v.audio_hook_type] || 0) + 1
      if (v.written_hook_type) topicCounts[v.written_hook_type] = (topicCounts[v.written_hook_type] || 0) + 1
    })
    const trendingTopics = Object.entries(topicCounts)
      .map(([topic, count]: any) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    initialData = {
      totalVideos: videos.length,
      totalViews,
      avgViews,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      topPlatform: Object.entries(platformCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A',
      topPostTypes,
      evergreenTopics,
      recentHooks,
      performanceByPlatform,
      trendingTopics
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