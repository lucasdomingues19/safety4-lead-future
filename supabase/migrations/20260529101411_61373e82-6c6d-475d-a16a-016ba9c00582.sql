-- Sequence for sequential certificate numbering
CREATE SEQUENCE IF NOT EXISTS public.certificate_seq START 1;

-- Certificates table
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number text NOT NULL UNIQUE,
  recipient_name text NOT NULL,
  recipient_email text NOT NULL,
  course_name text NOT NULL,
  completion_date date NOT NULL,
  credential_level text,
  cpd_hours numeric,
  status text NOT NULL DEFAULT 'issued',
  revoked_at timestamp with time zone,
  revoke_reason text,
  issued_by uuid,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Grants (Data API access). No anon grant: public verification uses a SECURITY DEFINER function.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view certificates"
  ON public.certificates FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert certificates"
  ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update certificates"
  ON public.certificates FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete certificates"
  ON public.certificates FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Assign immutable sequential certificate number on insert
CREATE OR REPLACE FUNCTION public.set_certificate_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    NEW.certificate_number := 'SA4-' || to_char(timezone('utc', now()), 'YYYY') || '-' ||
      lpad(nextval('public.certificate_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_certificate_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_certificate_number();

-- Protect immutable fields from being changed after issue
CREATE OR REPLACE FUNCTION public.protect_certificate_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.certificate_number IS DISTINCT FROM OLD.certificate_number THEN
    RAISE EXCEPTION 'certificate_number is immutable and cannot be changed';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'certificate id is immutable and cannot be changed';
  END IF;
  IF NEW.issued_at IS DISTINCT FROM OLD.issued_at THEN
    RAISE EXCEPTION 'issued_at is immutable and cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_certificate
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.protect_certificate_immutable();

-- Public verification function (returns only safe, non-sensitive fields)
CREATE OR REPLACE FUNCTION public.verify_certificate(_certificate_number text)
RETURNS TABLE (
  certificate_number text,
  recipient_name text,
  course_name text,
  completion_date date,
  issued_at timestamp with time zone,
  status text,
  credential_level text,
  cpd_hours numeric,
  revoked_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT certificate_number, recipient_name, course_name, completion_date,
         issued_at, status, credential_level, cpd_hours, revoked_at
  FROM public.certificates
  WHERE certificate_number = upper(trim(_certificate_number))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;