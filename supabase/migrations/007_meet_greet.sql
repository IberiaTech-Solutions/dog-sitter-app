-- Add meet & greet statuses to bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'pending_payment', 'requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed',
    'meet_greet_requested', 'meet_greet_accepted', 'meet_greet_completed'
  ));

-- Add meet_greet_date column for scheduling the meeting
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meet_greet_date timestamptz;

-- Add is_meet_greet flag to distinguish from regular bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_meet_greet boolean NOT NULL DEFAULT false;
