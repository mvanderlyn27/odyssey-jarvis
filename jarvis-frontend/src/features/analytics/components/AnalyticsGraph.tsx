import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { usePostAnalyticsHistory } from "../hooks/usePostAnalyticsHistory";
import { useTheme } from "@/components/theme-provider";
import { subDays, startOfHour, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { AnalyticsGraphControls, DateRange } from "./AnalyticsGraphControls";

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

type PostMetric = "views" | "likes" | "comments" | "shares";

const METRICS: { value: PostMetric; label: string }[] = [
  { value: "views", label: "Views" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
  { value: "shares", label: "Shares" },
];

const AnalyticsGraph = ({ postId }: { postId: string }) => {
  const { theme } = useTheme();
  const { data: history, isLoading } = usePostAnalyticsHistory(postId);
  const [metric, setMetric] = useState<PostMetric>("views");
  const [dateRange, setDateRange] = useState<DateRange>("1d");

  const processedData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    if (dateRange === "all") {
      startDate = new Date(Math.min(...history.map((h) => new Date(h.created_at).getTime())));
    } else {
      startDate = subDays(now, parseInt(dateRange.replace("d", "")));
    }

    const filteredHistory = history.filter((h) => new Date(h.created_at) >= startDate);

    if (filteredHistory.length === 0) return [];

    const getBucketGenerator = () => {
      const diffInDays = (d1: Date, d2: Date) => (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
      const days = dateRange === "all" ? diffInDays(now, startDate) : parseInt(dateRange.replace("d", ""));

      if (days <= 2) return { start: startOfHour, increment: (d: Date) => new Date(d.getTime() + 60 * 60 * 1000) };
      if (days <= 90) return { start: startOfDay, increment: (d: Date) => subDays(d, -1) };
      if (days <= 365) return { start: startOfWeek, increment: (d: Date) => subDays(d, -7) };
      return { start: startOfMonth, increment: (d: Date) => new Date(d.setMonth(d.getMonth() + 1)) };
    };

    const { start: startOfBucket, increment: incrementBucket } = getBucketGenerator();
    const buckets = new Map<string, { date: Date; value: number }>();

    let current = startOfBucket(startDate);
    while (current <= now) {
      buckets.set(current.toISOString(), { date: current, value: 0 });
      current = incrementBucket(current);
    }

    const latestEntries = new Map<string, PostAnalytics>();
    filteredHistory.forEach((entry) => {
      const bucketKey = startOfBucket(new Date(entry.created_at)).toISOString();
      if (
        !latestEntries.has(bucketKey) ||
        new Date(entry.created_at) > new Date(latestEntries.get(bucketKey)!.created_at)
      ) {
        latestEntries.set(bucketKey, entry);
      }
    });

    latestEntries.forEach((entry, bucketKey) => {
      if (buckets.has(bucketKey)) {
        buckets.get(bucketKey)!.value = entry[metric] || 0;
      }
    });

    let lastValue = 0;
    const filledBuckets = Array.from(buckets.keys())
      .sort()
      .map((key) => {
        const bucket = buckets.get(key)!;
        if (bucket.value === 0) {
          bucket.value = lastValue;
        } else {
          lastValue = bucket.value;
        }
        return bucket;
      });

    return filledBuckets;
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

  const getAxisDomain = (): [number, number] => {
    if (minValue === maxValue) {
      return [0, maxValue > 0 ? maxValue * 1.2 : 10];
    }
    const dataMin = Math.floor(minValue * 0.95);
    const dataMax = Math.ceil(maxValue * 1.05);
    return [dataMin, dataMax];
  };

  const yAxisDomain = getAxisDomain();

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
    views: { light: "#4CAF50", dark: "#81C784" },
    likes: { light: "#2196F3", dark: "#64B5F6" },
    comments: { light: "#FFC107", dark: "#FFD54F" },
    shares: { light: "#F44336", dark: "#E57373" },
  };

  const currentColor = colors[metric][theme === "dark" ? "dark" : "light"];

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
