/*
  # Create journal entries table

  1. New Tables
    - `journal_entries`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text, required)
      - `content` (text, required)
      - `mood` (enum: happy, sad, anxious, calm, excited, neutral)
      - `date` (date, required)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `journal_entries` table
    - Add policy for authenticated users to manage their own journal entries
*/

-- Create enum for mood types
CREATE TYPE mood_type AS ENUM ('happy', 'sad', 'anxious', 'calm', 'excited', 'neutral');

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  mood mood_type NOT NULL,
  date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS journal_entries_user_date_idx ON journal_entries(user_id, date);