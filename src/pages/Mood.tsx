import React, { useState, useEffect } from 'react'
import { Heart, TrendingUp, Calendar, Smile, Frown, Meh, Zap, Wind, Sun } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface MoodLog {
  id: string
  mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
  intensity: number
  notes: string | null
  date: string
  created_at: string
}

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'from-yellow-400 to-orange-400', emoji: '😊' },
  { value: 'excited', label: 'Excited', icon: Zap, color: 'from-pink-400 to-red-400', emoji: '🤩' },
  { value: 'calm', label: 'Calm', icon: Wind, color: 'from-blue-400 to-cyan-400', emoji: '😌' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'from-gray-400 to-gray-500', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', icon: Heart, color: 'from-purple-400 to-pink-400', emoji: '😰' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'from-blue-500 to-indigo-500', emoji: '😢' },
] as const

export default function Mood() {
  const { user } = useAuth()
  const [todayMood, setTodayMood] = useState<MoodLog | null>(null)
  const [weeklyMoods, setWeeklyMoods] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0]['value'] | ''>('')
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchMoodData()
    }
  }, [user])

  const fetchMoodData = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      // Fetch today's mood
      const { data: todayData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch weekly moods
      const { data: weeklyData } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo)
        .order('date', { ascending: false })

      setTodayMood(todayData || null)
      setWeeklyMoods(weeklyData || [])
    } catch (error) {
      console.error('Error fetching mood data:', error)
    } finally {
      setLoading(false)
    }
  }

  const logMood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMood) return

    const today = new Date().toISOString().split('T')[0]

    try {
      // If there's already a mood for today, update it; otherwise, create new
      if (todayMood) {
        const { error } = await supabase
          .from('mood_logs')
          .update({
            mood: selectedMood,
            intensity,
            notes: notes || null
          })
          .eq('id', todayMood.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('mood_logs')
          .insert([{
            mood: selectedMood,
            intensity,
            notes: notes || null,
            date: today,
            user_id: user.id
          }])

        if (error) throw error
      }

      fetchMoodData()
      setShowMoodForm(false)
      setSelectedMood('')
      setIntensity(5)
      setNotes('')
    } catch (error) {
      console.error('Error logging mood:', error)
    }
  }

  const getMoodOption = (mood: string) => {
    return MOOD_OPTIONS.find(option => option.value === mood) || MOOD_OPTIONS[5]
  }

  const getRecommendation = () => {
    if (!todayMood) {
      return {
        title: 'Check in with yourself 💭',
        message: 'How are you feeling today? Tracking your mood helps build self-awareness.',
        color: 'from-pastel-purple-deep to-pastel-magenta-deep',
        suggestions: [
          'Take a moment to reflect on your current emotional state',
          'Consider what factors might be influencing your mood',
          'Remember that all emotions are valid and temporary'
        ]
      }
    }

    const { mood, intensity } = todayMood
    
    if (mood === 'happy' || mood === 'excited') {
      return {
        title: 'Wonderful energy! ✨',
        message: 'You\'re feeling great today. Here\'s how to maintain this positive state.',
        color: 'from-yellow-400 to-orange-400',
        suggestions: [
          'Share your positive energy with others',
          'Engage in activities that bring you joy',
          'Practice gratitude for this good feeling'
        ]
      }
    } else if (mood === 'calm') {
      return {
        title: 'Beautiful balance 🧘‍♀️',
        message: 'Your calm state is perfect for mindful activities.',
        color: 'from-blue-400 to-cyan-400',
        suggestions: [
          'Try some gentle meditation or breathing exercises',
          'Enjoy nature or peaceful surroundings',
          'Use this time for creative or reflective activities'
        ]
      }
    } else if (mood === 'anxious' && intensity > 6) {
      return {
        title: 'Take it easy 🤗',
        message: 'High anxiety can be challenging. Here are some ways to find relief.',
        color: 'from-purple-400 to-pink-400',
        suggestions: [
          'Try the 4-7-8 breathing technique',
          'Go for a gentle walk or do light exercise',
          'Practice grounding techniques (5-4-3-2-1 method)'
        ]
      }
    } else if (mood === 'sad' && intensity > 6) {
      return {
        title: 'Be gentle with yourself 💙',
        message: 'It\'s okay to feel sad. Here are some nurturing activities.',
        color: 'from-blue-500 to-indigo-500',
        suggestions: [
          'Reach out to a trusted friend or family member',
          'Engage in a comforting activity you enjoy',
          'Consider journaling about your feelings'
        ]
      }
    } else {
      return {
        title: 'Every feeling matters 🌈',
        message: 'Your emotions are valid. Here are some general wellness tips.',
        color: 'from-pastel-pink-deep to-pastel-purple-deep',
        suggestions: [
          'Stay hydrated and eat nourishing foods',
          'Get some fresh air and natural light',
          'Practice self-compassion and patience'
        ]
      }
    }
  }

  const recommendation = getRecommendation()
  const averageIntensity = weeklyMoods.length > 0 
    ? weeklyMoods.reduce((sum, mood) => sum + mood.intensity, 0) / weeklyMoods.length 
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
          DearSelf Mood
        </h1>
        <p className="text-gray-600">Track your emotional wellness journey</p>
      </div>

      {/* Today's Mood */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How are you feeling today?</h2>
          
          {todayMood ? (
            <div className="space-y-4">
              <div className={`inline-flex items-center px-6 py-4 bg-gradient-to-r ${getMoodOption(todayMood.mood).color} rounded-2xl text-white`}>
                <span className="text-3xl mr-3">{getMoodOption(todayMood.mood).emoji}</span>
                <div className="text-left">
                  <p className="font-bold text-lg">{getMoodOption(todayMood.mood).label}</p>
                  <p className="text-white/90">Intensity: {todayMood.intensity}/10</p>
                </div>
              </div>
              
              {todayMood.notes && (
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-gray-700 italic">"{todayMood.notes}"</p>
                </div>
              )}
              
              <button
                onClick={() => setShowMoodForm(true)}
                className="text-pastel-purple-deep hover:text-pastel-purple-dark font-medium"
              >
                Update today's mood
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMoodForm(true)}
              className="bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep text-white px-8 py-4 rounded-2xl hover:from-pastel-pink-dark to-pastel-purple-dark transition-all duration-200 shadow-lg"
            >
              Log Your Mood
            </button>
          )}
        </div>

        {/* Mood Form */}
        {showMoodForm && (
          <div className="bg-gray-50 rounded-2xl p-6 animate-slide-up">
            <form onSubmit={logMood} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMood(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedMood === option.value
                          ? `bg-gradient-to-r ${option.color} text-white border-transparent`
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.emoji}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Intensity: {intensity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's contributing to this feeling?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep h-20 resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!selectedMood}
                  className="flex-1 bg-pastel-purple-deep text-white py-3 rounded-lg hover:bg-pastel-purple-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {todayMood ? 'Update Mood' : 'Log Mood'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoodForm(false)
                    setSelectedMood('')
                    setIntensity(5)
                    setNotes('')
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
              <Sun className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/90">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      {weeklyMoods.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-pastel-purple-deep" />
              Weekly Overview
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">Average Intensity</p>
              <p className="text-2xl font-bold text-pastel-purple-deep">
                {averageIntensity.toFixed(1)}/10
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {weeklyMoods.slice(0, 7).map((mood, index) => {
              const moodOption = getMoodOption(mood.mood)
              const date = new Date(mood.date)
              const isToday = mood.date === new Date().toISOString().split('T')[0]
              
              return (
                <div
                  key={mood.id}
                  className={`flex items-center justify-between p-4 rounded-lg animate-slide-up ${
                    isToday ? 'bg-pastel-purple-light ring-2 ring-pastel-purple-deep' : 'bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{moodOption.emoji}</span>
                    <div>
                      <p className={`font-medium ${isToday ? 'text-pastel-purple-deep' : 'text-gray-900'}`}>
                        {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        {isToday && ' (Today)'}
                      </p>
                      <p className="text-sm text-gray-600">{moodOption.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{mood.intensity}/10</p>
                    {mood.notes && (
                      <p className="text-xs text-gray-500 max-w-32 truncate">{mood.notes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mood Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-pastel-purple-deep" />
          Emotional Wellness Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pastel-pink-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Daily Check-ins</h4>
            <p className="text-sm text-gray-600">Regular mood tracking helps identify patterns and triggers.</p>
          </div>
          <div className="p-4 bg-pastel-purple-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Mindful Breathing</h4>
            <p className="text-sm text-gray-600">Use breathing exercises to regulate emotions in the moment.</p>
          </div>
          <div className="p-4 bg-pastel-lavender-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Physical Activity</h4>
            <p className="text-sm text-gray-600">Exercise releases endorphins that naturally boost mood.</p>
          </div>
          <div className="p-4 bg-pastel-rose-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Social Connection</h4>
            <p className="text-sm text-gray-600">Sharing feelings with trusted people provides support and perspective.</p>
          </div>
        </div>
      </div>
    </div>
  )
}