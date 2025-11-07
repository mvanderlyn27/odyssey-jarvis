import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getLatestAnalytics } from "@/features/posts/utils/getLatestAnalytics";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import OverviewCalendarSkeleton from "./OverviewCalendarSkeleton";
import { cn } from "@/lib/utils";

const OverviewCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: posts, isLoading } = usePosts();

  if (isLoading) {
    return <OverviewCalendarSkeleton />;
  }

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const monthlyAnalytics = useMemo(() => {
    if (!posts) return { dailyData: {} };

    const dailyData: { [key: number]: { views: number; published: number; scheduled: number } } = {};

    const monthPosts = posts.filter((post) => {
      const postDate = new Date(post.published_at || post.scheduled_at || "");
      return postDate.getMonth() === currentDate.getMonth() && postDate.getFullYear() === currentDate.getFullYear();
    });

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toDateString();
      dailyData[i] = { views: 0, published: 0, scheduled: 0 };

      const publishedPosts = monthPosts.filter(
        (post) =>
          post.status === "PUBLISHED" && post.published_at && new Date(post.published_at).toDateString() === dateString
      );

      const scheduledPosts = monthPosts.filter(
        (post) =>
          post.status === "SCHEDULED" && post.scheduled_at && new Date(post.scheduled_at).toDateString() === dateString
      );

      dailyData[i].published = publishedPosts.length;
      dailyData[i].scheduled = scheduledPosts.length;

      const views = publishedPosts.reduce((acc, post) => {
        const latestAnalytics = getLatestAnalytics(post.post_analytics);
        return acc + (latestAnalytics?.views || 0);
      }, 0);

      dailyData[i].views = views;
    }

    return { dailyData };
  }, [posts, currentDate]);

  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`prev-${i}`} className="h-32 border rounded-md bg-muted" />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayIndex = startDay + i - 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dayData = monthlyAnalytics.dailyData[i] || { views: 0, published: 0, scheduled: 0 };
    const { views, published, scheduled } = dayData;

    const isFutureDate = date > new Date();
    const hasPosts = published > 0 || scheduled > 0;

    const opacity = Math.log(views / 10000 + 1) / Math.log(1000000 / 10000 + 1);

    const dayContent = (
      <div
        className={cn(
          "h-32 border rounded-md p-2 flex flex-col transition-colors justify-between",
          !hasPosts && "cursor-not-allowed",
          views > 0 ? "bg-green-500" : "bg-muted",
          views >= 1000000 && "shadow-[0_0_15px_rgba(74,222,128,0.8)] border-green-400"
        )}
        style={
          views > 0
            ? ({
                "--tw-bg-opacity": Math.max(0.1, opacity),
                "--tw-text-opacity": 1,
              } as React.CSSProperties)
            : {}
        }>
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium">{i}</p>
          <div className="flex space-x-1">
            {published > 0 && (
              <div className="text-xs inline-flex items-center px-2 py-1 rounded-md">
                <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="font-bold">{published}</span>
              </div>
            )}
            {scheduled > 0 && (
              <div className="text-xs inline-flex items-center px-2 py-1 rounded-md">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="font-bold">{scheduled}</span>
              </div>
            )}
          </div>
        </div>
        {!isFutureDate && views > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold">{views.toLocaleString()}</p>
            <p className="text-xs">Views</p>
          </div>
        )}
        <div />
      </div>
    );

    days.push(
      <motion.div
        key={i}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { delay: dayIndex * 0.02, duration: 0.2 },
          y: { delay: dayIndex * 0.02, duration: 0.2 },
          scale: { duration: 0.1 },
        }}
        whileHover={hasPosts ? { scale: 1.05 } : {}}>
        {hasPosts ? (
          <Link to={`/app/day/${date.toISOString().split("T")[0]}`}>{dayContent}</Link>
        ) : (
          <div>{dayContent}</div>
        )}
      </motion.div>
    );
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
          <Button variant="outline" onClick={prevMonth}>
            {"<"}
          </Button>
          <Button variant="outline" onClick={nextMonth}>
            {">"}
          </Button>
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
