-- Review request, sent 5 to 30 days after a learner finishes a course. Starts switched off:
-- switch it on in the admin Emails area once the wording has been approved.
INSERT INTO public.email_automations (kind, enabled) VALUES ('review_request', false)
ON CONFLICT (kind) DO NOTHING;
