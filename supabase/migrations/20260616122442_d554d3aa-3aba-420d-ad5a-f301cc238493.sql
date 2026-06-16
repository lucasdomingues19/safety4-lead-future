INSERT INTO public.certificates (
  id,
  certificate_number,
  recipient_name,
  recipient_email,
  course_name,
  completion_date,
  credential_level,
  cpd_hours,
  status,
  issued_at,
  created_at
) VALUES (
  gen_random_uuid(),
  'SA4-2026-00002',
  'Lucas Domingues',
  'lucas.domingues1985@gmail.com',
  'IOSH-approved Safety 4.0 - Leading Safety in the Digital Age',
  '2026-05-29',
  'Professional Certificate',
  40,
  'issued',
  '2026-05-29T00:00:00+00',
  now()
);

-- Make sure the sequence won't try to reuse 00002 later
SELECT setval('public.certificate_seq', 3, true);