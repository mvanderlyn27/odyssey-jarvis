import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/jarvisClient";
import { Credentials } from "../types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      if (!password) {
        throw new Error("Password is required.");
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    },
  });
};
