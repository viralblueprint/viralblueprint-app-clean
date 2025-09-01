#!/usr/bin/env python3
"""
Script to insert scraped video data into Supabase database
"""

import os
import json
from datetime import datetime
from supabase import create_client, Client
from typing import List, Dict, Any

# Supabase credentials (set these as environment variables)
SUPABASE_URL = os.getenv('SUPABASE_URL', 'your-project-url')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')

def create_supabase_client() -> Client:
    """Create and return a Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def format_video_data(scraped_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format scraped data to match database schema
    
    Expected input format:
    {
        "inputUrl": "https://www.instagram.com/creator",
        "url": "https://www.instagram.com/reel/ABC123",
        "likesCount": 50000,
        "videoPlayCount": 1200000,
        "videoViewCount": 980000,
        "videoDuration": 30,
        "timestamp": "2024-01-15T10:30:00Z",
        "commentsCount": 3500,
        "industry": "Fitness",
        "thumbnail": "https://example.com/thumb.jpg",
        "postType": "Reel",
        "hook": "POV: You start working out",
        "visualHookType": "Before/After",
        "audioHookType": "Trending Audio",
        "writtenHookType": "POV Format",
        "dateInserted": "2024-01-20T15:00:00Z"
    }
    """
    
    # Map scraped fields to database columns
    formatted_data = {
        'input_url': scraped_data.get('inputUrl'),
        'url': scraped_data.get('url'),
        'likes_count': scraped_data.get('likesCount', 0),
        'video_play_count': scraped_data.get('videoPlayCount', 0),
        'video_view_count': scraped_data.get('videoViewCount', 0),
        'video_duration': scraped_data.get('videoDuration'),
        'timestamp': scraped_data.get('timestamp'),
        'comments_count': scraped_data.get('commentsCount', 0),
        'industry': scraped_data.get('industry'),
        'thumbnail': scraped_data.get('thumbnail'),
        'post_type': scraped_data.get('postType'),
        'hook': scraped_data.get('hook'),
        'visual_hook_type': scraped_data.get('visualHookType'),
        'audio_hook_type': scraped_data.get('audioHookType'),
        'written_hook_type': scraped_data.get('writtenHookType'),
    }
    
    # Handle dateInserted if provided, otherwise it will use database default
    if scraped_data.get('dateInserted'):
        formatted_data['date_inserted'] = scraped_data['dateInserted']
    
    # Remove None values
    formatted_data = {k: v for k, v in formatted_data.items() if v is not None}
    
    return formatted_data

def insert_single_video(supabase: Client, video_data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a single video into the database"""
    formatted_data = format_video_data(video_data)
    
    try:
        result = supabase.table('viral_videos').insert(formatted_data).execute()
        print(f"✓ Inserted video: {formatted_data.get('url')}")
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"✗ Error inserting video {formatted_data.get('url')}: {str(e)}")
        return None

def insert_batch_videos(supabase: Client, videos_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Insert multiple videos in batch"""
    formatted_videos = [format_video_data(video) for video in videos_data]
    
    try:
        result = supabase.table('viral_videos').insert(formatted_videos).execute()
        print(f"✓ Inserted {len(result.data)} videos successfully")
        return result.data
    except Exception as e:
        print(f"✗ Error in batch insert: {str(e)}")
        # Try inserting one by one if batch fails
        print("Attempting individual inserts...")
        results = []
        for video in videos_data:
            result = insert_single_video(supabase, video)
            if result:
                results.append(result)
        return results

def update_video_hooks(supabase: Client, video_url: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update hook information for an existing video
    
    Example updates:
    {
        "hook": "New hook text",
        "visualHookType": "Split Screen",
        "industry": "Tech"
    }
    """
    # Map to database column names
    db_updates = {}
    field_mapping = {
        'hook': 'hook',
        'visualHookType': 'visual_hook_type',
        'audioHookType': 'audio_hook_type',
        'writtenHookType': 'written_hook_type',
        'industry': 'industry',
        'postType': 'post_type'
    }
    
    for key, value in updates.items():
        if key in field_mapping and value is not None:
            db_updates[field_mapping[key]] = value
    
    try:
        result = supabase.table('viral_videos').update(db_updates).eq('url', video_url).execute()
        print(f"✓ Updated video: {video_url}")
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"✗ Error updating video {video_url}: {str(e)}")
        return None

def load_from_json_file(filepath: str) -> List[Dict[str, Any]]:
    """Load scraped data from a JSON file"""
    with open(filepath, 'r') as f:
        data = json.load(f)
        # Handle both single video and array of videos
        if isinstance(data, list):
            return data
        else:
            return [data]

def load_from_csv_file(filepath: str) -> List[Dict[str, Any]]:
    """Load scraped data from a CSV file"""
    import csv
    
    videos = []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert string numbers to integers where needed
            for field in ['likesCount', 'videoPlayCount', 'videoViewCount', 'commentsCount', 'videoDuration']:
                if field in row and row[field]:
                    try:
                        row[field] = int(row[field])
                    except ValueError:
                        pass
            videos.append(row)
    return videos

def get_stats(supabase: Client) -> None:
    """Print database statistics"""
    try:
        # Total videos
        total = supabase.table('viral_videos').select('id', count='exact').execute()
        print(f"\n📊 Database Statistics:")
        print(f"Total videos: {total.count}")
        
        # Videos by platform
        platforms = supabase.table('viral_videos').select('platform').execute()
        platform_counts = {}
        for video in platforms.data:
            platform = video['platform']
            platform_counts[platform] = platform_counts.get(platform, 0) + 1
        
        print("\nVideos by platform:")
        for platform, count in platform_counts.items():
            print(f"  {platform}: {count}")
        
        # Top industries
        industries = supabase.table('industries').select('name, content_count').order('content_count', desc=True).limit(5).execute()
        if industries.data:
            print("\nTop industries:")
            for industry in industries.data:
                print(f"  {industry['name']}: {industry['content_count']} videos")
        
    except Exception as e:
        print(f"Error getting stats: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Initialize Supabase client
    supabase = create_supabase_client()
    
    # Example 1: Insert a single video
    single_video = {
        "inputUrl": "https://www.instagram.com/fitnessguru",
        "url": "https://www.instagram.com/reel/ABC123XYZ",
        "likesCount": 75000,
        "videoPlayCount": 1500000,
        "videoViewCount": 1200000,
        "videoDuration": 28,
        "timestamp": "2024-01-15T10:30:00Z",
        "commentsCount": 4200,
        "industry": "Fitness",
        "thumbnail": "https://example.com/thumb123.jpg",
        "postType": "Reel",
        "hook": "Watch me transform in 30 days",
        "visualHookType": "Before/After Transformation",
        "audioHookType": "Motivational Music",
        "writtenHookType": "Challenge Format"
    }
    
    # Uncomment to insert
    # insert_single_video(supabase, single_video)
    
    # Example 2: Load and insert from JSON file
    # videos = load_from_json_file('scraped_videos.json')
    # insert_batch_videos(supabase, videos)
    
    # Example 3: Load and insert from CSV file
    # videos = load_from_csv_file('scraped_videos.csv')
    # insert_batch_videos(supabase, videos)
    
    # Example 4: Update hook information for existing video
    # update_video_hooks(
    #     supabase,
    #     "https://www.instagram.com/reel/ABC123XYZ",
    #     {
    #         "hook": "30-day transformation you won't believe",
    #         "visualHookType": "Split Screen Comparison"
    #     }
    # )
    
    # Get database statistics
    get_stats(supabase)