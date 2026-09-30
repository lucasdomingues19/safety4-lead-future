-- Admin roles can be granted/removed from Admin > Users. Guard rails:
-- the owner account always stays an admin, and the last admin can't be removed.
CREATE OR REPLACE FUNCTION public.protect_admin_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  owner_email constant text := 'lucas.domingues1985@gmail.com';
BEGIN
  IF OLD.role = 'admin'::app_role THEN
    IF EXISTS (SELECT 1 FROM auth.users u WHERE u.id = OLD.user_id AND lower(u.email) = owner_email) THEN
      RAISE EXCEPTION 'The owner account must stay an admin';
    END IF;
    IF (SELECT count(*) FROM user_roles WHERE role = 'admin'::app_role) <= 1 THEN
      RAISE EXCEPTION 'You can''t remove the last admin';
    END IF;
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS protect_admin_roles ON public.user_roles;
CREATE TRIGGER protect_admin_roles BEFORE DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_roles();
