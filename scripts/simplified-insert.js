#!/usr/bin/env node

/**
 * Simplified Data Insertion for Viralizes
 * Only needs: URL, Views, Niche, and 3 Hook Types
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Example: Insert a single video
async function insertVideo() {
  const video = {
    url: 'https://tiktok.com/@creator/video/12345',
    views: 2500000,
    niche: 'Fitness', // Must be one of: Fitness, Business/Finance, Lifestyle, Beauty/Skincare, Food/Cooking, Fashion, Tech/Gaming
    visual_hook: 'Quick cuts between exercises',  // What you SEE
    verbal_hook: 'POV: Your first day at the gym', // What you HEAR
    written_hook: 'GYM FAILS COMPILATION',         // What you READ
    video_created_date: '2024-03-15'              // When video was posted
  }
  
  const { data, error } = await supabase.rpc('upsert_viral_video', {
    p_url: video.url,
    p_views: video.views,
    p_niche: video.niche,
    p_visual_hook: video.visual_hook,
    p_verbal_hook: video.verbal_hook,
    p_written_hook: video.written_hook,
    p_video_created_date: video.video_created_date
  })
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Video saved:', data)
  }
}

// Example: Bulk insert from array
async function bulkInsert() {
  const videos = [
    {
      url: 'https://tiktok.com/@user1/video/1',
      views: 3500000,
      niche: 'Fitness',
      visual_hook: 'Before/after transformation',
      verbal_hook: 'How I lost 30 pounds in 3 months',
      written_hook: 'DAY 1 vs DAY 90'
    },
    {
      url: 'https://instagram.com/reel/abc123',
      views: 2100000,
      niche: 'Beauty/Skincare',
      visual_hook: 'Close-up skin texture',
      verbal_hook: 'The $7 product that changed everything',
      written_hook: 'GLASS SKIN ROUTINE'
    }
  ]
  
  for (const video of videos) {
    await supabase.rpc('upsert_viral_video', {
      p_url: video.url,
      p_views: video.views,
      p_niche: video.niche,
      p_visual_hook: video.visual_hook,
      p_verbal_hook: video.verbal_hook,
      p_written_hook: video.written_hook
    })
  }
  
  console.log(`✅ Inserted ${videos.length} videos`)
}

// Example: Get hook statistics
async function getHookStats() {
  // This automatically calculates frequency from the data
  const { data: stats } = await supabase.rpc('get_hook_stats')
  
  console.log('\n📊 Top Hooks by Usage:')
  stats?.slice(0, 5).forEach(hook => {
    console.log(`
    Hook: "${hook.hook_text}"
    Type: ${hook.hook_type}
    Used: ${hook.usage_count} times
    Total Views: ${(hook.total_views / 1000000).toFixed(1)}M
    Avg Views: ${(hook.avg_views / 1000000).toFixed(1)}M
    Best Niche: ${hook.top_niche}
    `)
  })
}

// Example: Get niche performance
async function getNicheStats() {
  const { data: stats } = await supabase.rpc('get_niche_stats')
  
  console.log('\n📈 Niche Performance:')
  stats?.forEach(niche => {
    console.log(`
    ${niche.niche}:
    - Videos: ${niche.video_count}
    - Avg Views: ${(niche.avg_views / 1000000).toFixed(1)}M
    - Top Visual: "${niche.top_visual_hook}"
    - Top Verbal: "${niche.top_verbal_hook}"
    - Top Written: "${niche.top_written_hook}"
    `)
  })
}

// Example: Find patterns (without storing pattern count)
async function findPatterns() {
  // Get all videos
  const { data: videos } = await supabase
    .from('viral_videos')
    .select('*')
    .order('views', { ascending: false })
  
  // Count hook patterns
  const patterns = {
    visual: {},
    verbal: {},
    written: {}
  }
  
  videos?.forEach(video => {
    if (video.visual_hook) {
      patterns.visual[video.visual_hook] = (patterns.visual[video.visual_hook] || 0) + 1
    }
    if (video.verbal_hook) {
      patterns.verbal[video.verbal_hook] = (patterns.verbal[video.verbal_hook] || 0) + 1
    }
    if (video.written_hook) {
      patterns.written[video.written_hook] = (patterns.written[video.written_hook] || 0) + 1
    }
  })
  
  console.log('\n🔍 Most Common Patterns:')
  
  Object.keys(patterns).forEach(type => {
    const sorted = Object.entries(patterns[type])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    console.log(`\n${type.toUpperCase()} HOOKS:`)
    sorted.forEach(([hook, count]) => {
      console.log(`  "${hook}" - used ${count} times`)
    })
  })
}

// Interactive CLI
async function main() {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const question = (q) => new Promise(resolve => rl.question(q, resolve))
  
  console.log('\n🚀 Viralizes Simplified Data Entry\n')
  console.log('1. Insert single video')
  console.log('2. Bulk insert example')
  console.log('3. View hook stats')
  console.log('4. View niche stats')
  console.log('5. Find patterns')
  
  const choice = await question('\nChoice (1-5): ')
  
  switch(choice) {
    case '1':
      const url = await question('URL: ')
      const views = await question('Views: ')
      const niche = await question('Niche (Fitness/Business/Lifestyle/Beauty/Food/Fashion/Tech): ')
      const visual = await question('Visual hook (what you see): ')
      const verbal = await question('Verbal hook (what you hear): ')
      const written = await question('Written hook (what you read): ')
      
      await supabase.rpc('upsert_viral_video', {
        p_url: url,
        p_views: parseInt(views),
        p_niche: niche,
        p_visual_hook: visual || null,
        p_verbal_hook: verbal || null,
        p_written_hook: written || null
      })
      
      console.log('✅ Video saved!')
      break
      
    case '2':
      await bulkInsert()
      break
      
    case '3':
      await getHookStats()
      break
      
    case '4':
      await getNicheStats()
      break
      
    case '5':
      await findPatterns()
      break
  }
  
  rl.close()
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

// Export for use in other scripts
module.exports = {
  insertVideo,
  bulkInsert,
  getHookStats,
  getNicheStats,
  findPatterns
}