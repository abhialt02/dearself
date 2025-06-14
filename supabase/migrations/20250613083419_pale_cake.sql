/*
  # Create mood logs table

  1. New Tables
    - `mood_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `mood` (enum: happy, sad, anxious, calm, excited, neutral)
      - `intensity` (integer, 1-10 scale)
      - `notes` (text, optional)
      - `date` (date, required)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `mood_logs` table
    - Add policy for authenticated users to manage their own mood logs
*/

-- Create mood_logs table (reusing mood_type enum from journal_entries)
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  mood mood_type NOT NULL,
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  notes text,
  date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mood logs"
  ON mood_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood logs"
  ON mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs"
  ON mood_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON mood_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mood_logs_user_id_idx ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS mood_logs_date_idx ON mood_logs(date DESC);
CREATE INDEX IF NOT EXISTS mood_logs_user_date_idx ON mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS mood_logs_created_at_idx ON mood_logs(created_at DESC);