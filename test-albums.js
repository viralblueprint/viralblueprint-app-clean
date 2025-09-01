const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zxthyrkrfbkjwrvdrecc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dGh5cmtyZmJrandydmRyZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTkzODQsImV4cCI6MjA3MTg5NTM4NH0.IWtE2XDzMBa-uaPGSM5Hfb-T91rga3yfQaEYUD_grXY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAlbums() {
  console.log('Testing albums table...')
  
  // Test creating an album
  const { data, error } = await supabase
    .from('albums')
    .insert({
      name: 'Test Album',
      description: 'This is a test',
      color: '#6B46C1',
      icon: 'folder'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating album:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  } else {
    console.log('Album created successfully:', data)
    
    // Try to delete the test album
    const { error: deleteError } = await supabase
      .from('albums')
      .delete()
      .eq('id', data.id)
    
    if (deleteError) {
      console.error('Error deleting test album:', deleteError)
    } else {
      console.log('Test album deleted successfully')
    }
  }
  
  // Test fetching albums
  const { data: albums, error: fetchError } = await supabase
    .from('albums')
    .select('*')
  
  if (fetchError) {
    console.error('Error fetching albums:', fetchError)
  } else {
    console.log('Current albums:', albums)
  }
}

testAlbums()