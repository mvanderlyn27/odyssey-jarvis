import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getLatestAnalytics } from "@/features/posts/utils/getLatestAnalytics";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const OverviewCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: posts, isLoading } = usePosts();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`prev-${i}`} className="h-32 border rounded-md bg-muted" />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayIndex = startDay + i - 1;
    if (isLoading) {
      days.push(
        <motion.div
          key={`skeleton-${i}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.02 }}>
          <Skeleton className="h-32" />
        </motion.div>
      );
    } else {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);

      const publishedPosts =
        posts?.filter(
          (post) =>
            post.status === "PUBLISHED" &&
            post.published_at &&
            new Date(post.published_at).toDateString() === date.toDateString()
        ) || [];

      const scheduledPosts =
        posts?.filter(
          (post) =>
            post.status === "SCHEDULED" &&
            post.scheduled_at &&
            new Date(post.scheduled_at).toDateString() === date.toDateString()
        ) || [];

      const kpis = publishedPosts.reduce(
        (acc, post) => {
          const latestAnalytics = getLatestAnalytics(post.post_analytics);
          if (latestAnalytics) {
            acc.views += latestAnalytics.views || 0;
          }
          return acc;
        },
        { views: 0 }
      );

      const isFutureDate = date > new Date();

      days.push(
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.02 }}>
          <Link to={`/day/${date.toISOString().split("T")[0]}`}>
            <div className="h-32 border rounded-md p-2 flex flex-col hover:bg-muted transition-colors">
              <p className="text-sm font-medium">{i}</p>
              <div className="space-y-1 mt-1 flex-grow overflow-y-auto">
                <div className="text-xs">
                  <p>{publishedPosts.length || 0} published</p>
                  <p>{scheduledPosts.length || 0} scheduled</p>
                </div>
              </div>
              {!isFutureDate && (
                <div className="text-xs text-muted-foreground mt-2">
                  <p>Views: {kpis.views.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      );
    }
  }
  const remainingDays = 42 - days.length;
  for (let i = 0; i < remainingDays; i++) {
    days.push(<div key={`next-${i}`} className="h-32 border rounded-md bg-muted" />);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </CardTitle>
        <div className="space-x-2">
          <Button onClick={prevMonth}>{"<"}</Button>
          <Button onClick={nextMonth}>{">"}</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 text-center font-semibold min-w-[1000px]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2 min-w-[1000px]">{days}</div>
      </CardContent>
    </Card>
  );
};

export default OverviewCalendar;
