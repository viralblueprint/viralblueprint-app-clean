import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      viral_content: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['viral_content']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['viral_content']['Insert']>
      }
      hook_patterns: {
        Row: {
          id: string
          template: string
          category: string
          occurrence_frequency: number
          avg_viral_ratio: number
          sample_size: number
          confidence_level: number
          last_updated: string
        }
        Insert: Omit<Database['public']['Tables']['hook_patterns']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['hook_patterns']['Insert']>
      }
      niches: {
        Row: {
          id: string
          name: string
          parent_category: string | null
          content_count: number
          avg_performance: number
        }
        Insert: Omit<Database['public']['Tables']['niches']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['niches']['Insert']>
      }
      pattern_performance: {
        Row: {
          id: string
          pattern_id: string
          time_period: string
          viral_ratio: number
          success_rate: number
          sample_size: number
          statistical_significance: number
        }
        Insert: Omit<Database['public']['Tables']['pattern_performance']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['pattern_performance']['Insert']>
      }
    }
  }
}