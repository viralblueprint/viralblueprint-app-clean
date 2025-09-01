#!/usr/bin/env node

/**
 * Direct Supabase Data Insertion Script
 * Run with: node scripts/insert-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Helper function to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve))

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

async function main() {
  console.log(colors.cyan + colors.bright + '\n🚀 Viralizes - Direct Supabase Data Insertion\n' + colors.reset)
  
  const choice = await question(
    'What would you like to insert?\n' +
    '1. Hook Pattern\n' +
    '2. Viral Content\n' +
    '3. Bulk Import (JSON)\n' +
    '4. Quick SQL Query\n' +
    'Enter choice (1-4): '
  )

  switch (choice.trim()) {
    case '1':
      await insertHookPattern()
      break
    case '2':
      await insertViralContent()
      break
    case '3':
      await bulkImport()
      break
    case '4':
      await quickSQL()
      break
    default:
      console.log(colors.red + '❌ Invalid choice' + colors.reset)
  }

  const another = await question('\nAdd more data? (y/n): ')
  if (another.toLowerCase() === 'y') {
    await main()
  } else {
    console.log(colors.green + '\n✅ Done! Data saved to Supabase.\n' + colors.reset)
    rl.close()
  }
}

async function insertHookPattern() {
  console.log(colors.yellow + '\n📝 Adding Hook Pattern\n' + colors.reset)
  
  const template = await question('Template (use {variables}): ')
  const category = await question('Category (Relatable/Humor/Educational/etc): ')
  const sampleSize = await question('Sample Size (default: 1): ') || '1'
  const avgRatio = await question('Avg Viral Ratio (default: 0): ') || '0'
  const confidence = await question('Confidence Level % (default: 0): ') || '0'

  const { data, error } = await supabase
    .from('hook_patterns')
    .insert([{
      template,
      category,
      occurrence_frequency: parseInt(sampleSize),
      avg_viral_ratio: parseFloat(avgRatio),
      sample_size: parseInt(sampleSize),
      confidence_level: parseFloat(confidence)
    }])

  if (error) {
    console.log(colors.red + `❌ Error: ${error.message}` + colors.reset)
  } else {
    console.log(colors.green + '✅ Hook pattern added successfully!' + colors.reset)
  }
}

async function insertViralContent() {
  console.log(colors.yellow + '\n🎥 Adding Viral Content\n' + colors.reset)
  
  const platform = await question('Platform (tiktok/instagram): ')
  const url = await question('URL: ')
  const views = await question('Views: ')
  const followers = await question('Creator Followers: ')
  const niche = await question('Niche (Fitness/Business/Lifestyle/Beauty/Food/Fashion/Tech): ')
  const hookText = await question('Hook Text (first 5 seconds): ')
  const datePosted = await question('Date Posted (YYYY-MM-DD, default: today): ') || new Date().toISOString().split('T')[0]

  const viralRatio = (parseInt(views) / parseInt(followers)).toFixed(1)
  console.log(colors.cyan + `\n📊 Viral Ratio: ${viralRatio}x` + colors.reset)

  const { data, error } = await supabase
    .from('viral_content')
    .insert([{
      platform,
      url,
      views: parseInt(views),
      followers_at_time: parseInt(followers),
      date_posted: datePosted,
      niche: niche.includes('/') ? niche : (niche.charAt(0).toUpperCase() + niche.slice(1)),
      format_type: 'video',
      hook_text: hookText
    }])

  if (error) {
    console.log(colors.red + `❌ Error: ${error.message}` + colors.reset)
  } else {
    console.log(colors.green + '✅ Viral content added successfully!' + colors.reset)
  }
}

async function bulkImport() {
  console.log(colors.yellow + '\n📦 Bulk Import\n' + colors.reset)
  console.log('Paste JSON array and press Enter twice when done:')
  console.log('Example format for viral content:')
  console.log(colors.cyan + `[
  {
    "platform": "tiktok",
    "url": "https://...",
    "views": 1000000,
    "followers_at_time": 50000,
    "niche": "Fitness",
    "hook_text": "Your hook here"
  }
]` + colors.reset)
  
  let jsonInput = ''
  let emptyLineCount = 0
  
  console.log('\nPaste your JSON:')
  
  const getInput = async () => {
    const line = await question('')
    if (line === '') {
      emptyLineCount++
      if (emptyLineCount >= 2) {
        return
      }
    } else {
      emptyLineCount = 0
      jsonInput += line + '\n'
    }
    await getInput()
  }
  
  await getInput()
  
  try {
    const data = JSON.parse(jsonInput)
    const table = await question('Which table? (viral_content/hook_patterns): ')
    
    // Add default values based on table
    const processedData = data.map(item => {
      if (table === 'viral_content') {
        return {
          format_type: 'video',
          date_posted: new Date().toISOString().split('T')[0],
          ...item
        }
      }
      return item
    })
    
    const { error } = await supabase
      .from(table)
      .insert(processedData)
    
    if (error) {
      console.log(colors.red + `❌ Error: ${error.message}` + colors.reset)
    } else {
      console.log(colors.green + `✅ ${data.length} items imported successfully!` + colors.reset)
    }
  } catch (e) {
    console.log(colors.red + `❌ Invalid JSON: ${e.message}` + colors.reset)
  }
}

async function quickSQL() {
  console.log(colors.yellow + '\n⚡ Quick SQL Examples\n' + colors.reset)
  
  console.log('1. Insert viral content:')
  console.log(colors.cyan + `INSERT INTO viral_content (platform, url, views, followers_at_time, date_posted, niche, format_type, hook_text)
VALUES ('tiktok', 'URL_HERE', VIEWS, FOLLOWERS, 'YYYY-MM-DD', 'NICHE', 'video', 'HOOK_TEXT');` + colors.reset)

  console.log('\n2. Insert hook pattern:')
  console.log(colors.cyan + `INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level)
VALUES ('TEMPLATE_WITH_{variables}', 'CATEGORY', 1, 0, 1, 0);` + colors.reset)

  console.log('\n3. Update pattern stats after adding content:')
  console.log(colors.cyan + `UPDATE hook_patterns 
SET sample_size = sample_size + 1,
    occurrence_frequency = occurrence_frequency + 1
WHERE template LIKE '%PATTERN%';` + colors.reset)

  console.log('\n4. Get all patterns for a niche:')
  console.log(colors.cyan + `SELECT * FROM viral_content WHERE niche = 'Fitness' ORDER BY views DESC;` + colors.reset)

  console.log(colors.yellow + '\nCopy these to run in Supabase SQL Editor' + colors.reset)
}

// Run the script
main().catch(console.error)