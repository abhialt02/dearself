/*
  # Create breathing sessions table

  1. New Tables
    - `breathing_sessions`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `pattern_name` (text, required)
      - `duration_seconds` (integer, required)
      - `cycles_completed` (integer, default 0)
      - `date` (date, required)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `breathing_sessions` table
    - Add policy for authenticated users to manage their own breathing sessions
*/

-- Create breathing_sessions table
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  pattern_name text NOT NULL,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  cycles_completed integer DEFAULT 0 CHECK (cycles_completed >= 0),
  date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own breathing sessions"
  ON breathing_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own breathing sessions"
  ON breathing_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own breathing sessions"
  ON breathing_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own breathing sessions"
  ON breathing_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS breathing_sessions_user_id_idx ON breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS breathing_sessions_date_idx ON breathing_sessions(date DESC);
CREATE INDEX IF NOT EXISTS breathing_sessions_user_date_idx ON breathing_sessions(user_id, date);