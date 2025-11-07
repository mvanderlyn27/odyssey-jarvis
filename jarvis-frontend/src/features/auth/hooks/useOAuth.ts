import { useMutation } from "@tanstack/react-query";
import { signInWithGoogle, signUpWithGoogle } from "../api";

export const useOAuth = (type: "signIn" | "signUp") => {
  return useMutation({
    mutationFn: async (priceId: string | null) => {
      sessionStorage.setItem("authType", type);
      if (type === "signUp") {
        await signUpWithGoogle(priceId);
      } else {
        await signInWithGoogle();
      }
    },
  });
};
