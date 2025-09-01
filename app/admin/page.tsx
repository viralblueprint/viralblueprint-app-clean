'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Navigation from '@/components/Navigation'
import { Save, Plus, TrendingUp, Video } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function AdminPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const [activeTab, setActiveTab] = useState<'pattern' | 'content'>('pattern')
  const [message, setMessage] = useState('')

  // Pattern form state
  const [patternData, setPatternData] = useState({
    template: '',
    category: 'Relatable',
    occurrence_frequency: 1,
    avg_viral_ratio: 0,
    sample_size: 1,
    confidence_level: 0
  })

  // Viral content form state
  const [contentData, setContentData] = useState({
    platform: 'tiktok' as 'tiktok' | 'instagram',
    url: '',
    views: '',
    followers_at_time: '',
    date_posted: new Date().toISOString().split('T')[0],
    niche: 'Fitness',
    format_type: 'video' as 'video' | 'image' | 'carousel',
    hook_text: '',
    visual_hook_desc: '',
    verbal_hook_text: '',
    written_hook_text: ''
  })

  const categories = ['Relatable', 'Humor', 'Suspense', 'Educational', 'Listicle', 'Series', 'Tutorial', 'Opinion', 'Tips', 'Transformation', 'Story', 'Engagement']
  const niches = ['Fitness', 'Business', 'Lifestyle', 'Tech']

  const handlePatternSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('hook_patterns')
        .insert([patternData])

      if (error) throw error
      
      setMessage('Pattern added successfully!')
      setPatternData({
        template: '',
        category: 'Relatable',
        occurrence_frequency: 1,
        avg_viral_ratio: 0,
        sample_size: 1,
        confidence_level: 0
      })
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('viral_content')
        .insert([{
          ...contentData,
          views: parseInt(contentData.views),
          followers_at_time: parseInt(contentData.followers_at_time)
        }])

      if (error) throw error
      
      setMessage('Viral content added successfully!')
      setContentData({
        platform: 'tiktok',
        url: '',
        views: '',
        followers_at_time: '',
        date_posted: new Date().toISOString().split('T')[0],
        niche: 'Fitness',
        format_type: 'video',
        hook_text: '',
        visual_hook_desc: '',
        verbal_hook_text: '',
        written_hook_text: ''
      })
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const calculateViralRatio = () => {
    if (contentData.views && contentData.followers_at_time) {
      const ratio = parseInt(contentData.views) / parseInt(contentData.followers_at_time)
      return ratio.toFixed(1) + 'x'
    }
    return '0x'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Add real data to your Viralizes database</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pattern')}
              className={`flex-1 px-6 py-4 flex items-center justify-center ${
                activeTab === 'pattern'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Add Hook Pattern
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-6 py-4 flex items-center justify-center ${
                activeTab === 'content'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Video className="w-5 h-5 mr-2" />
              Add Viral Content
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pattern' ? (
              <form onSubmit={handlePatternSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hook Template Pattern *
                  </label>
                  <textarea
                    value={patternData.template}
                    onChange={(e) => setPatternData({...patternData, template: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                    placeholder="e.g., POV: You're {situation} and {unexpected_outcome}"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{'}curly_braces{'}'} for variables</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={patternData.category}
                      onChange={(e) => setPatternData({...patternData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Size
                    </label>
                    <input
                      type="number"
                      value={patternData.sample_size}
                      onChange={(e) => setPatternData({...patternData, sample_size: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avg Viral Ratio
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={patternData.avg_viral_ratio}
                      onChange={(e) => setPatternData({...patternData, avg_viral_ratio: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 15.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Level (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={patternData.confidence_level}
                      onChange={(e) => setPatternData({...patternData, confidence_level: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 95.0"
                      max="100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Hook Pattern
                </button>
              </form>
            ) : (
              <form onSubmit={handleContentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={contentData.url}
                    onChange={(e) => setContentData({...contentData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://tiktok.com/@creator/video/123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hook Text (First 5 seconds) *
                  </label>
                  <textarea
                    value={contentData.hook_text}
                    onChange={(e) => setContentData({...contentData, hook_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                    placeholder="The exact hook used in the video"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform *
                    </label>
                    <select
                      value={contentData.platform}
                      onChange={(e) => setContentData({...contentData, platform: e.target.value as 'tiktok' | 'instagram'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niche *
                    </label>
                    <select
                      value={contentData.niche}
                      onChange={(e) => setContentData({...contentData, niche: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      {niches.map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format *
                    </label>
                    <select
                      value={contentData.format_type}
                      onChange={(e) => setContentData({...contentData, format_type: e.target.value as 'video' | 'image' | 'carousel'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="carousel">Carousel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Views *
                    </label>
                    <input
                      type="number"
                      value={contentData.views}
                      onChange={(e) => setContentData({...contentData, views: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="2500000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Followers *
                    </label>
                    <input
                      type="number"
                      value={contentData.followers_at_time}
                      onChange={(e) => setContentData({...contentData, followers_at_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="50000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Posted *
                    </label>
                    <input
                      type="date"
                      value={contentData.date_posted}
                      onChange={(e) => setContentData({...contentData, date_posted: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                {contentData.views && contentData.followers_at_time && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      Viral Ratio: <span className="font-bold text-lg">{calculateViralRatio()}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Description
                  </label>
                  <input
                    type="text"
                    value={contentData.visual_hook_desc}
                    onChange={(e) => setContentData({...contentData, visual_hook_desc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Quick cuts, text overlay, reaction shot..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verbal Hook
                    </label>
                    <input
                      type="text"
                      value={contentData.verbal_hook_text}
                      onChange={(e) => setContentData({...contentData, verbal_hook_text: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="What was said"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Written Text
                    </label>
                    <input
                      type="text"
                      value={contentData.written_hook_text}
                      onChange={(e) => setContentData({...contentData, written_hook_text: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Text overlays"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Add Viral Content
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• For patterns: Use {'{'}curly_braces{'}'} to mark variables in templates</li>
            <li>• For viral content: Copy exact view counts from the platform</li>
            <li>• Check creator&apos;s current follower count (not at time of posting) for estimates</li>
            <li>• The viral ratio is automatically calculated (views ÷ followers)</li>
            <li>• Higher viral ratios (15x+) indicate extremely successful content</li>
            <li>• Add at least 5-10 examples before creating a pattern template</li>
          </ul>
        </div>
      </div>
    </div>
  )
}