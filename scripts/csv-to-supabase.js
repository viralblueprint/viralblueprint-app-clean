#!/usr/bin/env node

/**
 * CSV to Supabase Importer
 * Convert CSV/TSV data to Supabase
 * Run with: node scripts/csv-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
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

// Example CSV templates
const templates = {
  viral_content: `platform,url,views,followers_at_time,date_posted,niche,hook_text,visual_hook_desc
tiktok,https://tiktok.com/@user/video/123,2500000,100000,2024-03-20,Fitness,"POV: You finally hit your PR",Quick cuts to reaction
instagram,https://instagram.com/reel/abc,1800000,75000,2024-03-19,Beauty/Skincare,"Wait for it... glass skin reveal",Before and after shots`,

  hook_patterns: `template,category,occurrence_frequency,avg_viral_ratio,sample_size,confidence_level
"POV: You're {situation} and {unexpected_outcome}",Relatable,100,18.5,100,95.0
"Wait for it... {surprise_reveal}",Suspense,150,22.3,150,96.5`
}

async function parseCSV(content, delimiter = ',') {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/['"]/g, ''))
  
  return lines.slice(1).map(line => {
    // Handle quoted values with commas inside
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row = {}
    headers.forEach((header, index) => {
      let value = values[index]?.replace(/['"]/g, '') || ''
      
      // Auto-convert numbers
      if (header.includes('views') || header.includes('followers') || header.includes('_size') || 
          header.includes('frequency') || header.includes('ratio') || header.includes('level')) {
        value = parseFloat(value) || 0
      }
      
      // Auto-format dates
      if (header.includes('date')) {
        if (value && !value.includes('-')) {
          // Convert MM/DD/YYYY to YYYY-MM-DD
          const parts = value.split('/')
          if (parts.length === 3) {
            value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
          }
        }
      }
      
      // Default format_type for viral_content
      if (header === 'format_type' && !value) {
        value = 'video'
      }
      
      row[header] = value
    })
    
    return row
  })
}

async function main() {
  console.log('\n🚀 CSV to Supabase Importer\n')
  console.log('Options:')
  console.log('1. Import from CSV file')
  console.log('2. Paste CSV data directly')
  console.log('3. View CSV templates')
  console.log('4. Generate SQL from CSV')
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const question = (query) => new Promise((resolve) => rl.question(query, resolve))
  
  const choice = await question('\nChoice (1-4): ')
  
  switch (choice.trim()) {
    case '1':
      await importFromFile(rl, question)
      break
    case '2':
      await importFromPaste(rl, question)
      break
    case '3':
      showTemplates()
      break
    case '4':
      await generateSQL(rl, question)
      break
    default:
      console.log('❌ Invalid choice')
  }
  
  rl.close()
}

async function importFromFile(rl, question) {
  const filePath = await question('Enter CSV file path: ')
  const table = await question('Table name (viral_content/hook_patterns): ')
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const delimiter = content.includes('\t') ? '\t' : ','
    const data = await parseCSV(content, delimiter)
    
    console.log(`\n📊 Found ${data.length} rows to import`)
    console.log('Preview:', JSON.stringify(data[0], null, 2))
    
    const confirm = await question('\nProceed with import? (y/n): ')
    
    if (confirm.toLowerCase() === 'y') {
      const { error } = await supabase
        .from(table)
        .insert(data)
      
      if (error) {
        console.log(`❌ Error: ${error.message}`)
      } else {
        console.log(`✅ Successfully imported ${data.length} rows!`)
      }
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`)
  }
}

async function importFromPaste(rl, question) {
  const table = await question('Table name (viral_content/hook_patterns): ')
  console.log('\nPaste your CSV data (press Enter twice when done):')
  console.log('First line should be headers\n')
  
  let csvContent = ''
  let emptyLineCount = 0
  
  const getInput = async () => {
    const line = await question('')
    if (line === '') {
      emptyLineCount++
      if (emptyLineCount >= 2) {
        return
      }
    } else {
      emptyLineCount = 0
      csvContent += line + '\n'
    }
    await getInput()
  }
  
  await getInput()
  
  try {
    const delimiter = csvContent.includes('\t') ? '\t' : ','
    const data = await parseCSV(csvContent, delimiter)
    
    console.log(`\n📊 Found ${data.length} rows to import`)
    
    const { error } = await supabase
      .from(table)
      .insert(data)
    
    if (error) {
      console.log(`❌ Error: ${error.message}`)
    } else {
      console.log(`✅ Successfully imported ${data.length} rows!`)
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`)
  }
}

async function generateSQL(rl, question) {
  console.log('\nPaste your CSV data (press Enter twice when done):\n')
  
  let csvContent = ''
  let emptyLineCount = 0
  
  const getInput = async () => {
    const line = await question('')
    if (line === '') {
      emptyLineCount++
      if (emptyLineCount >= 2) {
        return
      }
    } else {
      emptyLineCount = 0
      csvContent += line + '\n'
    }
    await getInput()
  }
  
  await getInput()
  
  const table = await question('Table name: ')
  const delimiter = csvContent.includes('\t') ? '\t' : ','
  const data = await parseCSV(csvContent, delimiter)
  
  console.log('\n-- Generated SQL:')
  data.forEach(row => {
    const columns = Object.keys(row).join(', ')
    const values = Object.values(row).map(v => {
      if (typeof v === 'number') return v
      return `'${String(v).replace(/'/g, "''")}'`
    }).join(', ')
    
    console.log(`INSERT INTO ${table} (${columns}) VALUES (${values});`)
  })
  
  console.log('\n✅ Copy and paste this SQL into Supabase SQL Editor')
}

function showTemplates() {
  console.log('\n📋 CSV Templates:\n')
  console.log('=== VIRAL CONTENT ===')
  console.log(templates.viral_content)
  console.log('\n=== HOOK PATTERNS ===')
  console.log(templates.hook_patterns)
  console.log('\n💡 Copy these templates to a spreadsheet, fill with your data, then export as CSV')
}

main().catch(console.error)