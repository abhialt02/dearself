import React, { useState, useEffect } from 'react'
import { Plus, Check, Trash2, AlertCircle, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export default function Tasks() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
    setLoading(false)
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTask.title.trim()) return

    const { error } = await supabase
      .from('todos')
      .insert([{
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        user_id: user.id
      }])

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setNewTask({ title: '', description: '', priority: 'medium' })
      setShowForm(false)
      fetchTodos()
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      fetchTodos()
    }
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      fetchTodos()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-pastel-rose-deep bg-pastel-rose-light'
      case 'medium': return 'text-pastel-magenta-deep bg-pastel-magenta-light'
      case 'low': return 'text-pastel-purple-deep bg-pastel-purple-light'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const completedTasks = todos.filter(todo => todo.completed).length
  const totalTasks = todos.length

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 h-20"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent">
            DearSelf Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep text-white rounded-xl hover:from-pastel-pink-dark to-pastel-purple-dark transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg animate-slide-up">
          <form onSubmit={addTodo} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep focus:border-transparent"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep focus:border-transparent h-20 resize-none"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-deep focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-pastel-purple-deep text-white rounded-lg hover:bg-pastel-purple-dark transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Create your first task to get started!</p>
          </div>
        ) : (
          todos.map((todo, index) => (
            <div
              key={todo.id}
              className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 animate-slide-up ${
                todo.completed ? 'opacity-75' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    todo.completed
                      ? 'bg-pastel-purple-deep border-pastel-purple-deep'
                      : 'border-gray-300 hover:border-pastel-purple-deep'
                  }`}
                >
                  {todo.completed && <Check className="h-4 w-4 text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium truncate ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                  </div>
                  {todo.description && (
                    <p className={`text-sm mt-1 ${
                      todo.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {todo.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}