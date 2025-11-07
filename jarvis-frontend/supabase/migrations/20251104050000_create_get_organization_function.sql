CREATE OR REPLACE FUNCTION public.get_organization()
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.name, o.created_at
  FROM public.organizations o
  JOIN public.profiles p ON o.id = p.organization_id
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
