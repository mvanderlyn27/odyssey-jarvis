import TikTokAccountManager, { initiateTikTokAuth } from "../components/tiktok/TikTokAccountManager";
import TikTokAccountList from "../components/tiktok/TikTokAccountList";
import { useAuthStore } from "../store/useAuthStore";

const TikTokPage = () => {
  const setTikTokCodeVerifier = useAuthStore((state) => state.setTikTokCodeVerifier);

  const handleReauthenticate = () => {
    initiateTikTokAuth(setTikTokCodeVerifier);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">TikTok Management</h1>
      <div>
        <TikTokAccountManager />
        <TikTokAccountList onReauthenticate={handleReauthenticate} />
      </div>
    </div>
  );
};

export default TikTokPage;
