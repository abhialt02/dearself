import React, { useEffect, useState } from 'react'
import { CheckSquare, Droplets, Activity, Heart, BookOpen, Wind } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface DashboardStats {
  todayTasks: number
  completedTasks: number
  hydrationAmount: number
  todaySteps: number
  journalEntries: number
  moodScore: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    todayTasks: 0,
    completedTasks: 0,
    hydrationAmount: 0,
    todaySteps: 0,
    journalEntries: 0,
    moodScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    try {
      // Fetch todos
      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)

      // Fetch hydration for today
      const { data: hydration } = await supabase
        .from('hydration_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', today)

      // Fetch steps for today
      const { data: steps } = await supabase
        .from('steps_logs')
        .select('steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      // Fetch journal entries count
      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch recent mood
      const { data: recentMood } = await supabase
        .from('mood_logs')
        .select('intensity')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const totalHydration = hydration?.reduce((sum, log) => sum + log.amount_ml, 0) || 0
      const todayTasks = todos?.length || 0
      const completedTasks = todos?.filter(todo => todo.completed).length || 0

      setStats({
        todayTasks,
        completedTasks,
        hydrationAmount: totalHydration,
        todaySteps: steps?.steps || 0,
        journalEntries: journalCount || 0,
        moodScore: recentMood?.intensity || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Tasks Today',
      value: `${stats.completedTasks}/${stats.todayTasks}`,
      icon: CheckSquare,
      color: 'from-pastel-pink-light to-pastel-pink',
      textColor: 'text-pastel-pink-deep'
    },
    {
      title: 'Hydration',
      value: `${stats.hydrationAmount}ml`,
      icon: Droplets,
      color: 'from-pastel-purple-light to-pastel-purple',
      textColor: 'text-pastel-purple-deep'
    },
    {
      title: 'Steps Today',
      value: stats.todaySteps.toLocaleString(),
      icon: Activity,
      color: 'from-pastel-rose-light to-pastel-rose',
      textColor: 'text-pastel-rose-deep'
    },
    {
      title: 'Mood Score',
      value: `${stats.moodScore}/10`,
      icon: Heart,
      color: 'from-pastel-lavender-light to-pastel-lavender',
      textColor: 'text-pastel-lavender-deep'
    },
    {
      title: 'Journal Entries',
      value: stats.journalEntries,
      icon: BookOpen,
      color: 'from-pastel-magenta-light to-pastel-magenta',
      textColor: 'text-pastel-magenta-deep'
    },
    {
      title: 'Breathing Sessions',
      value: '0', // This would come from a breathing_sessions table
      icon: Wind,
      color: 'from-pastel-pink-light to-pastel-purple-light',
      textColor: 'text-pastel-purple-deep'
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent mb-2">
          DearSelf Dashboard
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600">
          Here's how your wellness journey is going today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-white/20`}>
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-pastel-pink-light rounded-xl hover:bg-pastel-pink transition-colors text-left">
              <Wind className="h-8 w-8 text-pastel-pink-deep mb-2" />
              <p className="font-medium text-gray-900">Start Breathing</p>
              <p className="text-sm text-gray-600">5 min session</p>
            </button>
            <button className="p-4 bg-pastel-purple-light rounded-xl hover:bg-pastel-purple transition-colors text-left">
              <Droplets className="h-8 w-8 text-pastel-purple-deep mb-2" />
              <p className="font-medium text-gray-900">Log Water</p>
              <p className="text-sm text-gray-600">250ml glass</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Recommendations
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-pastel-lavender-light rounded-lg">
              <Heart className="h-5 w-5 text-pastel-lavender-deep mr-3" />
              <p className="text-sm text-gray-700">Take a 10-minute mindfulness break</p>
            </div>
            <div className="flex items-center p-3 bg-pastel-rose-light rounded-lg">
              <Activity className="h-5 w-5 text-pastel-rose-deep mr-3" />
              <p className="text-sm text-gray-700">You're 2,000 steps away from your goal!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}