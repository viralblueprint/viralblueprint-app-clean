const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zxthyrkrfbkjwrvdrecc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dGh5cmtyZmJrandydmRyZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTkzODQsImV4cCI6MjA3MTg5NTM4NH0.IWtE2XDzMBa-uaPGSM5Hfb-T91rga3yfQaEYUD_grXY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTimeFilter() {
  // Get ALL videos first
  const { data: allVideos, error: allError } = await supabase
    .from('viral_videos')
    .select('url, timestamp, dateinserted')
    .order('timestamp', { ascending: false })
    .limit(50)
  
  if (allError) {
    console.error('Error:', allError)
    return
  }
  
  console.log('Testing time filtering logic...\n')
  
  const now = new Date()
  console.log('Current date:', now.toISOString())
  console.log('Total videos fetched:', allVideos.length)
  
  // Manual filtering like the app does
  const weekVideos = allVideos.filter(video => {
    const videoDate = video.timestamp ? new Date(video.timestamp) : null
    
    if (!videoDate) {
      console.log(`Video ${video.url.substring(0, 50)} has no timestamp`)
      return false
    }
    
    const daysDiff = Math.floor((now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 7) {
      console.log(`\n✓ Video within 7 days:`)
      console.log(`  URL: ${video.url.substring(0, 50)}`)
      console.log(`  Timestamp: ${video.timestamp}`)
      console.log(`  Days ago: ${daysDiff}`)
    }
    
    return daysDiff <= 7
  })
  
  console.log('\n=== RESULTS ===')
  console.log(`Videos in past 7 days: ${weekVideos.length}`)
  
  if (weekVideos.length > 0) {
    console.log('\nVideos that SHOULD appear in "Past Week" filter:')
    weekVideos.forEach(v => {
      console.log(`- ${v.url}`)
    })
  }
  
  // Also test with dateinserted
  console.log('\n--- Testing with dateinserted field ---')
  const weekByInserted = allVideos.filter(video => {
    const videoDate = video.dateinserted ? new Date(video.dateinserted) : null
    if (!videoDate) return false
    const daysDiff = Math.floor((now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 7
  })
  
  console.log(`Videos scraped in past 7 days: ${weekByInserted.length}`)
}

testTimeFilter()