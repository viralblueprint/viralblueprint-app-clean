'use client'

import Navigation from '@/components/Navigation'
import { 
  CheckCircle, TrendingUp, Users, 
  ArrowRight, Target, Video
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {

  const industries = [
    'Education & Business',
    'Fitness Influencers',
    'Beauty & Fashion',
    'Gaming Creators'
  ]

  const pricingPlans = [
    {
      id: 'pro',
      name: 'Pro Access',
      price: '$9.99',
      period: '/month',
      description: 'Complete social media intelligence toolkit',
      features: [
        'Full Viral Database (10,000+ videos)',
        'Advanced Search & Filters',
        'Real-time Analytics Dashboard',
        'Trending Content Insights',
        'Save & Organize Collections',
        'Pattern Analysis by Creator Type',
        'Platform-specific Metrics',
        'Weekly Updates & New Content'
      ],
      cta: 'Start Free Trial',
      popular: true
    }
  ]

  const sampleInsights = [
    {
      platform: 'TikTok',
      insight: 'Lifestyle influencers using "Day in my life" hooks get 8.3x more views with morning routines',
      metric: '8.3x'
    },
    {
      platform: 'Instagram',
      insight: 'Beauty & Fashion creators showing transformations in first 3 seconds get 5.7x engagement',
      metric: '5.7x'
    },
    {
      platform: 'TikTok',
      insight: 'Education & Business creators with numbered lists in titles outperform others by 4.2x',
      metric: '4.2x'
    },
    {
      platform: 'Instagram',
      insight: 'Fitness influencers showing before/after in thumbnails see 7.4x higher saves',
      metric: '7.4x'
    },
    {
      platform: 'TikTok',
      insight: 'Gaming creators with facecam reactions get 3.8x more engagement',
      metric: '3.8x'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                The #1 Social Media Intelligence Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              The Social Media Intelligence
              <span className="block text-4xl md:text-5xl mt-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Platform for Creators
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
              Access 10,000+ viral short-form videos and real-time analytics dashboards. Discover what&apos;s working across TikTok and Instagram Reels with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="#pricing" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all text-lg">
                Start 7-Day Free Trial
              </Link>
              <Link href="/patterns" className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-300 hover:border-purple-600 transition-all text-lg">
                Browse Viral Database
              </Link>
            </div>

            <p className="text-sm text-gray-600">
              📊 10,000+ viral videos • Analytics dashboard • Real-time insights • Only $9.99/month
            </p>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Complete Viral Intelligence Platform
            </h2>
            <p className="text-xl text-gray-600">
              Database access and real-time analytics to understand what&apos;s working now
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Viral Database</h3>
              <p className="text-gray-600">10,000+ viral videos with complete breakdowns, searchable by industry, platform, and metrics</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <Target className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Real-time insights, trending patterns, engagement metrics, and performance analytics</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <Video className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Patterns</h3>
              <p className="text-gray-600">Discover viral patterns and strategies that work for each creator type</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Niches Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries Analyzed
            </h2>
            <p className="text-xl text-gray-600">
              Each industry gets dedicated analysis and insights
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {(() => {
              const icons: Record<string, string> = {
                'Lifestyle Influencers': '✨',
                'Education & Business': '📚',
                'Fitness Influencers': '💪',
                'Beauty & Fashion': '💄',
                'Tech Creators': '🚀',
                'Gaming Creators': '🎮'
              }
              const descriptions: Record<string, string> = {
                'Lifestyle Influencers': 'Day in my life • Routines • Vlogs • Home tours',
                'Education & Business': 'Tutorials • How-to • Business tips • Teaching',
                'Fitness Influencers': 'Workouts • What I eat • Transformations',
                'Beauty & Fashion': 'Makeup tutorials • Fashion hauls • GRWM • Outfit ideas',
                'Tech Creators': 'Gadget reviews • App demos • Tech news • Coding',
                'Gaming Creators': 'Gameplay • Reviews • Tips • Streaming'
              }
              
              const renderCard = (niche: string, index: number) => (
                <div key={index} className="bg-white rounded-xl p-6 flex flex-col items-center justify-center border-2 border-gray-100 hover:border-purple-600 hover:shadow-lg transition-all group">
                  <div className="text-3xl mb-3">{icons[niche]}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 text-center w-full">{niche}</h3>
                  <p className="text-xs text-gray-500 text-center">{descriptions[niche]}</p>
                </div>
              )
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {industries.map((industry, index) => renderCard(industry, index))}
                </div>
              )
            })()}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">
              Don&apos;t see your creator type? We analyze all niches.
            </p>
            <Link href="/#pricing" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700">
              View All Industries
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sample Insights */}
      <section id="sample" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Insights From Our Analysis
            </h2>
            <p className="text-xl text-gray-600">
              Real data from our viral content analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {sampleInsights.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-semibold text-purple-600">{item.platform}</span>
                  <span className="text-2xl font-bold text-purple-600">{item.metric}</span>
                </div>
                <p className="text-gray-700">{item.insight}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/patterns" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700">
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore Viral Database Now
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              One plan. Everything included. Cancel anytime.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular 
                    ? 'ring-2 ring-purple-600 shadow-xl' 
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Videos Analyzed Monthly</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Active Subscribers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">7</div>
              <div className="text-gray-600">Creator Niches</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">20-25</div>
              <div className="text-gray-600">Videos Analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How often is the database updated?</h3>
              <p className="text-gray-600">The viral database and analytics dashboard are updated weekly with new trending content and insights.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I access all creator niches?</h3>
              <p className="text-gray-600">Yes! Your subscription includes access to viral content from all creator niches and platforms.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How do I find content for my niche?</h3>
              <p className="text-gray-600">Use our advanced filters to search by creator type, platform, engagement metrics, and timeframe to find exactly what works in your niche.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What platforms do you analyze?</h3>
              <p className="text-gray-600">We analyze TikTok and Instagram Reels - all short-form content under 60 seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stop Guessing. Start Going Viral.
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 500+ creators using data to craft viral content
          </p>
          <Link href="#pricing" className="inline-block px-8 py-4 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition-all text-lg">
            Get Instant Access Now
          </Link>
          <p className="text-sm text-white/70 mt-4">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Viral Blueprint
              </h3>
              <p className="text-gray-400 mt-2">
                Creator-specific viral content analysis
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/patterns" className="hover:text-white">Viral Content Database</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">Fair Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Viral Blueprint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}