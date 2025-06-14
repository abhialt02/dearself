import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          user_id?: string
        }
      }
      hydration_logs: {
        Row: {
          id: string
          created_at: string
          amount_ml: number
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          amount_ml: number
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          amount_ml?: number
          date?: string
          user_id?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          mood?: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          date?: string
          user_id?: string
        }
      }
      steps_logs: {
        Row: {
          id: string
          created_at: string
          steps: number
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          steps: number
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          steps?: number
          date?: string
          user_id?: string
        }
      }
      mood_logs: {
        Row: {
          id: string
          created_at: string
          mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          intensity: number
          notes: string | null
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          intensity: number
          notes?: string | null
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          mood?: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'neutral'
          intensity?: number
          notes?: string | null
          date?: string
          user_id?: string
        }
      }
      breathing_sessions: {
        Row: {
          id: string
          created_at: string
          pattern_name: string
          duration_seconds: number
          cycles_completed: number
          date: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          pattern_name: string
          duration_seconds: number
          cycles_completed?: number
          date: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          pattern_name?: string
          duration_seconds?: number
          cycles_completed?: number
          date?: string
          user_id?: string
        }
      }
    }
  }
}