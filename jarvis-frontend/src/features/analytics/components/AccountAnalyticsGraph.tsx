import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTikTokAccountAnalytics } from "@/features/tiktok/hooks/useTikTokAccountAnalytics";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type AccountAnalytics = {
  id: string;
  created_at: string;
  followers_count: number;
  likes_count: number;
  videos_count: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-md">
        <p className="label">{`${label}`}</p>
        <p className="intro">{`${payload[0].name} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

const AccountAnalyticsGraph = ({ accountId }: { accountId: string }) => {
  const { theme } = useTheme();
  const { data: history, isLoading } = useTikTokAccountAnalytics(accountId);
  const [metric, setMetric] = useState<"followers_count" | "likes_count" | "videos_count">("followers_count");

  if (isLoading) {
    return <div>Loading graph...</div>;
  }

  if (!history) {
    return <div>No analytics history found.</div>;
  }

  const historyArray = Array.isArray(history) ? history : [history];

  const chartData = historyArray.map((entry: AccountAnalytics) => {
    const date = new Date(entry.created_at);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
    return {
      date: formattedDate,
      value: entry[metric],
    };
  });

  const colors: { [key: string]: { light: string; dark: string } } = {
    followers_count: { light: "#4CAF50", dark: "#81C784" },
    likes_count: { light: "#2196F3", dark: "#64B5F6" },
    videos_count: { light: "#FFC107", dark: "#FFD54F" },
  };

  const currentColor = colors[metric][theme === "dark" ? "dark" : "light"];
  const metricName = metric.replace("_count", "").charAt(0).toUpperCase() + metric.replace("_count", "").slice(1);

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        <Button
          onClick={() => setMetric("followers_count")}
          variant={metric === "followers_count" ? "default" : "outline"}>
          Followers
        </Button>
        <Button onClick={() => setMetric("likes_count")} variant={metric === "likes_count" ? "default" : "outline"}>
          Likes
        </Button>
        <Button onClick={() => setMetric("videos_count")} variant={metric === "videos_count" ? "default" : "outline"}>
          Videos
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickMargin={5} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name={metricName}
            stroke={currentColor}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccountAnalyticsGraph;
