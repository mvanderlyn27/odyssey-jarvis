import { useDroppable } from "@dnd-kit/core";
import { useMemo, useState, useRef, useEffect } from "react";
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
  date,
  time,
  period,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  date: Date;
  time: string;
  period: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id, disabled });

  const formattedDateTime = `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}, ${time}`;

  return (
    <div
      ref={setNodeRef}
      className={`relative h-48 w-full border rounded-md p-2 flex-col space-y-2 ${
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
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">{formattedDateTime}</p>
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
  const calendarRef = useRef<HTMLDivElement>(null);
  const dayAbbreviations = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const days: Date[] = [];
    const startOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + startOffset + i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const scrollPosition = todayIndex * 280;
      calendarRef.current.scrollLeft = scrollPosition;
    }
  }, [isLoadingAccounts]);

  if (isLoadingAccounts || isLoading) return <div>Loading...</div>;

  const todayDateString = new Date().toDateString();

  return (
    <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Post Schedule</CardTitle>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="ml-2">
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent ref={calendarRef} className="p-0 overflow-x-auto">
          <div className="grid grid-cols-[100px_repeat(7,minmax(280px,1fr))]">
            {/* Header Row */}
            <div className="sticky left-0 z-30 p-2 font-semibold text-center bg-card"></div>
            {weekDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={`p-2 mb-2 font-semibold text-center ${
                  day.toDateString() === todayDateString ? "bg-gray-200 dark:bg-gray-800 rounded-3xl" : ""
                }`}>
                <div>{dayAbbreviations[index]}</div>
                <div className="text-xs text-muted-foreground">{day.toLocaleDateString()}</div>
              </div>
            ))}

            {/* Account Rows */}
            {accounts?.map((account) => (
              <React.Fragment key={account.id}>
                <div className="sticky left-0 z-30 flex flex-col items-center justify-center py-2 pl-0 pr-2 space-y-1 border-t bg-card">
                  <Link
                    to={`/tiktok/${account.id}`}
                    className="flex flex-col items-center space-y-1 w-full max-w-full transition-transform duration-200 hover:scale-110">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={account.tiktok_avatar_url ?? undefined} />
                      <AvatarFallback>{account.tiktok_display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="w-full px-1 text-xs font-semibold text-center truncate">
                      {account.tiktok_display_name}
                    </div>
                  </Link>
                </div>
                {weekDays.map((day, index) => {
                  const dayAbbr = dayAbbreviations[index];
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
                    <div key={day.toISOString()} className="flex p-2 space-x-2 border-t">
                      <DroppableSlot
                        id={morningSlotId}
                        disabled={isMorningPast}
                        date={morningDateTime}
                        time={morningTime}
                        period="Morning">
                        {morningPosts.map((post) => (
                          <SortablePostCard key={post.id} post={post} isDraggable={!isMorningPast} />
                        ))}
                      </DroppableSlot>
                      <DroppableSlot
                        id={eveningSlotId}
                        disabled={isEveningPast}
                        date={eveningDateTime}
                        time={eveningTime}
                        period="Evening">
                        {eveningPosts.map((post) => (
                          <SortablePostCard key={post.id} post={post} isDraggable={!isEveningPast} />
                        ))}
                      </DroppableSlot>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
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
                  {dayAbbreviations.map((day) => (
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
