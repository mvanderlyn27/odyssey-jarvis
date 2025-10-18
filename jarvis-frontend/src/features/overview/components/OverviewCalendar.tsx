import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Post } from "@/features/posts/types";
import { useDailyAccountAnalytics } from "@/features/analytics/hooks/useDailyAccountAnalytics";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";

interface OverviewCalendarProps {
  posts: Post[] | undefined;
}

const OverviewCalendar = ({ posts }: OverviewCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const selectedAccounts = useAnalyticsStore((state) => state.selectedAccounts);
  const accountIds = selectedAccounts.map((account) => account.id);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data: analytics } = useDailyAccountAnalytics(
    accountIds,
    startOfMonth.toISOString(),
    endOfMonth.toISOString()
  );

  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`prev-${i}`} className="h-24 border rounded-md bg-muted" />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const postsForDay =
      posts?.filter(
        (post) => post.scheduled_at && new Date(post.scheduled_at).toDateString() === date.toDateString()
      ) || [];
    const analyticsForDay = analytics?.find(
      (analytic) => new Date(analytic.created_at).toDateString() === date.toDateString()
    );

    const kpis = {
      views: analyticsForDay?.total_post_views_delta || 0,
      likes: analyticsForDay?.total_post_likes_delta || 0,
    };

    const isFutureDate = date > new Date();

    days.push(
      <div key={i} className="h-32 border rounded-md p-2 flex flex-col">
        <p className="text-sm font-medium">{i}</p>
        <div className="space-y-1 mt-1 flex-grow overflow-y-auto">
          {postsForDay.map((post) => (
            <div key={post.id} className="text-xs p-1 bg-primary text-primary-foreground rounded-md truncate">
              {post.title}
            </div>
          ))}
        </div>
        {!isFutureDate && (
          <div className="text-xs text-muted-foreground mt-2">
            <p>Views: {kpis.views}</p>
            <p>Likes: {kpis.likes}</p>
          </div>
        )}
      </div>
    );
  }
  const remainingDays = 42 - days.length;
  for (let i = 0; i < remainingDays; i++) {
    days.push(<div key={`next-${i}`} className="h-24 border rounded-md bg-muted" />);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </CardTitle>
        <div className="space-x-2">
          <Button onClick={prevMonth}>{"<"}</Button>
          <Button onClick={nextMonth}>{">"}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center font-semibold">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">{days}</div>
      </CardContent>
    </Card>
  );
};

export default OverviewCalendar;
