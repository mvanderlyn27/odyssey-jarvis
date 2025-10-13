import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase as jarvisClient } from "../lib/supabase/jarvisClient";
import { useAuthStore } from "../store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "loading" | "success" | "error";

const TikTokCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tiktokCodeVerifier, setTikTokCodeVerifier } = useAuthStore();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your TikTok authorization...");
  const [isHydrated, setIsHydrated] = useState(useAuthStore.persist.hasHydrated);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return; // Wait for the Zustand store to rehydrate from localStorage.
    }

    const code = searchParams.get("code");

    // If we have the code and the verifier from the store, we can proceed.
    if (code && tiktokCodeVerifier) {
      const verifier = tiktokCodeVerifier;
      setTikTokCodeVerifier(null); // Clean up immediately to prevent reuse.

      const exchangeCodeForToken = async () => {
        try {
          const { data, error } = await jarvisClient.functions.invoke("tiktok-auth", {
            body: { code, code_verifier: verifier },
          });

          if (error) {
            const responseBody = await error.context.json();
            throw new Error(`Function error: ${responseBody.error || error.message}`);
          }
          if (data.error) {
            throw new Error(`API error: ${data.error_description || data.error}`);
          }

          setStatus("success");
          setMessage("TikTok account linked successfully! Redirecting...");
          setTimeout(() => navigate("/tiktok/accounts"), 2000);
        } catch (error: any) {
          setStatus("error");
          setMessage(error.message);
        }
      };

      exchangeCodeForToken();
    } else if (!code) {
      // If there's no code in the URL, it's a clear error.
      setStatus("error");
      setMessage("Authorization failed. No authorization code was found.");
    }
    // If there's a code but no verifier, we just wait. The component will show the
    // loading state. The useEffect will re-run when the verifier is hydrated.
    // A timeout is added below as a safeguard against waiting forever.
  }, [isHydrated, searchParams, tiktokCodeVerifier, setTikTokCodeVerifier, navigate]);

  useEffect(() => {
    // This effect is a safeguard to prevent an infinite loading state.
    if (!isHydrated || status !== "loading") {
      return;
    }

    const timeoutId = setTimeout(() => {
      // If after 5 seconds we are still loading, it's likely the verifier was lost.
      if (status === "loading" && !useAuthStore.getState().tiktokCodeVerifier) {
        setStatus("error");
        setMessage("Authorization timed out. The verification token was not found. Please try again.");
      }
    }, 5000); // 5-second timeout

    return () => clearTimeout(timeoutId);
  }, [isHydrated, status]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">TikTok Authorization</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p>{message}</p>
            </div>
          )}
          {status === "success" && <p className="text-green-600">{message}</p>}
          {status === "error" && <p className="text-red-600">Error: {message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default TikTokCallbackPage;
