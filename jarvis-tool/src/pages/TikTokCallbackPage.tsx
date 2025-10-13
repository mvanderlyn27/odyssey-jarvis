import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase as jarvisClient } from "../lib/supabase/jarvisClient";
import { useAuthStore } from "../store/useAuthStore";

const TikTokCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { session, tiktokCodeVerifier, setTikTokCodeVerifier } = useAuthStore();
  const [message, setMessage] = useState("Handling TikTok callback...");

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && tiktokCodeVerifier) {
      // Clean up the code_verifier from the Zustand store
      setTikTokCodeVerifier(null);

      const exchangeCodeForToken = async () => {
        try {
          const { data, error } = await jarvisClient.functions.invoke("tiktok-auth", {
            body: { code, code_verifier: tiktokCodeVerifier },
          });

          if (error) {
            throw new Error(`Function invocation error: ${error.message}`);
          }

          if (data.error) {
            throw new Error(`TikTok API error: ${data.error}`);
          }

          const user = session?.user;
          if (!user) {
            throw new Error("User not authenticated.");
          }

          const { error: dbError } = await jarvisClient.from("tiktok_accounts").insert([
            {
              user_id: user.id,
              auth_token: data.access_token,
              name: data.open_id, // Or any other user info you want to store
            },
          ]);

          if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
          }

          setMessage("TikTok account linked successfully!");
        } catch (error: any) {
          setMessage(`Error: ${error.message}`);
        }
      };

      exchangeCodeForToken();
    } else {
      setMessage("Authorization failed. No code or verifier found.");
    }
  }, [searchParams, session]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">TikTok Authorization</h1>
      <p>{message}</p>
    </div>
  );
};

export default TikTokCallbackPage;
