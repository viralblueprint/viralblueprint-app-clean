import Navigation from '@/components/Navigation'
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pattern Analysis</h1>
          <p className="text-gray-600">Deep dive into viral pattern performance metrics and trends</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics Coming Soon</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We're building powerful analytics tools to help you understand pattern performance, 
            track trends over time, and make data-driven content decisions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Trend Analysis</h3>
              <p className="text-sm text-gray-600">Track pattern performance over time</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Audience Insights</h3>
              <p className="text-sm text-gray-600">Understand what resonates with your audience</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Timing Optimization</h3>
              <p className="text-sm text-gray-600">Find the best times to post</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}