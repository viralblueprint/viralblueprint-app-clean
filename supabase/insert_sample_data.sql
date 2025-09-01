-- Sample INSERT statement for viral_videos table
-- Replace the sample values with your actual data from Excel

INSERT INTO viral_videos (
    inputurl,
    url,
    likescount,
    videoplaycount,
    videoviewcount,
    videoduration,
    timestamp,
    commentscount,
    displayurl,
    industry,
    topic,
    format,
    visualhook,
    audiohook,
    writtenhook,
    dateinserted,
    followers,
    platform
) VALUES 
(
    -- Example row 1
    '@username',  -- inputurl
    'https://www.tiktok.com/@username/video/1234567890',  -- url
    150000,  -- likescount
    2500000,  -- videoplaycount
    2500000,  -- videoviewcount
    30,  -- videoduration (in seconds)
    '2024-01-15T10:30:00Z',  -- timestamp (when video was created)
    5000,  -- commentscount
    'https://example.com/thumbnail1.jpg',  -- displayurl
    'Fitness',  -- industry
    'Workout Routine',  -- topic
    'Educational',  -- format
    'Before/After transformation',  -- visualhook
    'Motivational music',  -- audiohook
    '30 Day Challenge Results',  -- writtenhook
    NOW(),  -- dateinserted
    250000,  -- followers
    'tiktok'  -- platform
),
(
    -- Example row 2
    '@creator2',  -- inputurl
    'https://www.instagram.com/reel/ABC123',  -- url
    85000,  -- likescount
    1200000,  -- videoplaycount
    1200000,  -- videoviewcount
    15,  -- videoduration
    '2024-01-20T14:45:00Z',  -- timestamp
    2500,  -- commentscount
    'https://example.com/thumbnail2.jpg',  -- displayurl
    'Beauty',  -- industry
    'Makeup Tutorial',  -- topic
    'Tutorial',  -- format
    'Close-up product shots',  -- visualhook
    'Trending audio',  -- audiohook
    'Get Ready With Me',  -- writtenhook
    NOW(),  -- dateinserted
    500000,  -- followers
    'instagram'  -- platform
);

-- For bulk import from CSV, you can use this format:
-- COPY viral_videos (
--     inputurl, url, likescount, videoplaycount, videoviewcount, 
--     videoduration, timestamp, commentscount, displayurl, 
--     industry, topic, format, visualhook, audiohook, writtenhook, 
--     dateinserted, followers, platform
-- ) 
-- FROM '/path/to/your/csv/file.csv' 
-- DELIMITER ',' 
-- CSV HEADER;

-- Or use Supabase's built-in CSV import feature in the dashboard