import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostWithAssets } from "./PostCard";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";

interface ScheduleCalendarProps {
  posts: PostWithAssets[];
  isLoading: boolean;
}

const DroppableSlot = ({ id, children, disabled }: { id: string; children: React.ReactNode; disabled?: boolean }) => {
  const { isOver, setNodeRef } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={`h-36 w-56 border rounded-md p-2  flex-col space-y-2 ${
        isOver
          ? "bg-gray-200 dark:bg-gray-700"
          : disabled
          ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          : "bg-white dark:bg-gray-900"
      }`}>
      {children}
    </div>
  );
};

const ScheduleCalendar = ({ posts, isLoading }: ScheduleCalendarProps) => {
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const postsBySlot = useMemo(() => {
    const map = new Map<string, PostWithAssets[]>();
    if (!posts) return map;

    posts.forEach((post) => {
      if (!post.scheduled_at || !post.tiktok_account_id) return;
      const date = new Date(post.scheduled_at);
      const formattedDate = date.toISOString().split("T")[0];
      const timeSlot = date.getHours() < 12 ? "morning" : "evening";
      const key = `${post.tiktok_account_id}-${formattedDate}-${timeSlot}`;

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(post);
    });

    return map;
  }, [posts]);

  if (isLoadingAccounts || isLoading) return <div>Loading...</div>;

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const days = [];
    const startOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + startOffset + i);
      days.push(date);
    }
    return days;
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-card min-w-[2000px]">
      <div className="grid grid-cols-8 gap-2">
        <div />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="font-semibold text-center">
            <div>{days[day.getDay() === 0 ? 6 : day.getDay() - 1]}</div>
            <div className="text-xs text-muted-foreground">{day.toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      {accounts?.map((account, index) => (
        <div key={account.id}>
          {index > 0 && <hr className="col-span-8 my-4 border-t-2" />}
          <div className="grid grid-cols-8 gap-2 mt-2 items-center">
            <div className="flex flex-col items-center space-y-1">
              <Avatar>
                <AvatarImage src={account.tiktok_avatar_url ?? undefined} />
                <AvatarFallback>{account.tiktok_display_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="font-semibold text-xs">{account.tiktok_display_name}</div>
            </div>
            {weekDays.map((day) => {
              const formattedDate = day.toISOString().split("T")[0];
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              const morningSlotId = `${account.id}-${formattedDate}-morning`;
              const eveningSlotId = `${account.id}-${formattedDate}-evening`;
              const morningPosts = postsBySlot.get(morningSlotId) || [];
              const eveningPosts = postsBySlot.get(eveningSlotId) || [];

              return (
                <div key={day.toISOString()} className="space-y-2">
                  <DroppableSlot id={morningSlotId} disabled={isPast}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Morning</p>
                    {morningPosts.map((post) => (
                      <DraggableSchedulerPostCard key={post.id} post={post} />
                    ))}
                  </DroppableSlot>
                  <DroppableSlot id={eveningSlotId} disabled={isPast}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Evening</p>
                    {eveningPosts.map((post) => (
                      <DraggableSchedulerPostCard key={post.id} post={post} />
                    ))}
                  </DroppableSlot>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleCalendar;
