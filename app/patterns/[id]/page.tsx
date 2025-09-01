'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { getPattern, getPatternPerformance, getSimilarPatterns, getViralContent, Pattern, PatternPerformance, ViralContent } from '@/lib/api-simple'
import { isFavorite, toggleFavorite } from '@/lib/favorites'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, BarChart, Eye, Heart, PlayCircle, ExternalLink } from 'lucide-react'
import PatternCard from '@/components/PatternCard'

export default function PatternDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [performance, setPerformance] = useState<PatternPerformance[]>([])
  const [similarPatterns, setSimilarPatterns] = useState<Pattern[]>([])
  const [viralExamples, setViralExamples] = useState<ViralContent[]>([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [nicheStats, setNicheStats] = useState<Array<{niche: string, avgViralRatio: number, successRate: number, samples: number}>>([])

  const niches = ['Fitness', 'Business', 'Lifestyle', 'Tech']

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  useEffect(() => {
    if (pattern) {
      setIsFav(isFavorite(pattern.id))
      // Generate niche stats when pattern is loaded
      setNicheStats(generateNicheStats(pattern))
    }

    const handleUpdate = () => {
      if (pattern) {
        setIsFav(isFavorite(pattern.id))
      }
    }

    window.addEventListener('favorites-updated', handleUpdate)
    return () => window.removeEventListener('favorites-updated', handleUpdate)
  }, [pattern])

  async function loadData() {
    setLoading(true)
    const [patternData, performanceData, similarData, examplesData] = await Promise.all([
      getPattern(resolvedParams.id),
      getPatternPerformance(resolvedParams.id),
      getSimilarPatterns(resolvedParams.id),
      getViralContent({ limit: 10 })
    ])

    if (!patternData) {
      notFound()
    }

    setPattern(patternData)
    setPerformance(performanceData)
    setSimilarPatterns(similarData)
    setViralExamples(examplesData)
    setLoading(false)
  }

  function handleFavoriteClick() {
    if (pattern) {
      toggleFavorite(pattern)
      setIsFav(!isFav)
    }
  }

  // Calculate total views (simulated based on sample size and avg viral ratio)
  function getTotalViews() {
    if (!pattern) return 0
    return Math.floor(pattern.sample_size * pattern.avg_viral_ratio * 100000)
  }

  // Calculate viral score as views per use
  function getViralScore() {
    if (!pattern || pattern.sample_size === 0) return 0
    return Math.floor(getTotalViews() / pattern.sample_size)
  }

  // Generate stats by niche (simulated data for demonstration)
  function generateNicheStats(patternData: Pattern) {
    // Use a deterministic approach based on niche name and pattern template
    const stats = niches.map((niche, index) => {
      // Create a simple hash from niche name and pattern template for consistency
      const hashValue = (niche.charCodeAt(0) + patternData.template.charCodeAt(0)) % 10
      const variance = (hashValue - 5) / 2 // Creates a range between -2.5 and 2.5
      
      return {
        niche,
        avgViralRatio: Math.max(5, patternData.avg_viral_ratio + variance),
        successRate: 75 + (index * 2.5), // Deterministic based on index
        samples: Math.floor(patternData.sample_size / 7 + (index * 10))
      }
    })
    // Sort by avgViralRatio from highest to lowest
    return stats.sort((a, b) => b.avgViralRatio - a.avgViralRatio)
  }

  // Get examples for each niche based on the actual pattern template
  function getNicheExamples(niche: string) {
    if (!pattern) return { text: '', videos: [] }
    
    // Create full contextual examples based on the pattern template
    const createNicheExample = (template: string, nicheType: string) => {
      // Map each template pattern to full, contextual examples for each niche
      const templateExamples: Record<string, Record<string, string>> = {
        'POV': {
          'Fitness': 'POV: You finally hit a PR on bench press and the biggest guy in the gym gives you a fist bump - suddenly you feel like you belong here',
          'Business': 'POV: Your side hustle just made more than your 9-5 this month and now you\'re googling "how to quit job professionally"',
          'Lifestyle': 'POV: You wake up at 5am for your new morning routine but spend 45 minutes in bed watching productivity TikToks instead',
          'Tech': 'POV: You buy another productivity app thinking this will be the one that finally fixes your life'
        },
        'Nobody': {
          'Fitness': 'Nobody: Absolutely no one: Me at the gym: Let me just add 5 more pounds even though my form is already breaking down',
          'Business': 'Nobody: Not a soul: Me: Checking my portfolio every 5 minutes like the market will suddenly make me rich',
          'Lifestyle': 'Nobody: Literally nobody: Me at 3am: Time to reorganize my entire life starting with color-coding my Google calendar',
          'Tech': 'Nobody: Literally no one: Me: Spending 3 hours optimizing my productivity system instead of actually working'
        },
        'Wait for it': {
          'Fitness': 'Started with 10 pushups a day... Wait for it... 6 months later I\'m deadlifting 315 and my ex just slid into my DMs',
          'Business': 'Invested $500 in this one stock everyone said was stupid... Wait for it... It\'s now worth $12,000 and I\'m teaching a masterclass',
          'Lifestyle': 'Decided to wake up at 5am for just one week... Wait for it... Now I run a successful morning routine blog with 100k followers',
          'Tech': 'Changed this one Notion setting no one talks about... Wait for it... Now I process emails in 10 minutes instead of 2 hours'
        },
        'Things that': {
          'Fitness': '3 things gym bros will never tell you about building muscle: Progressive overload matters more than supplements, rest days are when you actually grow, and nobody cares how much you lift',
          'Business': '5 things millionaire mentors will never tell you about wealth: Most got lucky timing, they failed 10x before succeeding, and passive income takes years of active work first',
          'Lifestyle': '4 things successful people will never tell you: They procrastinate too, their morning routine isn\'t that special, and they hire help for everything else',
          'Tech': '3 things productivity gurus will never tell you: Most of their day is unproductive, they use basic tools, and discipline beats any app'
        },
        'number items': {
          'Fitness': '5 gym accessories you didn\'t know you needed until you try them once and realize you\'ve been training wrong this whole time',
          'Business': '7 income streams you didn\'t know you needed that will completely change your relationship with money forever',
          'Lifestyle': '10 morning habits you didn\'t know you needed that successful people swear by but never talk about publicly',
          'Tech': '6 productivity tools you didn\'t know you needed that will instantly improve your workflow and focus'
        },
        'Day number': {
          'Fitness': 'Day 47 of 75 Hard and I finally understand why everyone quits on day 19 - the mental game is the real challenge',
          'Business': 'Day 90 of building my business in public - revenue just hit $8k MRR and I\'m documenting everything',
          'Lifestyle': 'Day 21 of dopamine detox and colors look brighter, food tastes better, and I actually enjoy being bored',
          'Tech': 'Day 30 of using analog tools only - my focus is 10x better and I actually finish tasks'
        },
        'When relatable': {
          'Fitness': 'When leg day DOMS hits different and you\'re walking down stairs like a baby giraffe but still going back tomorrow',
          'Business': 'When passive income hits different at 3am and you wake up to sales notifications while you were literally sleeping',
          'Lifestyle': 'When Sunday reset hits different and you meal prep, clean everything, and plan your week like you\'re a new person',
          'Tech': 'When deep work hits different and 4 hours feel like 30 minutes because you\'re in complete flow state'
        },
        'How to': {
          'Fitness': 'How to build muscle in 90 days: Eat protein with every meal, progressive overload weekly, sleep 8 hours, and stop program hopping',
          'Business': 'How to make your first $1000 online in 30 days: Pick one skill, find 10 potential clients, offer free value first, then pitch',
          'Lifestyle': 'How to transform your life in one week: Wake up at 6am, walk 10k steps, read 20 pages, and delete social media after 8pm',
          'Tech': 'How to 10x your productivity: Time block everything, use one tool for everything, batch similar tasks, and turn off all notifications'
        },
        'controversial': {
          'Fitness': 'Cardio is overrated for fat loss and here\'s why: It makes you hungrier, burns less than you think, and weight training shapes your body better',
          'Business': 'College is the worst investment you can make and here\'s why: Skills beat degrees, debt isn\'t worth it, and you can learn everything online free',
          'Lifestyle': 'Motivation is useless and here\'s why: Discipline beats motivation, habits run on autopilot, and waiting to feel ready means never starting',
          'Tech': 'Expensive productivity tools are a scam and here\'s why: Free tools work just as well, complexity kills productivity, and pen and paper beats most apps'
        },
        'hack': {
          'Fitness': 'The 2-minute rest period hack that increased my bench press by 50lbs - most people rest too little and wonder why they plateau',
          'Business': 'The email template hack that gets responses from millionaires - be specific, offer value first, and keep it under 50 words',
          'Lifestyle': 'The phone placement hack that fixed my sleep schedule - charge it in another room and buy a real alarm clock',
          'Tech': 'The 2-2-2 rule hack that changed my productivity - 2 minute tasks do immediately, 2 hour blocks for deep work, 2 priorities per day max'
        }
      }
      
      // Determine which pattern type this template matches
      let exampleText = ''
      
      if (template.toLowerCase().includes('pov:')) {
        exampleText = templateExamples['POV'][nicheType] || template
      } else if (template.toLowerCase().includes('nobody:')) {
        exampleText = templateExamples['Nobody'][nicheType] || template
      } else if (template.toLowerCase().includes('wait for it')) {
        exampleText = templateExamples['Wait for it'][nicheType] || template
      } else if (template.toLowerCase().includes('things that') || template.toLowerCase().includes('will never tell you')) {
        exampleText = templateExamples['Things that'][nicheType] || template
      } else if (template.includes('{number}') && template.includes('{items}')) {
        exampleText = templateExamples['number items'][nicheType] || template
      } else if (template.toLowerCase().includes('day') && template.includes('{number}')) {
        exampleText = templateExamples['Day number'][nicheType] || template
      } else if (template.toLowerCase().includes('when') && template.toLowerCase().includes('hits different')) {
        exampleText = templateExamples['When relatable'][nicheType] || template
      } else if (template.toLowerCase().includes('how to')) {
        exampleText = templateExamples['How to'][nicheType] || template
      } else if (template.includes('{controversial_opinion}') || template.includes('here\'s why')) {
        exampleText = templateExamples['controversial'][nicheType] || template
      } else if (template.includes('hack')) {
        exampleText = templateExamples['hack'][nicheType] || template
      } else {
        // Default: return a generic example for this niche
        exampleText = templateExamples['POV'][nicheType] || template
      }
      
      return exampleText
    }
    
    // Generate view counts based on niche performance
    const generateViews = (nicheType: string, index: number) => {
      const baseViews = [7.8, 5.2, 3.1, 2.3, 1.8, 1.2]
      const nicheMultiplier = nicheStats.find(s => s.niche === nicheType)?.avgViralRatio || 10
      const views = baseViews[index % baseViews.length] * (nicheMultiplier / 10)
      return views >= 1 ? `${views.toFixed(1)}M` : `${Math.round(views * 1000)}K`
    }
    
    // Generate platform distribution
    const platforms: Array<'tiktok' | 'instagram'> = ['tiktok', 'instagram', 'tiktok']
    const urls = platforms.slice(0, 2 + Math.floor(Math.random() * 2)).map((platform, index) => ({
      platform,
      url: platform === 'tiktok' 
        ? `https://tiktok.com/@creator${index + 1}/video/${niche.toLowerCase()}` 
        : `https://instagram.com/reel/${niche.toLowerCase()}${index + 1}`,
      views: generateViews(niche, index)
    }))
    
    return {
      text: createNicheExample(pattern.template, niche),
      videos: urls
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pattern) return null

  const totalViews = getTotalViews()
  const viralScore = getViralScore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/patterns" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patterns
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-5 h-5 mr-1" />
              <span className="font-bold text-2xl">{(viralScore / 1000).toFixed(0)}K</span>
              <span className="text-sm text-gray-500 ml-2">avg views per use</span>
            </div>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all ${
                isFav 
                  ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {pattern.template}
          </h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Eye className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{(totalViews / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{pattern.sample_size}</div>
              <div className="text-sm text-gray-600">Samples</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BarChart className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{pattern.occurrence_frequency}</div>
              <div className="text-sm text-gray-600">Occurrences</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance by Niche</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {nicheStats.map((stat) => (
                <div key={stat.niche} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 text-sm mb-1">{stat.niche}</div>
                  <div className="text-xl font-bold text-green-600">{stat.avgViralRatio.toFixed(1)}x</div>
                  <div className="text-xs text-gray-600">
                    {stat.samples} samples
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Examples by Niche</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {niches.map((niche) => {
              const example = getNicheExamples(niche)
              return (
                <div key={niche} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{niche}</h3>
                  <p className="text-gray-700 italic mb-3">"{example.text}"</p>
                  
                  {example.videos.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Example Videos:</div>
                      <div className="flex flex-wrap gap-2">
                        {example.videos.map((video, index) => (
                          <a
                            key={index}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm ${
                              video.platform === 'tiktok' 
                                ? 'bg-black text-white hover:bg-gray-800' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                            }`}
                          >
                            <PlayCircle className="w-3 h-3 mr-1" />
                            <span className="capitalize">{video.platform}</span>
                            <span className="mx-1">•</span>
                            <span>{video.views} views</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {similarPatterns.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPatterns.map((similar) => (
                <PatternCard key={similar.id} pattern={similar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}