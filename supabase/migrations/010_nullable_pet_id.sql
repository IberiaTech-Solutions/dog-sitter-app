-- Allow pet_id to be null for meet & greet bookings
ALTER TABLE bookings ALTER COLUMN pet_id DROP NOT NULL;
