import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit3, Trash2, Calendar, Heart, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
  date: string
  created_at: string
}

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'from-pink-400 to-red-400' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'from-blue-400 to-cyan-400' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'from-gray-400 to-gray-500' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-pink-400' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-500' },
] as const

export default function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [moodFilter, setMoodFilter] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as const,
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.content.trim()) return

    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: formData.title,
            content: formData.content,
            mood: formData.mood,
            date: formData.date
          })
          .eq('id', editingEntry.id)

        if (error) throw error
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([{
            title: formData.title,
            content: formData.content,
            mood: formData.mood,
            date: formData.date,
            user_id: user.id
          }])

        if (error) throw error
      }

      fetchEntries()
      resetForm()
    } catch (error) {
      console.error('Error saving journal entry:', error)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchEntries()
    } catch (error) {
      console.error('Error deleting journal entry:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(false)
    setEditingEntry(null)
  }

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      date: entry.date
    })
    setShowForm(true)
  }

  const getMoodOption = (mood: string) => {
    return MOOD_OPTIONS.find(option => option.value === mood) || MOOD_OPTIONS[3]
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMood = !moodFilter || entry.mood === moodFilter
    return matchesSearch && matchesMood
  })

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 h-32"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 h-48"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent">
            DearSelf Journal
          </h1>
          <p className="text-gray-600 mt-1">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} • Reflect on your thoughts and feelings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep text-white rounded-xl hover:from-pastel-pink-dark to-pastel-purple-dark transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Entry
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep appearance-none bg-white min-w-[150px]"
            >
              <option value="">All Moods</option>
              {MOOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-8 shadow-lg animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
          </h2>
          <form onSubmit={saveEntry} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Give your entry a title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: option.value })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.mood === option.value
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your thoughts
              </label>
              <textarea
                placeholder="What's on your mind today? Write about your experiences, feelings, or anything you'd like to remember..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep h-40 resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {getWordCount(formData.content)} words
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-pastel-purple-deep text-white py-3 rounded-lg hover:bg-pastel-purple-dark font-medium transition-colors"
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {entries.length === 0 ? 'Start Your Journal' : 'No entries found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {entries.length === 0 
                ? 'Begin your wellness journey by writing your first journal entry.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {entries.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep text-white px-6 py-3 rounded-lg hover:from-pastel-pink-dark to-pastel-purple-dark transition-all duration-200"
              >
                Write First Entry
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const moodOption = getMoodOption(entry.mood)
            const date = new Date(entry.date)
            const isToday = entry.date === new Date().toISOString().split('T')[0]
            
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-slide-up ${
                  isToday ? 'ring-2 ring-pastel-purple-deep' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{entry.title}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${moodOption.color} text-white text-sm`}>
                        <span className="mr-1">{moodOption.emoji}</span>
                        {moodOption.label}
                      </div>
                      {isToday && (
                        <span className="px-2 py-1 bg-pastel-purple-light text-pastel-purple-deep text-xs rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {date.toLocaleDateString([], { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <span>{getWordCount(entry.content)} words</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(entry)}
                      className="p-2 text-gray-400 hover:text-pastel-purple-deep transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content.length > 300 
                      ? `${entry.content.substring(0, 300)}...` 
                      : entry.content
                    }
                  </p>
                </div>
                
                {entry.content.length > 300 && (
                  <button
                    onClick={() => startEdit(entry)}
                    className="mt-3 text-pastel-purple-deep hover:text-pastel-purple-dark font-medium text-sm"
                  >
                    Read more
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Journal Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-pastel-purple-deep" />
          Journaling Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pastel-pink-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Be Honest</h4>
            <p className="text-sm text-gray-600">Write authentically about your thoughts and feelings without judgment.</p>
          </div>
          <div className="p-4 bg-pastel-purple-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Write Regularly</h4>
            <p className="text-sm text-gray-600">Even a few minutes daily can help you process emotions and track patterns.</p>
          </div>
          <div className="p-4 bg-pastel-lavender-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Include Details</h4>
            <p className="text-sm text-gray-600">Note specific events, people, or circumstances that influenced your day.</p>
          </div>
          <div className="p-4 bg-pastel-rose-light rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Reflect & Grow</h4>
            <p className="text-sm text-gray-600">Look back at past entries to identify growth and recurring themes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}