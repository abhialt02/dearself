import React, { useState, useEffect } from 'react'
import { Activity, Target, TrendingUp, Award, Plus, Edit3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface StepsLog {
  id: string
  steps: number
  date: string
  created_at: string
}

const DAILY_GOAL = 10000 // 10k steps daily goal

export default function Steps() {
  const { user } = useAuth()
  const [todaySteps, setTodaySteps] = useState<StepsLog | null>(null)
  const [weeklySteps, setWeeklySteps] = useState<StepsLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showStepsForm, setShowStepsForm] = useState(false)
  const [stepsInput, setStepsInput] = useState('')

  useEffect(() => {
    if (user) {
      fetchStepsData()
    }
  }, [user])

  const fetchStepsData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      // Fetch today's steps
      const { data: todayData } = await supabase
        .from('steps_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      // Fetch weekly steps
      const { data: weeklyData } = await supabase
        .from('steps_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date', { ascending: false })

      setTodaySteps(todayData?.[0] || null)
      setWeeklySteps(weeklyData || [])
    } catch (error) {
      console.error('Error fetching steps data:', error)
    } finally {
      setLoading(false)
    }
  }

  const logSteps = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !stepsInput) return

    const steps = parseInt(stepsInput)
    if (steps < 0) return

    const today = new Date().toISOString().split('T')[0]

    try {
      if (todaySteps) {
        // Update existing record
        const { error } = await supabase
          .from('steps_logs')
          .update({ steps })
          .eq('id', todaySteps.id)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('steps_logs')
          .insert([{
            steps,
            date: today,
            user_id: user.id
          }])

        if (error) throw error
      }

      fetchStepsData()
      setShowStepsForm(false)
      setStepsInput('')
    } catch (error) {
      console.error('Error logging steps:', error)
    }
  }

  const getRecommendation = () => {
    const steps = todaySteps?.steps || 0
    const percentage = (steps / DAILY_GOAL) * 100
    const currentHour = new Date().getHours()

    if (percentage >= 100) {
      return {
        title: 'Outstanding! 🏆',
        message: 'You\'ve crushed your daily step goal! Keep up the amazing work.',
        color: 'from-green-400 to-emerald-500',
        suggestions: [
          'Consider a gentle cool-down walk',
          'Stretch to prevent muscle soreness',
          'Celebrate your achievement!'
        ]
      }
    } else if (percentage >= 75) {
      return {
        title: 'Almost there! 💪',
        message: `Just ${DAILY_GOAL - steps} more steps to reach your goal.`,
        color: 'from-pastel-purple-deep to-pastel-magenta-deep',
        suggestions: [
          'Take a short walk around the block',
          'Use stairs instead of elevators',
          'Park further away from your destination'
        ]
      }
    } else if (currentHour > 18 && percentage < 50) {
      return {
        title: 'Evening boost needed! 🌅',
        message: 'It\'s getting late, but you can still make progress.',
        color: 'from-orange-400 to-red-400',
        suggestions: [
          'Take a brisk 15-minute walk',
          'Do some indoor walking or dancing',
          'Walk while talking on the phone'
        ]
      }
    } else if (percentage < 25 && currentHour > 12) {
      return {
        title: 'Time to get moving! 🚶‍♀️',
        message: 'Your body is ready for some activity.',
        color: 'from-blue-400 to-cyan-400',
        suggestions: [
          'Take a lunch break walk',
          'Walk to a nearby coffee shop',
          'Try walking meetings if possible'
        ]
      }
    } else {
      return {
        title: 'Great start! 🌟',
        message: `You're ${percentage.toFixed(0)}% of the way to your goal.`,
        color: 'from-pastel-pink-deep to-pastel-purple-deep',
        suggestions: [
          'Take regular walking breaks',
          'Walk while listening to music or podcasts',
          'Find a walking buddy for motivation'
        ]
      }
    }
  }

  const recommendation = getRecommendation()
  const todayPercentage = todaySteps ? Math.min((todaySteps.steps / DAILY_GOAL) * 100, 100) : 0
  const weeklyAverage = weeklySteps.length > 0 
    ? Math.round(weeklySteps.reduce((sum, log) => sum + log.steps, 0) / weeklySteps.length)
    : 0

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 h-48"></div>
        <div className="bg-white rounded-2xl p-6 h-32"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent mb-2">
          DearSelf Steps
        </h1>
        <p className="text-gray-600">Every step counts towards a healthier you</p>
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - todayPercentage / 100)}`}
                className="text-pastel-purple-deep transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-8 w-8 text-pastel-purple-deep mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {todaySteps?.steps.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">of {DAILY_GOAL.toLocaleString()}</p>
                <p className="text-lg font-semibold text-pastel-purple-deep">
                  {todayPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowStepsForm(true)
              setStepsInput(todaySteps?.steps.toString() || '')
            }}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep text-white rounded-xl hover:from-pastel-pink-dark to-pastel-purple-dark transition-all duration-200 shadow-lg"
          >
            {todaySteps ? (
              <>
                <Edit3 className="h-5 w-5 mr-2" />
                Update Steps
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Log Steps
              </>
            )}
          </button>
        </div>

        {/* Steps Form */}
        {showStepsForm && (
          <div className="bg-gray-50 rounded-2xl p-6 animate-slide-up">
            <form onSubmit={logSteps} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps taken today
                </label>
                <input
                  type="number"
                  placeholder="Enter your steps"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep text-center text-2xl font-bold"
                  min="0"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-pastel-purple-deep text-white py-3 rounded-lg hover:bg-pastel-purple-dark font-medium"
                >
                  {todaySteps ? 'Update Steps' : 'Log Steps'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStepsForm(false)
                    setStepsInput('')
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className={`bg-gradient-to-r ${recommendation.color} rounded-2xl p-6 text-white`}>
        <h3 className="font-bold text-xl mb-2">{recommendation.title}</h3>
        <p className="text-white/90 mb-4">{recommendation.message}</p>
        <div className="space-y-2">
          {recommendation.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start">
              <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/90">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <Target className="h-8 w-8 text-pastel-purple-deep mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{DAILY_GOAL.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Daily Goal</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <TrendingUp className="h-8 w-8 text-pastel-magenta-deep mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">{weeklyAverage.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Weekly Average</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <Award className="h-8 w-8 text-pastel-rose-deep mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {weeklySteps.filter(log => log.steps >= DAILY_GOAL).length}
          </p>
          <p className="text-sm text-gray-600">Goals Met This Week</p>
        </div>
      </div>

      {/* Weekly Progress */}
      {weeklySteps.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-pastel-purple-deep" />
            Weekly Progress
          </h3>
          <div className="space-y-3">
            {weeklySteps.slice(0, 7).map((log, index) => {
              const percentage = Math.min((log.steps / DAILY_GOAL) * 100, 100)
              const date = new Date(log.date)
              const isToday = log.date === new Date().toISOString().split('T')[0]
              
              return (
                <div
                  key={log.id}
                  className={`animate-slide-up ${isToday ? 'ring-2 ring-pastel-purple-deep' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-pastel-purple-deep' : 'text-gray-700'}`}>
                      {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      {isToday && ' (Today)'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{log.steps.toLocaleString()}</span>
                      {log.steps >= DAILY_GOAL && (
                        <Award className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        percentage >= 100 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : 'bg-gradient-to-r from-pastel-purple-deep to-pastel-magenta-deep'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Activity Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-pastel-purple-deep" />
          Activity Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pastel-pink-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Start Small</h4>
            <p className="text-sm text-gray-600">Begin with short walks and gradually increase duration and intensity.</p>
          </div>
          <div className="p-4 bg-pastel-purple-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Make it Fun</h4>
            <p className="text-sm text-gray-600">Listen to music, podcasts, or walk with friends to stay motivated.</p>
          </div>
          <div className="p-4 bg-pastel-lavender-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Track Progress</h4>
            <p className="text-sm text-gray-600">Use a smartphone or fitness tracker to monitor your daily steps.</p>
          </div>
          <div className="p-4 bg-pastel-rose-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Stay Consistent</h4>
            <p className="text-sm text-gray-600">Aim for regular activity rather than intense bursts followed by rest days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}