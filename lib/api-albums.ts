import { createClient } from './supabase-browser'
import { mapVideoData } from './api-scraper'

// Get all albums for the current user
export async function getAlbums() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

// Create a new album for the current user
export async function createAlbum(name: string, description?: string, color?: string, icon?: string) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('Getting user for album creation:', { user, userError })
  if (!user) {
    console.error('No user logged in - cannot create album')
    return null
  }
  
  const { data, error } = await supabase
    .from('albums')
    .insert({
      user_id: user.id,
      name,
      description,
      color: color || '#6B46C1',
      icon: icon || 'folder'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating album:', error)
    return null
  }

  console.log('Album created successfully:', data)
  return data
}

// Update an album
export async function updateAlbum(id: string, updates: { name?: string; description?: string; color?: string; icon?: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('albums')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return null
  }

  return data
}


// Delete an album
export async function deleteAlbum(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', id)

  if (error) {
    return false
  }

  return true
}

// Save a video to an album
export async function saveVideoToAlbum(albumId: string, videoId: string, notes?: string) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No user logged in' }
  }
  
  const { data, error } = await supabase
    .from('saved_videos')
    .insert({
      user_id: user.id,
      album_id: albumId,
      video_id: videoId,
      notes
    })
    .select()
    .single()

  if (error) {
    // Check if it's a duplicate error
    if (error.code === '23505') {
      return { error: 'Video already saved to this album' }
    }
    // Silently handle other errors
    return null
  }

  return data
}

// Remove a video from an album
export async function removeVideoFromAlbum(albumId: string, videoId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('saved_videos')
    .delete()
    .eq('album_id', albumId)
    .eq('video_id', videoId)

  if (error) {
    return false
  }

  return true
}

// Get all saved videos for an album
export async function getSavedVideos(albumId?: string) {
  const supabase = createClient()
  
  // First get the saved video records
  let query = supabase
    .from('saved_videos')
    .select('*')
    .order('saved_at', { ascending: false })

  if (albumId) {
    query = query.eq('album_id', albumId)
  }

  const { data: savedVideos, error } = await query

  if (error) {
    console.error('Error fetching saved videos:', error)
    return []
  }

  if (!savedVideos || savedVideos.length === 0) {
    return []
  }

  // Get the actual video data
  const videoIds = savedVideos.map(sv => sv.video_id)
  
  const { data: videos, error: videosError } = await supabase
    .from('viral_videos')
    .select('*')
    .in('id', videoIds)

  if (videosError) {
    console.error('Error fetching video details:', videosError)
    return []
  }

  // Map videos to the expected format
  const mappedVideos = videos?.map(mapVideoData) || []
  const videosMap = new Map(mappedVideos.map(v => [v?.id, v]).filter(([id, v]) => id && v))
  
  const result = savedVideos.map(sv => ({
    ...sv,
    video: videosMap.get(sv.video_id)
  }))
  
  return result
}

// Get album with video count
export async function getAlbumsWithCounts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      saved_videos(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data?.map(album => ({
    ...album,
    video_count: album.saved_videos?.[0]?.count || 0
  })) || []
}

// Check if a video is saved in any album
export async function isVideoSaved(videoId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('saved_videos')
    .select('album_id')
    .eq('video_id', videoId)

  if (error) {
    return []
  }

  return data?.map(item => item.album_id) || []
}

// Get a single album by ID
export async function getAlbum(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching album:', error)
    return null
  }

  return data
}

// Get all videos in a specific album
export async function getAlbumVideos(albumId: string) {
  const supabase = createClient()
  
  // First get the saved video records for this album
  const { data: savedVideos, error } = await supabase
    .from('saved_videos')
    .select('*')
    .eq('album_id', albumId)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved videos:', error)
    return []
  }

  if (!savedVideos || savedVideos.length === 0) {
    return []
  }

  // Get the actual video data
  const videoIds = savedVideos.map(sv => sv.video_id)
  
  const { data: videos, error: videosError } = await supabase
    .from('viral_videos')
    .select('*')
    .in('id', videoIds)

  if (videosError) {
    console.error('Error fetching video details:', videosError)
    return []
  }

  // Map videos to the expected format and filter out nulls
  const mappedVideos = videos?.map(mapVideoData).filter(v => v !== null) || []
  
  return mappedVideos
}