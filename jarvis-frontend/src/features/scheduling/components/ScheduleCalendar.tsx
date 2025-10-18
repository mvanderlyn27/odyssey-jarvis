import { useDroppable } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useTikTokAccounts } from "@/features/tiktok/hooks/useTikTokAccounts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { PostWithAssets } from "@/features/posts/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSchedulePageStore } from "@/store/useSchedulePageStore";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ScheduleCalendarProps {
  posts: PostWithAssets[];
  isLoading: boolean;
}

const DroppableSlot = ({
  id,
  children,
  disabled,
  time,
  period,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  time: string;
  period: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-48 w-32 border rounded-md p-2 flex-col space-y-2 ${
        isOver
          ? "bg-gray-200 dark:bg-gray-700"
          : disabled
          ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          : "bg-white dark:bg-gray-900"
      }`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-200 dark:text-gray-700 select-none">{period}</span>
      </div>
      <div className="relative z-10">
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        {children}
      </div>
    </div>
  );
};

const SortablePostCard = ({ post, isDraggable }: { post: PostWithAssets; isDraggable: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DraggableSchedulerPostCard
        post={post}
        isDragging={isDragging}
        transform={transform}
        transition={transition}
        listeners={listeners}
        isDraggable={isDraggable}
      />
    </div>
  );
};

const ScheduleCalendar = ({ posts, isLoading }: ScheduleCalendarProps) => {
  const { data: accounts, isLoading: isLoadingAccounts } = useTikTokAccounts();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    daySettings,
    setDayTime,
    setAllDaysTime,
    overallMorningTime,
    overallEveningTime,
    setOverallMorningTime,
    setOverallEveningTime,
    editIndividually,
    setEditIndividually,
  } = useSchedulePageStore();

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

  const handleSaveSettings = () => {
    if (!editIndividually) {
      setAllDaysTime("morning", overallMorningTime);
      setAllDaysTime("evening", overallEveningTime);
    }
    setIsSettingsOpen(false);
  };

  if (isLoadingAccounts || isLoading) return <div>Loading...</div>;

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
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
    <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
      <Card className="min-w-[1500px] overflow-x-auto">
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Post Schedule</CardTitle>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="ml-2">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[150px_repeat(7,1fr)] gap-4">
            <div className="font-semibold text-center">Accounts</div>
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
              <div className="grid grid-cols-[150px_repeat(7,1fr)] gap-4 mt-2 items-center">
                <Link to={`/tiktok/${account.id}`} className="flex flex-col items-center space-y-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.tiktok_avatar_url ?? undefined} />
                    <AvatarFallback>{account.tiktok_display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="font-semibold text-xs truncate w-full text-center">{account.tiktok_display_name}</div>
                </Link>
                {weekDays.map((day) => {
                  const dayAbbr = days[day.getDay() === 0 ? 6 : day.getDay() - 1];
                  const { morning: morningTime, evening: eveningTime } = daySettings[dayAbbr];

                  const now = new Date();
                  const morningDateTime = new Date(day);
                  const [morningHour, morningMinute] = morningTime.split(":").map(Number);
                  morningDateTime.setHours(morningHour, morningMinute, 0, 0);

                  const eveningDateTime = new Date(day);
                  const [eveningHour, eveningMinute] = eveningTime.split(":").map(Number);
                  eveningDateTime.setHours(eveningHour, eveningMinute, 0, 0);

                  const isMorningPast = morningDateTime < now;
                  const isEveningPast = eveningDateTime < now;

                  const formattedDate = day.toISOString().split("T")[0];
                  const morningSlotId = `${account.id}-${formattedDate}-morning`;
                  const eveningSlotId = `${account.id}-${formattedDate}-evening`;
                  const morningPosts = postsBySlot.get(morningSlotId) || [];
                  const eveningPosts = postsBySlot.get(eveningSlotId) || [];

                  return (
                    <div key={day.toISOString()} className="flex space-x-2">
                      <DroppableSlot id={morningSlotId} disabled={isMorningPast} time={morningTime} period="Morning">
                        {morningPosts.map((post) => (
                          <SortablePostCard key={post.id} post={post} isDraggable={!isMorningPast} />
                        ))}
                      </DroppableSlot>
                      <DroppableSlot id={eveningSlotId} disabled={isEveningPast} time={eveningTime} period="Evening">
                        {eveningPosts.map((post) => (
                          <SortablePostCard key={post.id} post={post} isDraggable={!isEveningPast} />
                        ))}
                      </DroppableSlot>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Settings</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Switch id="edit-individually" checked={editIndividually} onCheckedChange={setEditIndividually} />
              <Label htmlFor="edit-individually">Edit days individually</Label>
            </div>
            <AnimatePresence mode="wait">
              {!editIndividually ? (
                <motion.div
                  key="overall"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Overall Time</Label>
                    <Input
                      type="time"
                      value={overallMorningTime}
                      onChange={(e) => setOverallMorningTime(e.target.value)}
                      className="col-span-1"
                    />
                    <Input
                      type="time"
                      value={overallEveningTime}
                      onChange={(e) => setOverallEveningTime(e.target.value)}
                      className="col-span-1"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="per-day"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}>
                  {days.map((day) => (
                    <div key={day} className="grid grid-cols-3 items-center gap-4 mt-2">
                      <Label htmlFor={`morning-time-${day}`} className="text-right">
                        {day}
                      </Label>
                      <Input
                        id={`morning-time-${day}`}
                        type="time"
                        value={daySettings[day].morning}
                        onChange={(e) => setDayTime(day, "morning", e.target.value)}
                        className="col-span-1"
                      />
                      <Input
                        id={`evening-time-${day}`}
                        type="time"
                        value={daySettings[day].evening}
                        onChange={(e) => setDayTime(day, "evening", e.target.value)}
                        className="col-span-1"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <DialogFooter>
              <Button onClick={handleSaveSettings}>Save and Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </SortableContext>
  );
};

export default ScheduleCalendar;
