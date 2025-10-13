import TikTokAccountManager from "../components/tiktok/TikTokAccountManager";
import TikTokAccountList from "../components/tiktok/TikTokAccountList";

const TikTokPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">TikTok Management</h1>
      <div>
        <TikTokAccountManager />
        <TikTokAccountList />
      </div>
    </div>
  );
};

export default TikTokPage;
