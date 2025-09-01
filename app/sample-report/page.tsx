'use client'

import Navigation from '@/components/Navigation'
import { 
  FileText, TrendingUp, 
  Target, Video,
  Download, Play,
  Zap, Brain
} from 'lucide-react'
import Link from 'next/link'

export default function SampleReportPage() {
  const reportSections = [
    {
      title: 'Executive Summary',
      pages: '1 page',
      icon: FileText,
      description: 'Industry top viral trends, key patterns, and 3 main takeaways'
    },
    {
      title: 'Best Performing Content Analysis',
      pages: '8-10 pages',
      icon: TrendingUp,
      description: '10-15 viral videos with complete hook breakdowns and performance metrics'
    },
    {
      title: 'Content Pattern Insights',
      pages: '4-5 pages',
      icon: Brain,
      description: 'Most successful content strategies, cross-platform comparison, replicability scores'
    },
    {
      title: 'Platform-Specific Breakdowns',
      pages: '4-5 pages',
      icon: Video,
      description: 'What works on TikTok vs Instagram Reels vs YouTube Shorts'
    },
    {
      title: 'Actionable Templates',
      pages: '2-3 pages',
      icon: Target,
      description: '5 proven formulas with fill-in-the-blank templates'
    },
    {
      title: 'Next Month Predictions',
      pages: '1 page',
      icon: Zap,
      description: 'Trending topics, emerging hooks, seasonal considerations'
    }
  ]

  const sampleVideoAnalysis = {
    title: 'Fitness Creator @mikefitness',
    platform: 'TikTok',
    views: '8.2M views',
    ratio: '12.3x follower average',
    hook: {
      opening: '"POV: You finally see progress after 90 days..."',
      category: 'Relatable Journey',
      triggers: ['Aspiration', 'Social Proof', 'Transformation'],
      visual: 'Split-screen before/after with countdown timer',
      audio: 'Trending motivational audio (slowed + reverb)'
    },
    performance: {
      tiktok: '8.2M views, 892K likes',
      instagram: '3.1M views (Reels)',
      youtube_shorts: '1.2M views'
    },
    whyItWorked: 'Combined three powerful elements: specific timeframe (90 days), visual proof (split-screen), and relatable struggle narrative. The countdown timer created urgency while the transformation visual provided immediate payoff.'
  }

  const hookTemplates = [
    {
      name: 'The Transformation Timeline',
      template: 'POV: You [specific action] for [timeframe] and [unexpected result]',
      example: 'POV: You wake up at 5am for 30 days and your entire life changes',
      platforms: ['TikTok', 'Instagram'],
      score: 9.2
    },
    {
      name: 'The Insider Secret',
      template: 'What [industry professionals] don\'t want you to know about [topic]',
      example: 'What gym trainers don\'t want you to know about building muscle',
      platforms: ['YouTube Shorts', 'TikTok'],
      score: 8.7
    },
    {
      name: 'The Numbered Challenge',
      template: 'Day [X] of [challenge]: [surprising observation or result]',
      example: 'Day 47 of cold plunging: My anxiety completely disappeared',
      platforms: ['All Platforms'],
      score: 8.5
    }
  ]

  const platformBreakdown = {
    tiktok: {
      topHook: 'POV + Transformation',
      avgViews: '5.2M',
      bestTime: '6-9pm EST',
      trend: 'Before/after reveals with countdown timers'
    },
    instagram: {
      topHook: 'Mini-tutorials with text overlay',
      avgViews: '2.8M',
      bestTime: '12-1pm EST',
      trend: 'Step-by-step breakdowns in 30 seconds'
    },
    youtube_shorts: {
      topHook: 'Question hooks with visual preview',
      avgViews: '3.5M',
      bestTime: '2-4pm EST',
      trend: 'Quick reveals in first 3 seconds'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                <FileText className="w-4 h-4 mr-2" />
                Sample Report Preview
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Fitness Industry Report
              <span className="block text-3xl md:text-4xl mt-3 text-gray-600">
                November 2024 Edition
              </span>
            </h1>
            
            <p className="text-xl mb-8 text-gray-700 max-w-3xl mx-auto">
              See exactly what you&apos;ll receive each month: 20-25 pages of actionable viral content analysis across TikTok, Instagram Reels, and YouTube Shorts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all text-lg">
                Get Full Report Access
              </Link>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-300 hover:border-purple-600 transition-all text-lg flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Download Sample PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Report Structure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Report Structure
            </h2>
            <p className="text-xl text-gray-600">
              Every monthly report follows this comprehensive format
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reportSections.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <Icon className="w-10 h-10 text-purple-600" />
                    <span className="text-sm font-medium text-gray-500">{section.pages}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sample Video Analysis */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Video Analysis
            </h2>
            <p className="text-xl text-gray-600">
              Each viral video gets this detailed breakdown
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{sampleVideoAnalysis.title}</h3>
                <div className="flex gap-4">
                  <span className="text-sm bg-black text-white px-3 py-1 rounded-full">{sampleVideoAnalysis.platform}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">{sampleVideoAnalysis.views}</span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">{sampleVideoAnalysis.ratio}</span>
                </div>
              </div>
              <Play className="w-12 h-12 text-gray-400" />
            </div>

            <div className="space-y-6">
              {/* Opening Hook */}
              <div className="border-l-4 border-purple-600 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">Opening Hook</h4>
                <p className="text-lg italic text-gray-700">{sampleVideoAnalysis.hook.opening}</p>
              </div>

              {/* Hook Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Hook Category</h4>
                  <p className="text-gray-700 mb-3">{sampleVideoAnalysis.hook.category}</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">Psychological Triggers</h4>
                  <div className="flex flex-wrap gap-2">
                    {sampleVideoAnalysis.hook.triggers.map((trigger, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Visual Elements</h4>
                  <p className="text-gray-700 mb-3">{sampleVideoAnalysis.hook.visual}</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">Audio Strategy</h4>
                  <p className="text-gray-700">{sampleVideoAnalysis.hook.audio}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cross-Platform Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(sampleVideoAnalysis.performance).map(([platform, stats]) => (
                    <div key={platform} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">{platform === 'youtube_shorts' ? 'YouTube Shorts' : platform === 'instagram' ? 'Instagram Reels' : 'TikTok'}</p>
                      <p className="text-sm font-semibold text-gray-900">{stats}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why It Worked */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Why This Hook Worked</h4>
                <p className="text-gray-700">{sampleVideoAnalysis.whyItWorked}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Templates Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Content Templates
            </h2>
            <p className="text-xl text-gray-600">
              Ready-to-use formulas from this month&apos;s top performers
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {hookTemplates.map((template, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{template.name}</h3>
                    <div className="flex gap-2">
                      {template.platforms.map((platform, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{template.score}</div>
                    <div className="text-xs text-gray-500">Viral Score</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Template:</p>
                    <p className="font-mono text-sm text-gray-900">{template.template}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Example:</p>
                    <p className="text-sm font-medium text-purple-900">&quot;{template.example}&quot;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Breakdown Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform-Specific Insights
            </h2>
            <p className="text-xl text-gray-600">
              What&apos;s working on each platform this month
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Object.entries(platformBreakdown).map(([platform, data]) => (
              <div key={platform} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{platform === 'youtube_shorts' ? 'YouTube Shorts' : platform === 'instagram' ? 'Instagram Reels' : 'TikTok'}</h3>
                  <div className="text-3xl font-bold text-purple-600">{data.avgViews}</div>
                  <p className="text-sm text-gray-500">Avg viral views</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Top Hook Type</p>
                    <p className="text-sm font-medium text-gray-900">{data.topHook}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Best Posting Time</p>
                    <p className="text-sm font-medium text-gray-900">{data.bestTime}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Trend</p>
                    <p className="text-sm text-gray-700">{data.trend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Your Full Industry Report
          </h2>
          <p className="text-xl text-white/90 mb-8">
            This is just a preview. Full reports include 20-25 pages of detailed analysis,<br />
            10-15 viral videos, and actionable templates for your industry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/#pricing" className="px-8 py-4 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition-all text-lg">
              View Pricing Plans
            </Link>
            <button className="px-8 py-4 bg-white/20 text-white rounded-full font-semibold border-2 border-white/50 hover:bg-white/30 transition-all text-lg">
              Download Sample PDF
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-white/90">
            <div>
              <div className="text-3xl font-bold mb-1">20-25</div>
              <div className="text-sm">Pages</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">10-15</div>
              <div className="text-sm">Videos</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">5+</div>
              <div className="text-sm">Templates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Viral Blueprint
            </h3>
            <p className="text-gray-400 mb-6">
              Industry-specific viral content analysis reports
            </p>
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}