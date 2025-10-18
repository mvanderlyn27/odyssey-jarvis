import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DateRange = "1d" | "7d" | "30d" | "90d" | "180d" | "365d" | "all";

interface AnalyticsGraphControlsProps<T extends string> {
  metric: T;
  setMetric: (metric: T) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  metrics: { value: T; label: string }[];
}

export const AnalyticsGraphControls = <T extends string>({
  metric,
  setMetric,
  dateRange,
  setDateRange,
  metrics,
}: AnalyticsGraphControlsProps<T>) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Tabs value={metric} onValueChange={(value) => setMetric(value as T)}>
        <TabsList>
          {metrics.map((m) => (
            <TabsTrigger key={m.value} value={m.value}>
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1d">Last 24 hours</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="180d">Last 6 months</SelectItem>
          <SelectItem value="365d">Last year</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
