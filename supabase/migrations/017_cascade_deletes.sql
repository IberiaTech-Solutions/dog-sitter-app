-- Fix foreign keys missing ON DELETE CASCADE for user deletion

-- visit_logs.sitter_id
alter table public.visit_logs drop constraint visit_logs_sitter_id_fkey;
alter table public.visit_logs add constraint visit_logs_sitter_id_fkey
  foreign key (sitter_id) references public.profiles(id) on delete cascade;

-- bookings.cancelled_by
alter table public.bookings drop constraint if exists bookings_cancelled_by_fkey;
alter table public.bookings add constraint bookings_cancelled_by_fkey
  foreign key (cancelled_by) references public.profiles(id) on delete set null;

-- payments.payer_id
alter table public.payments drop constraint payments_payer_id_fkey;
alter table public.payments add constraint payments_payer_id_fkey
  foreign key (payer_id) references public.profiles(id) on delete cascade;

-- reviews.reviewer_id
alter table public.reviews drop constraint reviews_reviewer_id_fkey;
alter table public.reviews add constraint reviews_reviewer_id_fkey
  foreign key (reviewer_id) references public.profiles(id) on delete cascade;

-- reviews.reviewee_id
alter table public.reviews drop constraint reviews_reviewee_id_fkey;
alter table public.reviews add constraint reviews_reviewee_id_fkey
  foreign key (reviewee_id) references public.profiles(id) on delete cascade;

-- messages.sender_id
alter table public.messages drop constraint messages_sender_id_fkey;
alter table public.messages add constraint messages_sender_id_fkey
  foreign key (sender_id) references public.profiles(id) on delete cascade;

-- messages.recipient_id
alter table public.messages drop constraint messages_recipient_id_fkey;
alter table public.messages add constraint messages_recipient_id_fkey
  foreign key (recipient_id) references public.profiles(id) on delete cascade;

-- referral_credits.related_user_id
alter table public.referral_credits drop constraint if exists referral_credits_related_user_id_fkey;
alter table public.referral_credits add constraint referral_credits_related_user_id_fkey
  foreign key (related_user_id) references public.profiles(id) on delete set null;

-- profiles.referred_by
alter table public.profiles drop constraint if exists profiles_referred_by_fkey;
alter table public.profiles add constraint profiles_referred_by_fkey
  foreign key (referred_by) references public.profiles(id) on delete set null;
