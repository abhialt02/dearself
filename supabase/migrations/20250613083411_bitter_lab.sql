/*
  # Create steps logs table

  1. New Tables
    - `steps_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `steps` (integer, required, default 0)
      - `date` (date, required)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `steps_logs` table
    - Add policy for authenticated users to manage their own steps logs
*/

-- Create steps_logs table
CREATE TABLE IF NOT EXISTS steps_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  steps integer NOT NULL DEFAULT 0 CHECK (steps >= 0),
  date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE steps_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own steps logs"
  ON steps_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own steps logs"
  ON steps_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own steps logs"
  ON steps_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own steps logs"
  ON steps_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS steps_logs_user_id_idx ON steps_logs(user_id);
CREATE INDEX IF NOT EXISTS steps_logs_date_idx ON steps_logs(date DESC);
CREATE INDEX IF NOT EXISTS steps_logs_user_date_idx ON steps_logs(user_id, date);

-- Create unique constraint to prevent duplicate entries per user per date
CREATE UNIQUE INDEX IF NOT EXISTS steps_logs_user_date_unique ON steps_logs(user_id, date);