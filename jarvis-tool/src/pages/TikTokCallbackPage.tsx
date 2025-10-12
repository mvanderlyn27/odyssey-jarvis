import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const TikTokCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Handling TikTok callback...");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    // You should verify the state against the one stored in the cookie

    if (code) {
      // TODO: Exchange the authorization code for an access token
      setMessage(`Authorization successful! Code: ${code}`);
    } else {
      setMessage("Authorization failed.");
    }
  }, [searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">TikTok Authorization</h1>
      <p>{message}</p>
    </div>
  );
};

export default TikTokCallbackPage;
