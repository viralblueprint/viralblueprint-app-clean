import { supabase } from './supabase'

// Interface that works with both old and new schemas
export interface ViralVideo {
  id: string
  url: string
  views: number
  industry?: string  // New field
  niche?: string     // Old field
  post_type?: string // New field
  visual_hook: string | null
  verbal_hook: string | null
  written_hook: string | null
  video_created_date: string | null
  created_at: string
}

// Get all viral videos with compatibility for both schemas
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

  // First, fetch one record to check the schema
  const { data: schemaCheck } = await supabase
    .from('viral_videos')
    .select('*')
    .limit(1)
    .single()

  const hasNewSchema = schemaCheck && 'industry' in schemaCheck

  // Apply filters based on schema version
  if (filters?.industry && filters.industry !== '') {
    if (hasNewSchema) {
      query = query.eq('industry', filters.industry)
    } else {
      query = query.eq('niche', filters.industry)
    }
  }
  
  if (filters?.postType && filters.postType !== '' && hasNewSchema) {
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

  // Normalize the data to always have industry and post_type fields
  const videosWithPlatform = data?.map(video => ({
    ...video,
    industry: video.industry || video.niche || 'Unknown',
    post_type: video.post_type || 'Video',
    platform: video.url.includes('tiktok') ? 'tiktok' : 
              video.url.includes('instagram') ? 'instagram' : 
              video.url.includes('youtube') ? 'youtube' : 'unknown'
  })) || []

  return videosWithPlatform
}

// Get unique industries (with fallback to niches)
export async function getIndustries() {
  // First check which schema we have
  const { data: schemaCheck } = await supabase
    .from('viral_videos')
    .select('*')
    .limit(1)
    .single()

  const hasNewSchema = schemaCheck && 'industry' in schemaCheck
  const fieldName = hasNewSchema ? 'industry' : 'niche'

  const { data, error } = await supabase
    .from('viral_videos')
    .select(fieldName)
    .order(fieldName)

  if (error) {
    console.error('Error fetching industries:', error)
    return []
  }

  // Get unique industries with count
  const industryMap = new Map()
  data?.forEach(item => {
    const value = item[fieldName]
    if (value) {
      industryMap.set(value, (industryMap.get(value) || 0) + 1)
    }
  })

  // Convert to array format
  const industries = Array.from(industryMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    content_count: count,
    avg_performance: 0
  }))

  return industries
}

// Get unique post types (returns empty if old schema)
export async function getPostTypes() {
  // First check which schema we have
  const { data: schemaCheck } = await supabase
    .from('viral_videos')
    .select('*')
    .limit(1)
    .single()

  const hasNewSchema = schemaCheck && 'post_type' in schemaCheck

  if (!hasNewSchema) {
    // Return default post types for old schema
    return [
      { id: 'video', name: 'Video', count: 0 },
      { id: 'tutorial', name: 'Tutorial', count: 0 },
      { id: 'transformation', name: 'Transformation', count: 0 }
    ]
  }

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
    filtered = videos.filter(v => v.platform === filters.platform)
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

// Export remaining functions from the original api-simple
export { 
  getHookPatterns, 
  getVideo,
  getPatterns,
  getTrendingPatterns,
  getPattern,
  getPatternPerformance,
  getSimilarPatterns
} from './api-simple'

// Re-export types
export type { Pattern, PatternPerformance, ViralContent } from './api'
export type { Industry, PostType } from './api-simple'