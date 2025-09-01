import { Search, BarChart3, Edit3, TrendingUp } from 'lucide-react'

const workflows = [
  {
    title: 'Research',
    description: 'Discover proven viral patterns from millions of analyzed posts',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    title: 'Analyze',
    description: 'Understand why patterns work with statistical performance data',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    title: 'Adapt',
    description: 'Transform patterns into customizable templates for your niche',
    icon: Edit3,
    color: 'bg-pink-500',
  },
  {
    title: 'Track',
    description: 'Monitor pattern performance and optimize your content strategy',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
]

export default function WorkflowSection() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Path to Viral Success
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A systematic approach to understanding and leveraging viral content patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {workflows.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="relative">
                {index < workflows.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-300 -translate-x-4 z-0" />
                )}
                
                <div className="bg-white rounded-xl shadow-lg p-6 relative z-10 hover:shadow-xl transition-shadow">
                  <div className={`${step.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                  
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-gray-400">
                      STEP {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}