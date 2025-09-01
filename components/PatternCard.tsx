'use client'

import { Pattern } from '@/lib/api'
import Link from 'next/link'
import { TrendingUp, Users, Eye, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { isFavorite, toggleFavorite } from '@/lib/favorites'

interface PatternCardProps {
  pattern: Pattern
}

export default function PatternCard({ pattern }: PatternCardProps) {
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    setIsFav(isFavorite(pattern.id))

    const handleUpdate = () => {
      setIsFav(isFavorite(pattern.id))
    }

    window.addEventListener('favorites-updated', handleUpdate)
    return () => window.removeEventListener('favorites-updated', handleUpdate)
  }, [pattern.id])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(pattern)
    setIsFav(!isFav)
  }

  // Calculate total views (simulated based on sample size and avg viral ratio)
  const totalViews = Math.floor(pattern.sample_size * pattern.avg_viral_ratio * 100000)
  // Calculate viral score as views per use
  const viralScore = pattern.sample_size > 0 ? Math.floor(totalViews / pattern.sample_size) : 0

  return (
    <div className="relative">
      <Link href={`/patterns/${pattern.id}`}>
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-lg font-bold">{(viralScore / 1000).toFixed(0)}K</span>
              <span className="text-xs text-gray-500 ml-2">avg views per use</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
            {pattern.template}
          </h3>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">Used {pattern.sample_size} times</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">
                {(totalViews / 1000000).toFixed(1)}M views
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
          isFav 
            ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}