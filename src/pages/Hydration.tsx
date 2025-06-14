import React, { useState, useEffect } from 'react'
import { Droplets, Plus, TrendingUp, Award, Target, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface HydrationLog {
  id: string
  amount_ml: number
  date: string
  created_at: string
}

interface DailyStats {
  total: number
  goal: number
  percentage: number
  logs: HydrationLog[]
}

const DAILY_GOAL = 2000 // 2L daily goal
const QUICK_AMOUNTS = [250, 500, 750, 1000]

export default function Hydration() {
  const { user } = useAuth()
  const [todayStats, setTodayStats] = useState<DailyStats>({
    total: 0,
    goal: DAILY_GOAL,
    percentage: 0,
    logs: []
  })
  const [weeklyData, setWeeklyData] = useState<{ date: string; amount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    if (user) {
      fetchHydrationData()
    }
  }, [user])

  const fetchHydrationData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      // Fetch today's logs
      const { data: todayLogs } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      // Fetch weekly data
      const { data: weeklyLogs } = await supabase
        .from('hydration_logs')
        .select('amount_ml, date')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date', { ascending: true })

      const todayTotal = todayLogs?.reduce((sum, log) => sum + log.amount_ml, 0) || 0
      
      setTodayStats({
        total: todayTotal,
        goal: DAILY_GOAL,
        percentage: Math.min((todayTotal / DAILY_GOAL) * 100, 100),
        logs: todayLogs || []
      })

      // Process weekly data
      const weeklyMap = new Map()
      weeklyLogs?.forEach(log => {
        const existing = weeklyMap.get(log.date) || 0
        weeklyMap.set(log.date, existing + log.amount_ml)
      })

      const weeklyArray = Array.from(weeklyMap.entries()).map(([date, amount]) => ({
        date,
        amount
      }))

      setWeeklyData(weeklyArray)
    } catch (error) {
      console.error('Error fetching hydration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const logWater = async (amount: number) => {
    if (!user || amount <= 0) return

    const today = new Date().toISOString().split('T')[0]

    try {
      const { error } = await supabase
        .from('hydration_logs')
        .insert([{
          amount_ml: amount,
          date: today,
          user_id: user.id
        }])

      if (error) throw error

      fetchHydrationData()
      setCustomAmount('')
      setShowCustomInput(false)
    } catch (error) {
      console.error('Error logging water:', error)
    }
  }

  const getRecommendation = () => {
    const { total, percentage } = todayStats
    const currentHour = new Date().getHours()

    if (percentage >= 100) {
      return {
        type: 'success',
        title: 'Excellent hydration! 🎉',
        message: 'You\'ve reached your daily goal. Keep up the great work!',
        color: 'from-green-400 to-emerald-500'
      }
    } else if (percentage >= 75) {
      return {
        type: 'good',
        title: 'Almost there! 💪',
        message: `Just ${DAILY_GOAL - total}ml more to reach your goal.`,
        color: 'from-pastel-purple-deep to-pastel-magenta-deep'
      }
    } else if (currentHour > 18 && percentage < 50) {
      return {
        type: 'warning',
        title: 'Catch up time! ⏰',
        message: 'It\'s evening and you\'re behind. Try to drink more water before bed.',
        color: 'from-orange-400 to-red-400'
      }
    } else {
      return {
        type: 'info',
        title: 'Keep going! 💧',
        message: `You're ${percentage.toFixed(0)}% of the way to your goal.`,
        color: 'from-pastel-pink-deep to-pastel-purple-deep'
      }
    }
  }

  const recommendation = getRecommendation()

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 h-48"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-24"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent mb-2">
          DearSelf Hydration
        </h1>
        <p className="text-gray-600">Stay hydrated, stay healthy</p>
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
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - todayStats.percentage / 100)}`}
                className="text-pastel-purple-deep transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Droplets className="h-8 w-8 text-pastel-purple-deep mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{todayStats.total}ml</p>
                <p className="text-sm text-gray-600">of {todayStats.goal}ml</p>
                <p className="text-lg font-semibold text-pastel-purple-deep">
                  {todayStats.percentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`bg-gradient-to-r ${recommendation.color} rounded-xl p-4 text-white text-center mb-6`}>
          <h3 className="font-bold text-lg mb-1">{recommendation.title}</h3>
          <p className="text-white/90">{recommendation.message}</p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => logWater(amount)}
              className="bg-pastel-purple-light hover:bg-pastel-purple text-pastel-purple-deep rounded-xl p-4 transition-all duration-200 hover:scale-105"
            >
              <Droplets className="h-6 w-6 mx-auto mb-2" />
              <p className="font-semibold">{amount}ml</p>
              <p className="text-xs opacity-75">
                {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'Jumbo'}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="text-center">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="flex items-center justify-center mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom Amount
            </button>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <input
                type="number"
                placeholder="Amount in ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep w-32"
              />
              <button
                onClick={() => logWater(parseInt(customAmount))}
                disabled={!customAmount || parseInt(customAmount) <= 0}
                className="px-4 py-2 bg-pastel-purple-deep text-white rounded-lg hover:bg-pastel-purple-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomAmount('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's Logs */}
      {todayStats.logs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-pastel-purple-deep" />
            Today's Intake
          </h3>
          <div className="space-y-2">
            {todayStats.logs.map((log, index) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-pastel-purple-light rounded-lg animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 text-pastel-purple-deep mr-3" />
                  <span className="font-medium text-gray-900">{log.amount_ml}ml</span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(log.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      {weeklyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-pastel-purple-deep" />
            Weekly Progress
          </h3>
          <div className="space-y-3">
            {weeklyData.map((day, index) => {
              const percentage = Math.min((day.amount / DAILY_GOAL) * 100, 100)
              const date = new Date(day.date)
              const isToday = day.date === new Date().toISOString().split('T')[0]
              
              return (
                <div
                  key={day.date}
                  className={`animate-slide-up ${isToday ? 'ring-2 ring-pastel-purple-deep' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-pastel-purple-deep' : 'text-gray-700'}`}>
                      {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      {isToday && ' (Today)'}
                    </span>
                    <span className="text-sm text-gray-600">{day.amount}ml</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
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

      {/* Hydration Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-pastel-purple-deep" />
          Hydration Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pastel-pink-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Morning Boost</h4>
            <p className="text-sm text-gray-600">Start your day with a glass of water to kickstart your metabolism.</p>
          </div>
          <div className="p-4 bg-pastel-purple-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Before Meals</h4>
            <p className="text-sm text-gray-600">Drink water 30 minutes before meals to aid digestion.</p>
          </div>
          <div className="p-4 bg-pastel-lavender-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Exercise Hydration</h4>
            <p className="text-sm text-gray-600">Drink extra water before, during, and after exercise.</p>
          </div>
          <div className="p-4 bg-pastel-rose-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Evening Wind-down</h4>
            <p className="text-sm text-gray-600">Stop drinking 2 hours before bed to avoid sleep disruption.</p>
          </div>
        </div>
      </div>
    </div>
  )
}