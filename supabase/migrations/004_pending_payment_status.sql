-- Add 'pending_payment' status for bookings created before Stripe payment completes
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending_payment', 'requested', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'));
