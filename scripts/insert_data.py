#!/usr/bin/env python3
"""
Direct Supabase Data Insertion Script (Python Version)
Run with: python3 scripts/insert_data.py
"""

import os
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Quick data entry templates
VIRAL_CONTENT_TEMPLATE = {
    "platform": "tiktok",  # or "instagram"
    "url": "",
    "views": 0,
    "followers_at_time": 0,
    "date_posted": datetime.now().strftime("%Y-%m-%d"),
    "niche": "Fitness",  # Fitness/Business/Lifestyle/Beauty/Food/Fashion/Tech
    "format_type": "video",
    "hook_text": "",
    "visual_hook_desc": "",
    "verbal_hook_text": "",
    "written_hook_text": ""
}

HOOK_PATTERN_TEMPLATE = {
    "template": "",  # Use {variables} for placeholders
    "category": "Relatable",  # Relatable/Humor/Suspense/Educational/etc
    "occurrence_frequency": 1,
    "avg_viral_ratio": 0.0,
    "sample_size": 1,
    "confidence_level": 0.0
}

def insert_viral_content():
    """Quick insert for viral content"""
    print("\n🎥 Adding Viral Content\n")
    
    content = VIRAL_CONTENT_TEMPLATE.copy()
    
    # Required fields
    content['url'] = input("URL: ").strip()
    content['views'] = int(input("Views: ").strip())
    content['followers_at_time'] = int(input("Creator's Followers: ").strip())
    content['hook_text'] = input("Hook Text (first 5 seconds): ").strip()
    
    # Platform
    platform = input("Platform (tiktok/instagram) [tiktok]: ").strip().lower()
    if platform in ['tiktok', 'instagram']:
        content['platform'] = platform
    
    # Niche
    print("\nNiches: Fitness, Business/Finance, Lifestyle, Beauty/Skincare, Food/Cooking, Fashion, Tech/Gaming")
    niche = input("Niche [Fitness]: ").strip()
    if niche:
        content['niche'] = niche
    
    # Date
    date = input(f"Date posted (YYYY-MM-DD) [{content['date_posted']}]: ").strip()
    if date:
        content['date_posted'] = date
    
    # Calculate viral ratio
    viral_ratio = content['views'] / content['followers_at_time']
    print(f"\n📊 Viral Ratio: {viral_ratio:.1f}x")
    
    # Optional fields
    if input("\nAdd visual description? (y/n): ").lower() == 'y':
        content['visual_hook_desc'] = input("Visual description: ").strip()
    
    # Insert to Supabase
    try:
        response = supabase.table('viral_content').insert(content).execute()
        print("✅ Viral content added successfully!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def insert_hook_pattern():
    """Quick insert for hook patterns"""
    print("\n📝 Adding Hook Pattern\n")
    
    pattern = HOOK_PATTERN_TEMPLATE.copy()
    
    # Required fields
    pattern['template'] = input("Template (use {variables}): ").strip()
    
    # Category
    categories = ['Relatable', 'Humor', 'Suspense', 'Educational', 'Listicle', 
                  'Series', 'Tutorial', 'Opinion', 'Tips', 'Transformation', 'Story', 'Engagement']
    print(f"\nCategories: {', '.join(categories)}")
    category = input("Category [Relatable]: ").strip()
    if category in categories:
        pattern['category'] = category
    
    # Optional fields
    sample_size = input("Sample size [1]: ").strip()
    if sample_size:
        pattern['sample_size'] = int(sample_size)
        pattern['occurrence_frequency'] = int(sample_size)
    
    avg_ratio = input("Average viral ratio [0]: ").strip()
    if avg_ratio:
        pattern['avg_viral_ratio'] = float(avg_ratio)
    
    confidence = input("Confidence level % [0]: ").strip()
    if confidence:
        pattern['confidence_level'] = float(confidence)
    
    # Insert to Supabase
    try:
        response = supabase.table('hook_patterns').insert(pattern).execute()
        print("✅ Hook pattern added successfully!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def bulk_insert_from_json():
    """Bulk insert from JSON file or paste"""
    print("\n📦 Bulk Import from JSON\n")
    
    choice = input("1. Load from file\n2. Paste JSON\nChoice: ").strip()
    
    if choice == '1':
        filepath = input("JSON file path: ").strip()
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ Error loading file: {e}")
            return
    else:
        print("\nPaste JSON array (press Enter twice when done):")
        lines = []
        empty_count = 0
        while True:
            line = input()
            if line == '':
                empty_count += 1
                if empty_count >= 2:
                    break
            else:
                empty_count = 0
                lines.append(line)
        
        try:
            data = json.loads('\n'.join(lines))
        except Exception as e:
            print(f"❌ Invalid JSON: {e}")
            return
    
    table = input("\nTable (viral_content/hook_patterns): ").strip()
    
    # Add defaults for viral_content
    if table == 'viral_content':
        for item in data:
            if 'format_type' not in item:
                item['format_type'] = 'video'
            if 'date_posted' not in item:
                item['date_posted'] = datetime.now().strftime("%Y-%m-%d")
    
    # Insert to Supabase
    try:
        response = supabase.table(table).insert(data).execute()
        print(f"✅ Successfully imported {len(data)} items!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def generate_sql():
    """Generate SQL statements for manual insertion"""
    print("\n⚡ SQL Generator\n")
    
    table = input("Table (viral_content/hook_patterns): ").strip()
    
    if table == 'viral_content':
        print("\n-- Example SQL for viral_content:")
        print("""INSERT INTO viral_content (platform, url, views, followers_at_time, date_posted, niche, format_type, hook_text)
VALUES 
('tiktok', 'URL_HERE', 2500000, 100000, '2024-03-20', 'Fitness', 'video', 'Your hook text here'),
('instagram', 'URL_HERE', 1800000, 75000, '2024-03-19', 'Beauty/Skincare', 'video', 'Another hook');""")
    else:
        print("\n-- Example SQL for hook_patterns:")
        print("""INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level)
VALUES 
('POV: You''re {situation} and {unexpected_outcome}', 'Relatable', 100, 18.5, 100, 95.0),
('Wait for it... {surprise_reveal}', 'Suspense', 150, 22.3, 150, 96.5);""")
    
    print("\n✅ Copy this SQL to Supabase SQL Editor")

def main():
    """Main menu"""
    print("\n🚀 Viralizes - Direct Supabase Data Insertion")
    print("=" * 40)
    
    while True:
        print("\n1. Add Viral Content")
        print("2. Add Hook Pattern")
        print("3. Bulk Import (JSON)")
        print("4. Generate SQL")
        print("5. Exit")
        
        choice = input("\nChoice (1-5): ").strip()
        
        if choice == '1':
            insert_viral_content()
        elif choice == '2':
            insert_hook_pattern()
        elif choice == '3':
            bulk_insert_from_json()
        elif choice == '4':
            generate_sql()
        elif choice == '5':
            print("\n✅ Done! Data saved to Supabase.\n")
            break
        else:
            print("❌ Invalid choice")
        
        if choice in ['1', '2', '3']:
            if input("\nAdd more data? (y/n): ").lower() != 'y':
                print("\n✅ Done! Data saved to Supabase.\n")
                break

if __name__ == "__main__":
    # Install required package if not present
    try:
        import supabase
    except ImportError:
        print("Installing required package: supabase")
        os.system("pip install supabase python-dotenv")
        print("\nPlease run the script again.")
        exit(0)
    
    main()