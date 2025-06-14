/*
  # Create hydration logs table

  1. New Tables
    - `hydration_logs`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `amount_ml` (integer, required)
      - `date` (date, required)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `hydration_logs` table
    - Add policy for authenticated users to manage their own hydration logs
*/

-- Create hydration_logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  date date NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hydration logs"
  ON hydration_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hydration logs"
  ON hydration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration logs"
  ON hydration_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration logs"
  ON hydration_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS hydration_logs_user_id_idx ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS hydration_logs_date_idx ON hydration_logs(date DESC);
CREATE INDEX IF NOT EXISTS hydration_logs_user_date_idx ON hydration_logs(user_id, date);