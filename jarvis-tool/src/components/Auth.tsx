import { useEffect } from "react";
import { supabase } from "@/lib/supabase/jarvisClient";
import { useAuthStore } from "@/store/useAuthStore";
import LoginPage from "@/pages/LoginPage";
import App from "@/App";

const Auth = () => {
  const session = useAuthStore((state) => state.session);
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

  if (!session) {
    return <LoginPage />;
  }
  return <App />;
};

export default Auth;
