import { Button } from "@/components/ui/button";

const TikTokPage = () => {
  const handleLinkAccount = () => {
    const csrfState = Math.random().toString(36).substring(2);
    // You should store the csrfState in a cookie or session storage to verify it on callback
    document.cookie = `csrfState=${csrfState}; max-age=60000`;

    let url = "https://www.tiktok.com/v2/auth/authorize/";

    const params = new URLSearchParams({
      client_key: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
      scope: "user.info.basic", // Requesting basic user info scope
      response_type: "code",
      redirect_uri: import.meta.env.VITE_TIKTOK_REDIRECT_URI,
      state: csrfState,
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
