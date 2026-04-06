-- Add daycare to booking service types
alter table public.bookings
  drop constraint bookings_service_type_check,
  add constraint bookings_service_type_check
    check (service_type in ('dog_walking', 'pet_sitting', 'drop_in', 'overnight', 'daycare', 'meet_greet'));
