-- Add meet_greet to allowed service types
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_service_type_check
  CHECK (service_type IN ('dog_walking', 'pet_sitting', 'drop_in', 'overnight', 'meet_greet'));
