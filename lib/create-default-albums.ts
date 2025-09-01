import { createClient } from './supabase-browser'

export async function createDefaultAlbumsForUser() {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No user logged in')
    return false
  }
  
  // Check if user already has albums
  const { data: existingAlbums } = await supabase
    .from('albums')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
  
  // If user already has albums, don't create defaults
  if (existingAlbums && existingAlbums.length > 0) {
    return true
  }
  
  // Create default albums
  const defaultAlbums = [
    {
      user_id: user.id,
      name: 'Favorites',
      description: 'Your favorite viral videos',
      color: '#EF4444',
      icon: 'heart'
    }
  ]
  
  const { error } = await supabase
    .from('albums')
    .insert(defaultAlbums)
  
  if (error) {
    console.error('Error creating default albums:', error)
    return false
  }
  
  return true
}