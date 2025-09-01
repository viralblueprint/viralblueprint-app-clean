const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zxthyrkrfbkjwrvdrecc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dGh5cmtyZmJrandydmRyZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTkzODQsImV4cCI6MjA3MTg5NTM4NH0.IWtE2XDzMBa-uaPGSM5Hfb-T91rga3yfQaEYUD_grXY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDates() {
  // Get a sample of videos with their date fields
  const { data, error } = await supabase
    .from('viral_videos')
    .select('url, timestamp, dateinserted')
    .limit(10)
    .order('dateinserted', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Sample videos with dates:')
  const now = new Date()
  
  data.forEach((video, index) => {
    console.log(`\nVideo ${index + 1}:`)
    console.log(`  URL: ${video.url ? video.url.substring(0, 50) + '...' : 'null'}`)
    console.log(`  timestamp (video created): ${video.timestamp || 'null'}`)
    console.log(`  dateinserted (scraped): ${video.dateinserted || 'null'}`)
    
    // Check days difference
    if (video.timestamp) {
      const videoDate = new Date(video.timestamp)
      const daysDiff = Math.floor((now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24))
      console.log(`  Days since video created: ${daysDiff}`)
    }
    
    if (video.dateinserted) {
      const insertDate = new Date(video.dateinserted)
      const daysDiff = Math.floor((now.getTime() - insertDate.getTime()) / (1000 * 60 * 60 * 24))
      console.log(`  Days since scraped: ${daysDiff}`)
    }
  })
  
  // Count videos by date ranges using timestamp
  const { data: weekData } = await supabase
    .from('viral_videos')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
  const { data: monthData } = await supabase
    .from('viral_videos')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
  const { data: threeMonthData } = await supabase
    .from('viral_videos')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  
  console.log('\n--- Videos by timestamp (when video was created) ---')
  console.log(`Past 7 days: ${weekData?.count || 0}`)
  console.log(`Past 30 days: ${monthData?.count || 0}`)
  console.log(`Past 90 days: ${threeMonthData?.count || 0}`)
  
  // Also check using dateinserted
  const { data: weekInserted } = await supabase
    .from('viral_videos')
    .select('*', { count: 'exact', head: true })
    .gte('dateinserted', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
  console.log('\n--- Videos by dateinserted (when scraped) ---')
  console.log(`Scraped in past 7 days: ${weekInserted?.count || 0}`)
}

checkDates()