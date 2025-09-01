import { supabase } from './supabase'

// Simple interface matching your new database
export interface ViralVideo {
  id: string
  url: string
  thumbnail?: string | null
  views: number
  industry: string
  post_type: string
  visual_hook_type?: string | null  // Hook category/type
  audio_hook_type?: string | null   // Hook category/type
  written_hook_type?: string | null // Hook category/type
  hook?: string | null              // The full actual hook text
  // Legacy fields for compatibility
  visual_hook?: string | null
  verbal_hook?: string | null
  written_hook?: string | null
  video_created_date: string | null
  created_at: string
}

// Get all viral videos
export async function getViralVideos(filters?: {
  industry?: string
  postType?: string
  minViews?: number
  limit?: number
}) {
  let query = supabase
    .from('viral_videos')
    .select('*')
    .order('views', { ascending: false })

  if (filters?.industry && filters.industry !== '') {
    query = query.eq('industry', filters.industry)
  }
  
  if (filters?.postType && filters.postType !== '') {
    query = query.eq('post_type', filters.postType)
  }

  if (filters?.minViews) {
    query = query.gte('views', filters.minViews)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  // Add platform based on URL
  const videosWithPlatform = data?.map(video => ({
    ...video,
    platform: video.url.includes('tiktok') ? 'tiktok' : 
              video.url.includes('instagram') ? 'instagram' : 'unknown'
  })) || []

  return videosWithPlatform
}

// Get unique industries
export async function getIndustries() {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('industry')
    .order('industry')

  if (error) {
    console.error('Error fetching industries:', error)
    return []
  }

  // Get unique industries with count
  const industryMap = new Map()
  data?.forEach(item => {
    if (item.industry) {
      industryMap.set(item.industry, (industryMap.get(item.industry) || 0) + 1)
    }
  })

  // Convert to array format
  const industries = Array.from(industryMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    content_count: count,
    avg_performance: 0 // Would need separate query for this
  }))

  return industries
}

// Get unique post types
export async function getPostTypes() {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('post_type')
    .order('post_type')

  if (error) {
    console.error('Error fetching post types:', error)
    return []
  }

  // Get unique post types with count
  const postTypeMap = new Map()
  data?.forEach(item => {
    if (item.post_type) {
      postTypeMap.set(item.post_type, (postTypeMap.get(item.post_type) || 0) + 1)
    }
  })

  // Convert to array format
  const postTypes = Array.from(postTypeMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    count
  }))

  return postTypes
}

// Keep getNiches for backward compatibility - maps to getIndustries
export async function getNiches() {
  return getIndustries()
}

// Get hook patterns (calculated from actual usage)
export async function getHookPatterns(type?: 'visual' | 'verbal' | 'written') {
  let column = 'visual_hook'
  if (type === 'verbal') column = 'verbal_hook'
  if (type === 'written') column = 'written_hook'

  const { data, error } = await supabase
    .from('viral_videos')
    .select(`${column}, views`)
    .not(column, 'is', null)

  if (error) {
    console.error('Error fetching hooks:', error)
    return []
  }

  // Count occurrences and calculate averages
  const hookMap = new Map()
  data?.forEach(item => {
    const hook = item[column]
    if (hook) {
      if (!hookMap.has(hook)) {
        hookMap.set(hook, { count: 0, totalViews: 0, videos: [] })
      }
      const stats = hookMap.get(hook)
      stats.count++
      stats.totalViews += item.views
      stats.videos.push(item.views)
    }
  })

  // Convert to pattern format
  const patterns = Array.from(hookMap.entries()).map(([hook, stats]) => ({
    id: hook.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20),
    template: hook,
    category: type || 'mixed',
    occurrence_frequency: stats.count,
    avg_viral_ratio: Math.round(stats.totalViews / stats.count / 100000), // Simplified ratio
    sample_size: stats.count,
    confidence_level: stats.count > 10 ? 95 : stats.count > 5 ? 85 : 70
  }))

  return patterns.sort((a, b) => b.occurrence_frequency - a.occurrence_frequency)
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

  return data
}

// Convert viral videos to the old Pattern format for compatibility
export async function getPatterns(filters?: {
  minViralRatio?: number
  sortBy?: string
  limit?: number
}) {
  // Get all unique hooks
  const videos = await getViralVideos({ limit: filters?.limit || 50 })
  
  // Extract patterns from videos
  const patternMap = new Map()
  
  videos.forEach(video => {
    // Process each hook type
    const hooks = [
      { text: video.verbal_hook, type: 'verbal' },
      { text: video.visual_hook, type: 'visual' },
      { text: video.written_hook, type: 'written' }
    ]
    
    hooks.forEach(hook => {
      if (hook.text) {
        const key = hook.text
        if (!patternMap.has(key)) {
          patternMap.set(key, {
            id: video.id,
            template: hook.text,
            category: hook.type,
            occurrence_frequency: 0,
            total_views: 0,
            sample_size: 0
          })
        }
        const pattern = patternMap.get(key)
        pattern.occurrence_frequency++
        pattern.sample_size++
        pattern.total_views += video.views
      }
    })
  })
  
  // Convert to array and calculate averages
  const patterns = Array.from(patternMap.values()).map(p => ({
    ...p,
    avg_viral_ratio: p.sample_size > 0 ? Math.round(p.total_views / p.sample_size / 100000) : 0,
    confidence_level: p.sample_size > 10 ? 95 : p.sample_size > 5 ? 85 : 70,
    last_updated: new Date().toISOString()
  }))
  
  // Apply filters
  let filtered = patterns
  if (filters?.minViralRatio) {
    filtered = filtered.filter(p => p.avg_viral_ratio >= filters.minViralRatio)
  }
  
  // Sort
  if (filters?.sortBy === 'frequency') {
    filtered.sort((a, b) => b.occurrence_frequency - a.occurrence_frequency)
  } else {
    filtered.sort((a, b) => b.avg_viral_ratio - a.avg_viral_ratio)
  }
  
  return filtered
}

// Compatibility functions for the existing UI
export async function getTrendingPatterns(limit: number = 6) {
  return getPatterns({ limit, sortBy: 'viral_ratio' })
}

export async function getPattern(id: string) {
  // Try to find a video with this ID
  const video = await getVideo(id)
  if (!video) return null
  
  // Convert to pattern format
  return {
    id: video.id,
    template: video.verbal_hook || video.written_hook || video.visual_hook || 'Unknown',
    category: 'mixed',
    occurrence_frequency: 1,
    avg_viral_ratio: Math.round(video.views / 100000),
    sample_size: 1,
    confidence_level: 70,
    last_updated: video.created_at
  }
}

export async function getPatternPerformance(id: string) {
  // Return empty array as we don't track performance over time in the simple schema
  return []
}

export async function getSimilarPatterns(id: string) {
  // Get the video
  const video = await getVideo(id)
  if (!video) return []
  
  // Find videos with similar hooks
  const { data } = await supabase
    .from('viral_videos')
    .select('*')
    .eq('industry', video.industry)
    .neq('id', id)
    .limit(3)
  
  // Convert to pattern format
  return (data || []).map(v => ({
    id: v.id,
    template: v.verbal_hook || v.written_hook || v.visual_hook || 'Unknown',
    category: 'similar',
    occurrence_frequency: 1,
    avg_viral_ratio: Math.round(v.views / 100000),
    sample_size: 1,
    confidence_level: 70,
    last_updated: v.created_at
  }))
}

// Get viral content (videos) with filters
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
    filtered = videos.filter(v => {
      const videoPlatform = v.url.includes('tiktok') ? 'tiktok' : 
                           v.url.includes('instagram') ? 'instagram' : 'unknown'
      return videoPlatform === filters.platform
    })
  }
  
  // Convert to ViralContent format
  return filtered.map(video => ({
    id: video.id,
    platform: video.platform as 'tiktok' | 'instagram' | 'youtube',
    url: video.url,
    views: video.views,
    followers_at_time: 1000000, // Default value
    viral_ratio: video.views / 100000,
    date_posted: video.video_created_date || new Date().toISOString(),
    industry: video.industry,
    post_type: video.post_type,
    niche: video.industry, // For backward compatibility
    format_type: 'video' as const,
    hook_text: video.verbal_hook || video.written_hook || video.visual_hook || '',
    visual_hook_desc: video.visual_hook,
    verbal_hook_text: video.verbal_hook,
    written_hook_text: video.written_hook,
    created_at: video.created_at
  }))
}

// Re-export types that are still compatible
export type { Pattern, PatternPerformance, ViralContent } from './api'

// Define types locally since we generate them differently
export interface Niche {
  id: string
  name: string
  parent_category: string | null
  content_count: number
  avg_performance: number
}

export interface Industry {
  id: string
  name: string
  content_count: number
  avg_performance: number
}

export interface PostType {
  id: string
  name: string
  count: number
}