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
    if (!isHydrated) return;

    const code = searchParams.get("code");

    if (code && tiktokCodeVerifier) {
      setTikTokCodeVerifier(null); // Clean up immediately

      const exchangeCodeForToken = async () => {
        try {
          const { data, error } = await jarvisClient.functions.invoke("tiktok-auth", {
            body: { code, code_verifier: tiktokCodeVerifier },
          });

          if (error) throw new Error(`Function error: ${error.message}`);
          if (data.error) throw new Error(`API error: ${data.error_description || data.error}`);

          setStatus("success");
          setMessage("TikTok account linked successfully! Redirecting...");
          setTimeout(() => navigate("/tiktok"), 2000);
        } catch (error: any) {
          setStatus("error");
          setMessage(error.message);
        }
      };

      exchangeCodeForToken();
    } else {
      setStatus("error");
      setMessage("Authorization failed. No authorization code or verifier was found.");
    }
  }, [isHydrated, searchParams, tiktokCodeVerifier, setTikTokCodeVerifier, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">TikTok Authorization</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
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
