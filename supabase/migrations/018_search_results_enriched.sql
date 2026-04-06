-- Enrich search results with bio, review stats, response rate, insurance
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
  has_insurance boolean,
  distance_meters double precision,
  sitter_lat double precision,
  sitter_lng double precision,
  bio text,
  city text,
  review_count bigint,
  avg_rating numeric,
  experience_years int
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
    sp.has_insurance,
    ST_Distance(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters,
    ST_Y(sp.location::geometry) as sitter_lat,
    ST_X(sp.location::geometry) as sitter_lng,
    p.bio,
    p.city,
    (select count(*) from public.reviews r where r.reviewee_id = p.id) as review_count,
    (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.reviewee_id = p.id) as avg_rating,
    sp.experience_years
  from public.sitter_profiles sp
  join public.profiles p on p.id = sp.id
  where sp.is_available = true
    and ST_DWithin(sp.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
end;
$$ language plpgsql security definer;
