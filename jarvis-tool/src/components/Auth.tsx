import { useEffect } from "react";
import { supabase } from "@/lib/supabase/jarvisClient";
import { useAuthStore } from "@/store/useAuthStore";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
};

export default Auth;
