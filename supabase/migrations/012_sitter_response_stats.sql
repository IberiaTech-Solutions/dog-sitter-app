-- Function to calculate sitter response stats from booking data
CREATE OR REPLACE FUNCTION public.sitter_response_stats(sitter_uuid uuid)
RETURNS json AS $$
DECLARE
  total_requests int;
  responded int;
  avg_response_minutes numeric;
  result json;
BEGIN
  -- Count total booking requests received (excluding meet & greets)
  SELECT count(*) INTO total_requests
  FROM bookings
  WHERE sitter_id = sitter_uuid
    AND is_meet_greet = false
    AND status != 'pending_payment';

  -- Count bookings that were responded to (confirmed or cancelled by sitter)
  SELECT count(*) INTO responded
  FROM bookings
  WHERE sitter_id = sitter_uuid
    AND is_meet_greet = false
    AND status IN ('confirmed', 'in_progress', 'completed', 'cancelled');

  -- Average time between created_at and updated_at for responded bookings
  SELECT COALESCE(
    EXTRACT(EPOCH FROM avg(updated_at - created_at)) / 60,
    0
  ) INTO avg_response_minutes
  FROM bookings
  WHERE sitter_id = sitter_uuid
    AND is_meet_greet = false
    AND status IN ('confirmed', 'cancelled')
    AND updated_at > created_at;

  result := json_build_object(
    'total_requests', total_requests,
    'responded', responded,
    'response_rate', CASE WHEN total_requests > 0 THEN round((responded::numeric / total_requests) * 100) ELSE 0 END,
    'avg_response_minutes', round(avg_response_minutes)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;
