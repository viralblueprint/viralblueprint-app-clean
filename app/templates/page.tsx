'use client'

import { useState, useEffect, Suspense } from 'react'
import Navigation from '@/components/Navigation'
import { getPatterns, Pattern } from '@/lib/api'
import { Copy, Download, RefreshCw, Sparkles, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function TemplatesContent() {
  const searchParams = useSearchParams()
  const patternId = searchParams.get('pattern')
  
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [generatedContent, setGeneratedContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatterns()
  }, [])

  useEffect(() => {
    if (patternId && patterns.length > 0) {
      const pattern = patterns.find(p => p.id === patternId)
      if (pattern) {
        setSelectedPattern(pattern)
        initializeVariables(pattern)
      }
    }
  }, [patternId, patterns])

  async function loadPatterns() {
    setLoading(true)
    const data = await getPatterns({ limit: 100 })
    setPatterns(data)
    setLoading(false)
  }

  function initializeVariables(pattern: Pattern) {
    const vars = pattern.template.match(/\{([^}]+)\}/g) || []
    const varMap: Record<string, string> = {}
    vars.forEach(v => {
      const key = v.replace(/[{}]/g, '')
      varMap[key] = ''
    })
    setVariables(varMap)
    setGeneratedContent('')
  }

  function generateContent() {
    if (!selectedPattern) return
    
    let content = selectedPattern.template
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `[${key}]`)
    })
    setGeneratedContent(content)
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadTemplate() {
    const element = document.createElement('a')
    const file = new Blob([generatedContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'viral-template.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const exampleFills: Record<string, string[]> = {
    situation: ['at a family dinner', 'in a meeting', 'on a first date', 'at the gym'],
    unexpected_outcome: ['your ex walks in', 'everyone starts singing', 'the WiFi goes down', 'your mom calls'],
    quirky_behavior: ['reorganizing my entire room at 3am', 'creating a spreadsheet for my snacks', 'talking to my plants'],
    demographic: ['introverts', 'millennials', 'developers', 'students'],
    topic: ['dating', 'productivity', 'mental health', 'money'],
    number: ['5', '7', '10', '3'],
    items: ['things', 'hacks', 'tips', 'secrets'],
    challenge: ['learning a new skill', 'working out', 'eating healthy', 'saving money'],
    relatable_situation: ['Monday morning', 'payday', 'Friday afternoon', 'Sunday night'],
    achieve_goal: ['get fit', 'save money', 'be productive', 'learn coding'],
    timeframe: ['30 days', '1 week', '24 hours', '3 months'],
    controversial_opinion: ['Coffee is overrated', 'Morning routines are useless', '9-5 jobs are outdated'],
    adjective: ['simple', 'weird', 'unexpected', 'genius'],
    noun: ['trick', 'hack', 'method', 'technique'],
    benefit: ['saves you hours', 'changes everything', 'nobody talks about', 'actually works']
  }

  function autoFillExample() {
    if (!selectedPattern) return
    
    const newVars: Record<string, string> = {}
    Object.keys(variables).forEach(key => {
      const examples = exampleFills[key.toLowerCase()] || [`example ${key}`]
      newVars[key] = examples[Math.floor(Math.random() * examples.length)]
    })
    setVariables(newVars)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Generator</h1>
          <p className="text-gray-600">Transform viral patterns into customized content templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Pattern</h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {patterns.map(pattern => (
                    <button
                      key={pattern.id}
                      onClick={() => {
                        setSelectedPattern(pattern)
                        initializeVariables(pattern)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedPattern?.id === pattern.id
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 line-clamp-2">
                        {pattern.template}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{pattern.category}</span>
                        <span className="text-xs font-semibold text-green-600">
                          {pattern.avg_viral_ratio.toFixed(1)}x
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPattern ? (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Customize Variables</h2>
                    <button
                      onClick={autoFillExample}
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Auto-fill Example
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(variables).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={generateContent}
                    className="w-full mt-6 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-semibold"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate Content
                  </button>
                </div>

                {generatedContent && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Generated Template</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                          {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={downloadTemplate}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                      <p className="text-lg text-gray-900 font-medium leading-relaxed">
                        {generatedContent}
                      </p>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                          <strong>Pro Tip:</strong> This template has an average viral ratio of {selectedPattern.avg_viral_ratio.toFixed(1)}x 
                          based on {selectedPattern.sample_size} samples. Adapt it to match your unique voice and audience!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Pattern to Start</h3>
                <p className="text-gray-600">Choose a viral pattern from the left to begin creating your custom template</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplatesContent />
    </Suspense>
  )
}