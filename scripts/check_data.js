const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zxthyrkrfbkjwrvdrecc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dGh5cmtyZmJrandydmRyZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTkzODQsImV4cCI6MjA3MTg5NTM4NH0.IWtE2XDzMBa-uaPGSM5Hfb-T91rga3yfQaEYUD_grXY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  // Get count
  const { count } = await supabase
    .from('viral_videos')
    .select('*', { count: 'exact', head: true })
  
  console.log(`Total videos in database: ${count}`)
  
  // Get sample data
  const { data, error } = await supabase
    .from('viral_videos')
    .select('url, industry, likescount, videoplaycount')
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('\nSample data:')
    data.forEach(video => {
      console.log(`- ${video.industry}: ${video.videoplaycount?.toLocaleString() || 0} plays, ${video.likescount?.toLocaleString() || 0} likes`)
    })
  }
  
  // Get industry breakdown
  const { data: industries } = await supabase
    .from('viral_videos')
    .select('industry')
  
  const industryCounts = {}
  industries.forEach(row => {
    industryCounts[row.industry] = (industryCounts[row.industry] || 0) + 1
  })
  
  console.log('\nVideos by industry:')
  Object.entries(industryCounts).forEach(([industry, count]) => {
    console.log(`  ${industry}: ${count}`)
  })
}

checkData()