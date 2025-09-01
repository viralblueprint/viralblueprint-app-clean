import { supabase } from './supabase'

// Extract creator name from input URL
function extractCreatorName(inputUrl: string): string {
  if (!inputUrl) return 'Unknown Creator'
  
  // Instagram: https://www.instagram.com/username or @username
  // TikTok: https://www.tiktok.com/@username
  
  let match = inputUrl.match(/instagram\.com\/([^\/?]+)/)
  if (match) return `@${match[1]}`
  
  match = inputUrl.match(/tiktok\.com\/@([^\/?]+)/)
  if (match) return `@${match[1]}`
  
  match = inputUrl.match(/@([^\/?\s]+)/)
  if (match) return `@${match[1]}`
  
  // If URL doesn't match patterns, try to extract last part
  const parts = inputUrl.split('/')
  const lastPart = parts[parts.length - 1] || parts[parts.length - 2]
  if (lastPart && !lastPart.includes('.')) {
    return lastPart.startsWith('@') ? lastPart : `@${lastPart}`
  }
  
  return 'Unknown Creator'
}

// Map database columns to expected format
export function mapVideoData(video: any) {
  if (!video) return null
  
  return {
    id: video.id,
    url: video.url,
    input_url: video.inputurl,
    creator: extractCreatorName(video.inputurl),
    display_url: video.displayurl,
    platform: detectPlatform(video.url),  // Detect from URL
    views: video.videoplaycount || video.videoviewcount || 0,
    likes: video.likescount || 0,
    comments: video.commentscount || 0,
    followers: video.followers || 0,
    duration: video.videoduration,
    industry: video.industry || '',
    post_type: video.format || '',  // 'format' in DB maps to 'post_type' in frontend
    hook_type: video.hooktype || '',  // Single hooktype field
    // For compatibility with existing UI that expects these fields
    visual_hook_type: video.hooktype,
    audio_hook_type: video.hooktype,
    written_hook_type: video.hooktype,
    hook: video.hooktype || '', // Use hooktype as the main hook field
    video_created_date: video.timestamp,
    created_at: video.dateinserted,
    // Computed fields
    engagement_rate: calculateEngagementRate(video),
    viral_score: calculateViralScore(video)
  }
}

function detectPlatform(url: string): string {
  if (!url) return 'unknown'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'other'
}

function calculateEngagementRate(video: any): number {
  const plays = video.videoplaycount || 0
  const likes = video.likescount || 0
  const comments = video.commentscount || 0
  
  if (plays === 0) return 0
  return ((likes + comments) / plays) * 100
}

function calculateViralScore(video: any): number {
  const views = video.videoplaycount || video.videoviewcount || 0
  const followers = video.followers || 0
  
  // If no followers data, return minimum score
  if (followers === 0) return 3
  
  // Calculate viral score as views/followers with minimum of 3
  const score = views / followers
  return Math.max(3, Math.round(score))
}

// Get all viral videos with filters
export async function getViralVideos(filters?: {
  industry?: string
  postType?: string
  viewsRange?: string
  limit?: number
  orderBy?: 'views' | 'date'
  followersRange?: string
  timeframe?: string
  platform?: string
  searchQuery?: string
}) {
  let query = supabase
    .from('viral_videos')
    .select('*')

  // Apply search query first
  if (filters?.searchQuery && filters.searchQuery !== '') {
    // Search across multiple fields using OR conditions
    query = query.or(
      `inputurl.ilike.%${filters.searchQuery}%,` +
      `hooktype.ilike.%${filters.searchQuery}%,` +
      `industry.ilike.%${filters.searchQuery}%,` +
      `format.ilike.%${filters.searchQuery}%`
    )
  }
  
  // Apply all filters
  if (filters?.industry && filters.industry !== '') {
    // Handle multiple industries separated by comma
    if (filters.industry.includes(',')) {
      const industries = filters.industry.split(',')
      const orConditions = industries.map(ind => `industry.eq.${ind.trim()}`).join(',')
      query = query.or(orConditions)
    } else {
      query = query.eq('industry', filters.industry)
    }
  }
  
  if (filters?.postType && filters.postType !== '') {
    query = query.eq('format', filters.postType)  // Changed from 'posttype' to 'format'
  }
  
  // Platform and viral score filters will be done client-side since they're computed
  // We'll handle these after fetching the data
  
  // Filter by followers range
  if (filters?.followersRange) {
    switch(filters.followersRange) {
      case '100k-500k':
        query = query.gte('followers', 100000).lt('followers', 500000)
        break
      case '500k-1m':
        query = query.gte('followers', 500000).lt('followers', 1000000)
        break
      case '1m-5m':
        query = query.gte('followers', 1000000).lt('followers', 5000000)
        break
      case '5m+':
        query = query.gte('followers', 5000000)
        break
    }
  }
  
  // Filter by timeframe - cumulative date ranges
  // Use timestamp field which should be the video creation date
  if (filters?.timeframe) {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000))
    
    switch(filters.timeframe) {
      case '7days':
        // All videos from last 7 days
        query = query.gte('timestamp', sevenDaysAgo.toISOString())
        break
      case '30days':
        // All videos from last 30 days (includes last 7 days)
        query = query.gte('timestamp', thirtyDaysAgo.toISOString())
        break
      case '90days':
        // All videos from last 90 days (includes last 30 days)
        query = query.gte('timestamp', ninetyDaysAgo.toISOString())
        break
      case '90plus':
        // Videos older than 90 days
        query = query.lt('timestamp', ninetyDaysAgo.toISOString())
        break
    }
  }

  // Apply ordering AFTER all filters
  if (filters?.orderBy === 'date') {
    // Only order by date if explicitly requested
    query = query
      .order('timestamp', { ascending: false, nullsFirst: false })
      .order('dateinserted', { ascending: false, nullsFirst: false })
  } else {
    // Default to ordering by views (even with timeframe filters)
    query = query.order('videoplaycount', { ascending: false })
  }

  // For timeframe queries, fetch more data to ensure we have enough after filtering
  if (filters?.limit) {
    if (filters?.timeframe && filters.timeframe !== '') {
      // Fetch more videos when filtering by time to ensure we get enough results
      query = query.limit(Math.min(filters.limit * 3, 500))
    } else {
      query = query.limit(filters.limit)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  // If we fetched extra for timeframe filtering, slice back to requested limit
  let results = data || []
  if (filters?.timeframe && filters.timeframe !== '' && filters?.limit && results.length > filters.limit) {
    results = results.slice(0, filters.limit)
  }

  // Map the data first
  let mappedResults = results.map(mapVideoData)

  // Apply platform filter client-side if needed
  if (filters?.platform && filters.platform !== '') {
    mappedResults = mappedResults.filter((video: any) => video.platform === filters.platform)
  }

  // Apply viral score filter client-side
  if (filters?.viewsRange) {
    mappedResults = mappedResults.filter((video: any) => {
      const score = video.viral_score || 3
      switch(filters.viewsRange) {
        case '3-5':
          return score >= 3 && score <= 5
        case '5-10':
          return score > 5 && score <= 10
        case '10+':
          return score > 10
        default:
          return true
      }
    })
  }

  return mappedResults
}

// Get unique industries
export async function getIndustries() {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('industry')
    .not('industry', 'is', null)
    .not('industry', 'eq', '')
    .order('industry')

  if (error) {
    console.error('Error fetching industries:', error)
    return []
  }

  // Get unique industries with counts
  const industryMap = new Map()
  data?.forEach(item => {
    if (item.industry) {
      industryMap.set(item.industry, (industryMap.get(item.industry) || 0) + 1)
    }
  })

  return Array.from(industryMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count
  }))
}

// Get unique post types (formats)
export async function getPostTypes() {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('format')
    .not('format', 'is', null)
    .not('format', 'eq', '')
    .order('format')

  if (error) {
    console.error('Error fetching post types:', error)
    return []
  }

  // Get unique post types with counts
  const typeMap = new Map()
  data?.forEach(item => {
    if (item.format) {
      typeMap.set(item.format, (typeMap.get(item.format) || 0) + 1)
    }
  })

  return Array.from(typeMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count
  }))
}

// Get a single video by ID
export async function getVideo(id: string) {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching video:', error)
    return null
  }

  return mapVideoData(data)
}

// Get viral content (for compatibility with existing pages)
export async function getViralContent(filters?: {
  industry?: string
  postType?: string
  platform?: string
  limit?: number
}) {
  const videos = await getViralVideos({
    industry: filters?.industry,
    postType: filters?.postType,
    limit: filters?.limit
  })
  
  // Filter by platform if specified
  let filtered = videos
  if (filters?.platform) {
    filtered = videos.filter(v => v.platform === filters.platform)
  }
  
  // Convert to expected format
  return filtered.map(video => ({
    id: video.id,
    platform: video.platform as 'tiktok' | 'instagram' | 'youtube',
    url: video.url,
    views: video.views,
    followers_at_time: 1000000, // Default since we don't track this
    viral_ratio: video.viral_score,
    date_posted: video.video_created_date,
    niche: video.industry,
    format_type: 'video' as 'video' | 'image' | 'carousel',
    hook_text: video.hook,
    visual_hook_desc: video.visual_hook,
    verbal_hook_text: video.audio_hook,
    written_hook_text: video.written_hook,
    created_at: video.created_at
  }))
}