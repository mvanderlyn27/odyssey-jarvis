import { Button } from "@/components/ui/button";
import pkceChallenge from "pkce-challenge";
import { useAuthStore } from "../store/useAuthStore";

const TikTokPage = () => {
  const setTikTokCodeVerifier = useAuthStore((state) => state.setTikTokCodeVerifier);

  const handleLinkAccount = async () => {
    const csrfState = Math.random().toString(36).substring(2);
    document.cookie = `csrfState=${csrfState}; max-age=60000`;

    // 1. Generate code verifier and challenge using pkce-challenge
    const { code_verifier, code_challenge } = await pkceChallenge();

    // 2. Store the code verifier in the Zustand store
    setTikTokCodeVerifier(code_verifier);

    let url = "https://www.tiktok.com/v2/auth/authorize/";

    // 3. Add PKCE params to the authorization request
    const params = new URLSearchParams({
      client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
      scope: "user.info.basic",
      response_type: "code",
      redirect_uri: import.meta.env.VITE_TIKTOK_REDIRECT_URI,
      state: csrfState,
      code_challenge: code_challenge,
      code_challenge_method: "S256",
    });

    url += `?${params.toString()}`;
    window.location.href = url;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">TikTok Management</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={handleLinkAccount}>Link New TikTok Account</Button>
      </div>
      <div>
        {/* TODO: Display linked accounts and post analytics */}
        <p>No TikTok accounts linked yet.</p>
      </div>
    </div>
  );
};

export default TikTokPage;
