import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase as jarvisClient } from "../lib/supabase/jarvisClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { queries } from "../lib/queries";

type Status = "loading" | "success" | "error";

const TikTokCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your TikTok authorization...");

  useEffect(() => {
    const code = searchParams.get("code");
    const verifier = sessionStorage.getItem("tiktokCodeVerifier");

    if (code && verifier) {
      sessionStorage.removeItem("tiktokCodeVerifier"); // Clean up immediately

      const exchangeCodeForToken = async () => {
        try {
          const { data, error } = await jarvisClient.functions.invoke("link-tiktok-account", {
            body: { code, code_verifier: verifier },
          });

          if (error) {
            const responseBody = await error.context.json();
            throw new Error(`Function error: ${responseBody.error || error.message}`);
          }
          if (data.error) {
            throw new Error(`API error: ${data.error_description || data.error}`);
          }

          await queryClient.invalidateQueries(queries.tiktokAccounts.all());
          await queryClient.invalidateQueries(queries.tiktokAccountAnalytics.all());

          setStatus("success");
          setMessage("TikTok account linked successfully! Redirecting...");
          setTimeout(() => navigate("/app/home"), 2000);
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
  }, [searchParams, navigate, queryClient]);

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
