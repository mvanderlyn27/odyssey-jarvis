import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/jarvisClient";
import { queries } from "@/lib/queries";

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queries.auth.session().queryKey });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      // We still log the error, but the navigation is handled in onSettled
      console.error("Error logging out:", error);
    },
  });
};
