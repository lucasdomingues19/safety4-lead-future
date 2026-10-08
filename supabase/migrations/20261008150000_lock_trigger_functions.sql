-- Trigger functions are only ever run by the database itself. Nobody needs to call them over the API,
-- so anonymous visitors lose EXECUTE on them. (has_role and the org helpers stay open: public policies use them.)
REVOKE EXECUTE ON FUNCTION public.guard_enrollment_org() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_new_account_links() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lms_signup_to_lead() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_certificate() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_comment_reply() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_enrolment() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_quiz_passed() FROM anon, PUBLIC;
