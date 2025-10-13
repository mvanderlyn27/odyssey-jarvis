import { Button } from "@/components/ui/button";
import pkceChallenge from "pkce-challenge";
import { useAuthStore } from "../../store/useAuthStore";

export const initiateTikTokAuth = async (setTikTokCodeVerifier: (code: string) => void) => {
  const csrfState = Math.random().toString(36).substring(2);
  document.cookie = `csrfState=${csrfState}; max-age=60000`;

  const { code_verifier, code_challenge } = await pkceChallenge();
  setTikTokCodeVerifier(code_verifier);

  let url = "https://www.tiktok.com/v2/auth/authorize/";

  const params = new URLSearchParams({
    client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
    scope: "user.info.basic,video.upload,user.info.profile,user.info.stats,video.list",
    response_type: "code",
    redirect_uri: import.meta.env.VITE_TIKTOK_REDIRECT_URI,
    state: csrfState,
    code_challenge: code_challenge,
    code_challenge_method: "S256",
  });

  url += `?${params.toString()}`;
  window.location.href = url;
};

const TikTokAccountManager = () => {
  const setTikTokCodeVerifier = useAuthStore((state) => state.setTikTokCodeVerifier);

  return (
    <div className="flex justify-end mb-4">
      <Button onClick={() => initiateTikTokAuth(setTikTokCodeVerifier)}>Link New TikTok Account</Button>
    </div>
  );
};

export default TikTokAccountManager;
