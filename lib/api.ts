import { supabase } from './supabase'

export interface Pattern {
  id: string
  template: string
  category: string
  occurrence_frequency: number
  avg_viral_ratio: number
  sample_size: number
  confidence_level: number
  last_updated: string
}

export interface ViralContent {
  id: string
  platform: 'tiktok' | 'instagram' | 'youtube'
  url: string
  views: number
  followers_at_time: number
  viral_ratio: number
  date_posted: string
  niche: string
  format_type: 'video' | 'image' | 'carousel'
  hook_text: string
  visual_hook_desc: string | null
  verbal_hook_text: string | null
  written_hook_text: string | null
  created_at: string
}

export interface Niche {
  id: string
  name: string
  parent_category: string | null
  content_count: number
  avg_performance: number
}

export interface PatternPerformance {
  id: string
  pattern_id: string
  time_period: string
  viral_ratio: number
  success_rate: number
  sample_size: number
  statistical_significance: number
}

export interface PatternFilters {
  category?: string
  minViralRatio?: number
  niche?: string
  sortBy?: 'viral_ratio' | 'frequency' | 'recent'
  limit?: number
  offset?: number
}

export async function getTrendingPatterns(limit = 10) {
  const { data, error } = await supabase
    .from('hook_patterns')
    .select('*')
    .order('avg_viral_ratio', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching trending patterns:', error)
    return []
  }

  return data as Pattern[]
}

export async function getPatterns(filters: PatternFilters = {}) {
  let query = supabase.from('hook_patterns').select('*')

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.minViralRatio) {
    query = query.gte('avg_viral_ratio', filters.minViralRatio)
  }

  const sortColumn = filters.sortBy === 'frequency' 
    ? 'occurrence_frequency' 
    : filters.sortBy === 'recent' 
    ? 'last_updated' 
    : 'avg_viral_ratio'

  query = query.order(sortColumn, { ascending: false })

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching patterns:', error)
    return []
  }

  return data as Pattern[]
}

export async function getPattern(id: string) {
  const { data, error } = await supabase
    .from('hook_patterns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching pattern:', error)
    return null
  }

  return data as Pattern
}

export async function getPatternPerformance(patternId: string) {
  const { data, error } = await supabase
    .from('pattern_performance')
    .select('*')
    .eq('pattern_id', patternId)
    .order('time_period', { ascending: false })

  if (error) {
    console.error('Error fetching pattern performance:', error)
    return []
  }

  return data as PatternPerformance[]
}

export async function getViralContent(filters: { niche?: string; platform?: string; limit?: number } = {}) {
  let query = supabase
    .from('viral_content')
    .select('*')
    .order('viral_ratio', { ascending: false })

  if (filters.niche) {
    query = query.eq('niche', filters.niche)
  }

  if (filters.platform) {
    query = query.eq('platform', filters.platform)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching viral content:', error)
    return []
  }

  return data as ViralContent[]
}

export async function getNiches() {
  const { data, error } = await supabase
    .from('niches')
    .select('*')
    .order('content_count', { ascending: false })

  if (error) {
    console.error('Error fetching niches:', error)
    return []
  }

  return data as Niche[]
}

export async function getSimilarPatterns(patternId: string, limit = 5) {
  const pattern = await getPattern(patternId)
  if (!pattern) return []

  const { data, error } = await supabase
    .from('hook_patterns')
    .select('*')
    .eq('category', pattern.category)
    .neq('id', patternId)
    .order('avg_viral_ratio', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching similar patterns:', error)
    return []
  }

  return data as Pattern[]
}