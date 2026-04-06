-- Update find_nearby_sitters to return sitter lat/lng for map display
DROP FUNCTION IF EXISTS find_nearby_sitters(double precision, double precision, integer);

create or replace function public.find_nearby_sitters(
  lat double precision,
  lng double precision,
  radius_meters int default 10000
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  hourly_rate numeric,
  services text[],
  pet_types text[],
  is_verified boolean,
  distance_meters double precision,
  sitter_lat double precision,
  sitter_lng double precision
) as $$
begin
  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    sp.hourly_rate,
    sp.services,
    sp.pet_types,
    sp.is_verified,
    ST_Distance(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters,
    ST_Y(sp.location::geometry) as sitter_lat,
    ST_X(sp.location::geometry) as sitter_lng
  from public.sitter_profiles sp
  join public.profiles p on p.id = sp.id
  where sp.is_available = true
    and ST_DWithin(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
end;
$$ language plpgsql;
