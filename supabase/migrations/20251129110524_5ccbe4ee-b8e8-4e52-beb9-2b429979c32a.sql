-- Add message, role, and inquiry_type columns to leads table
ALTER TABLE public.leads 
ADD COLUMN message TEXT,
ADD COLUMN role TEXT,
ADD COLUMN inquiry_type TEXT;