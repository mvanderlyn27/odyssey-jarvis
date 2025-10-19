import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTikTokAccountAnalyticsHistory } from "@/features/tiktok/hooks/useTikTokAccountAnalyticsHistory";
import { useTheme } from "@/components/theme-provider";
import { subDays, startOfHour, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { AnalyticsGraphControls, DateRange } from "./AnalyticsGraphControls";

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

type AccountMetric = "follower_count" | "likes_count" | "video_count";

const METRICS: { value: AccountMetric; label: string }[] = [
  { value: "follower_count", label: "Followers" },
  { value: "likes_count", label: "Likes" },
  { value: "video_count", label: "Videos" },
];

const AccountAnalyticsGraph = ({ accountId }: { accountId: string }) => {
  const { theme } = useTheme();
  const { data: history, isLoading } = useTikTokAccountAnalyticsHistory(accountId);
  const [metric, setMetric] = useState<AccountMetric>("follower_count");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const processedData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date();
    let startDate = subDays(now, 365); // Default to one year for "all"

    if (dateRange !== "all") {
      startDate = subDays(now, parseInt(dateRange.replace("d", "")));
    } else if (history.length > 0) {
      const firstDataPointDate = new Date(history[0].created_at);
      if (firstDataPointDate < startDate) {
        startDate = firstDataPointDate;
      }
    }

    const getBucketGenerator = () => {
      switch (dateRange) {
        case "1d":
          return {
            start: startOfHour,
            increment: (d: Date) => new Date(d.getTime() + 60 * 60 * 1000),
          };
        case "7d":
        case "30d":
          return { start: startOfDay, increment: (d: Date) => subDays(d, -1) };
        case "90d":
          return { start: startOfWeek, increment: (d: Date) => subDays(d, -7) };
        default:
          return { start: startOfMonth, increment: (d: Date) => new Date(d.setMonth(d.getMonth() + 1)) };
      }
    };

    const { start: startOfBucket, increment: incrementBucket } = getBucketGenerator();
    const buckets = new Map<string, { date: Date; value: number }>();
    let current = startOfBucket(startDate);

    while (current <= now) {
      const bucketKey = current.toISOString();
      buckets.set(bucketKey, { date: current, value: 0 });
      current = incrementBucket(current);
    }

    history.forEach((entry) => {
      const entryDate = new Date(entry.created_at);
      if (entryDate >= startDate) {
        const bucketKey = startOfBucket(entryDate).toISOString();
        const bucket = buckets.get(bucketKey);
        if (bucket && entry[metric] > bucket.value) {
          bucket.value = entry[metric];
        }
      }
    });

    return Array.from(buckets.values());
  }, [history, dateRange, metric]);

  if (isLoading) {
    return <div>Loading graph...</div>;
  }

  if (!processedData || processedData.length === 0) {
    return <div>No analytics history found for this period.</div>;
  }

  const values = processedData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const yAxisDomain: [number, number] = [0, maxValue * 1.05];

  if (minValue === maxValue) {
    yAxisDomain[0] = 0;
    yAxisDomain[1] = maxValue > 0 ? maxValue * 1.1 : 1;
  }

  const formatXAxis = (tickItem: Date) => {
    if (dateRange === "1d") return tickItem.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return tickItem.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}K`;
    return tickItem.toString();
  };

  const colors: { [key: string]: { light: string; dark: string } } = {
    follower_count: { light: "#4CAF50", dark: "#81C784" },
    likes_count: { light: "#2196F3", dark: "#64B5F6" },
    video_count: { light: "#FFC107", dark: "#FFD54F" },
  };

  const currentColor = colors[metric][theme === "dark" ? "dark" : "light"];
  const metricName = metric.replace("_count", "").charAt(0).toUpperCase() + metric.replace("_count", "").slice(1);

  return (
    <div>
      <AnalyticsGraphControls
        metric={metric}
        setMetric={setMetric}
        dateRange={dateRange}
        setDateRange={setDateRange}
        metrics={METRICS}
      />
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={processedData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickMargin={5}
            interval="preserveStartEnd"
            tickFormatter={formatXAxis}
            style={{ fontSize: "0.75rem" }}
          />
          <YAxis domain={yAxisDomain} tickFormatter={formatYAxis} style={{ fontSize: "0.75rem" }} width={40} />
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
