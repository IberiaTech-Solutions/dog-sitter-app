-- Add cancellation policy to sitter profiles
ALTER TABLE sitter_profiles
  ADD COLUMN IF NOT EXISTS cancellation_policy text NOT NULL DEFAULT 'flexible'
  CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict'));
