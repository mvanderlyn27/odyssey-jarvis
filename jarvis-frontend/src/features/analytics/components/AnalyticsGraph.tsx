import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePostAnalyticsHistory } from "../hooks/usePostAnalyticsHistory";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type PostAnalytics = {
  id: string;
  post_id: string;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
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

const AnalyticsGraph = ({ postId }: { postId: string }) => {
  const { theme } = useTheme();
  const { data: history, isLoading } = usePostAnalyticsHistory(postId);
  const [metric, setMetric] = useState<"views" | "likes" | "comments" | "shares">("views");

  if (isLoading) {
    return <div>Loading graph...</div>;
  }

  if (!history || history.length === 0) {
    return <div>No analytics history found.</div>;
  }

  const groupedData = (history as PostAnalytics[]).reduce((acc, entry) => {
    const entryDate = new Date(entry.created_at);
    const minutes = entryDate.getMinutes();
    const roundedMinutes = Math.floor(minutes / 10) * 10;
    entryDate.setMinutes(roundedMinutes, 0, 0);

    const key = entryDate.toISOString();

    if (!acc[key] || new Date(acc[key].created_at) < new Date(entry.created_at)) {
      acc[key] = { ...entry, created_at: entryDate.toISOString() };
    }

    return acc;
  }, {} as { [key: string]: PostAnalytics });

  const chartData = Object.values(groupedData).map((entry) => {
    const date = new Date(entry.created_at);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return {
      date: formattedDate,
      value: entry[metric],
    };
  });

  const colors: { [key: string]: { light: string; dark: string } } = {
    views: { light: "#4CAF50", dark: "#81C784" },
    likes: { light: "#2196F3", dark: "#64B5F6" },
    comments: { light: "#FFC107", dark: "#FFD54F" },
    shares: { light: "#F44336", dark: "#E57373" },
  };

  const currentColor = colors[metric][theme === "dark" ? "dark" : "light"];

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        <Button onClick={() => setMetric("views")} variant={metric === "views" ? "default" : "outline"}>
          Views
        </Button>
        <Button onClick={() => setMetric("likes")} variant={metric === "likes" ? "default" : "outline"}>
          Likes
        </Button>
        <Button onClick={() => setMetric("comments")} variant={metric === "comments" ? "default" : "outline"}>
          Comments
        </Button>
        <Button onClick={() => setMetric("shares")} variant={metric === "shares" ? "default" : "outline"}>
          Shares
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
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            stroke={currentColor}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsGraph;
