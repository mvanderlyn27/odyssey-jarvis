import { useEffect } from "react";
import { supabase } from "@/lib/supabase/jarvisClient";
import { useAuthStore } from "@/store/useAuthStore";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  return <>{children}</>;
};

export default Auth;
