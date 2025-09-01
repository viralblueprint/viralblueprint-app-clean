const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zxthyrkrfbkjwrvdrecc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dGh5cmtyZmJrandydmRyZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTkzODQsImV4cCI6MjA3MTg5NTM4NH0.IWtE2XDzMBa-uaPGSM5Hfb-T91rga3yfQaEYUD_grXY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImages() {
  // Check if displayUrl column exists and has data
  const { data, error } = await supabase
    .from('viral_videos')
    .select('url, thumbnail, displayurl')
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Sample data with image URLs:')
  data.forEach((video, index) => {
    console.log(`\nVideo ${index + 1}:`)
    console.log(`  URL: ${video.url ? video.url.substring(0, 50) + '...' : 'null'}`)
    console.log(`  Thumbnail: ${video.thumbnail || 'null'}`)
    console.log(`  DisplayURL: ${video.displayurl || 'null'}`)
  })
  
  // Count how many have each field
  const { data: counts } = await supabase
    .from('viral_videos')
    .select('thumbnail, displayurl')
  
  const thumbnailCount = counts.filter(v => v.thumbnail).length
  const displayUrlCount = counts.filter(v => v.displayurl).length
  
  console.log(`\nTotal videos: ${counts.length}`)
  console.log(`Videos with thumbnail: ${thumbnailCount}`)
  console.log(`Videos with displayURL: ${displayUrlCount}`)
}

checkImages()