CREATE OR REPLACE FUNCTION public.create_organization(name TEXT)
RETURNS organizations AS $$
DECLARE
  new_organization organizations;
BEGIN
  -- Create the new organization
  INSERT INTO public.organizations (name)
  VALUES (name)
  RETURNING * INTO new_organization;

  -- Update the profile of the user who created the organization
  UPDATE public.profiles
  SET organization_id = new_organization.id
  WHERE id = auth.uid();

  RETURN new_organization;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
