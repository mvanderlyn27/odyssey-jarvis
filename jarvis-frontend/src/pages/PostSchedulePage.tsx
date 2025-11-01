import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import SchedulerPostList from "@/features/scheduling/components/SchedulerPostList";
import ScheduleCalendar from "@/features/scheduling/components/ScheduleCalendar";
import { useSchedulePost } from "@/features/posts/hooks/useSchedulePost";
import { useUnschedulePost } from "@/features/posts/hooks/useUnschedulePost";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { useSchedulePageStore } from "@/store/useSchedulePageStore";
import DraggableSchedulerPostCard from "@/features/scheduling/components/DraggableSchedulerPostCard";
import { PostWithAssets } from "@/features/posts/types";

const PostSchedulePage = () => {
  const { daySettings } = useSchedulePageStore();
  const { mutate: schedulePost } = useSchedulePost();
  const { mutate: unschedulePost } = useUnschedulePost();
  const [activePost, setActivePost] = useState<PostWithAssets | null>(null);

  const { data: posts, isLoading } = usePosts({ status: "DRAFT,SCHEDULED" });

  const draftPosts = posts?.filter((p) => p.status === "DRAFT") ?? [];
  const scheduledPosts = posts?.filter((p) => p.status === "SCHEDULED") ?? [];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const post = posts?.find((p) => p.id === active.id);
    if (post) {
      setActivePost(post);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePost(null);
    const { over, active } = event;
    console.log("Drag ended. Active:", active.id, "Over:", over?.id);

    if (!over) {
      console.log("No drop target.");
      return;
    }

    if (active.id === over.id) {
      console.log("Item dropped on itself.");
      return;
    }

    const postId = active.id as string;
    const overId = over.id.toString();

    const isOverDrafts = overId.includes("drafts-list");
    const activeContainer = draftPosts.some((p) => p.id === postId) ? "drafts" : "calendar";
    const overContainer = isOverDrafts ? "drafts" : "calendar";

    console.log(`Moving from ${activeContainer} to ${overContainer}`);

    // Reordering within drafts is disabled pending a fix for optimistic update flickering.
    if (activeContainer === "drafts" && overContainer === "drafts") {
      console.log("Reordering within drafts is currently disabled.");
      return;
    }

    // Moving from calendar to drafts
    if (activeContainer === "calendar" && overContainer === "drafts") {
      console.log(`Moving post ${postId} from calendar to drafts.`);
      unschedulePost(postId);
      return;
    }

    // Moving to a calendar slot (from drafts or calendar)
    if (overContainer === "calendar") {
      const parts = overId.split("-");
      const timeSlot = parts.pop();
      const dayPart = parts.pop();
      const monthPart = parts.pop();
      const yearPart = parts.pop();
      const dateStr = `${yearPart}-${monthPart}-${dayPart}`;
      const accountId = parts.join("-");

      if (!dateStr || !timeSlot || !accountId) {
        console.error("Invalid drop target ID:", overId);
        return;
      }

      console.log(`Scheduling post ${postId} to account ${accountId} on ${dateStr} in the ${timeSlot}.`);

      const day = new Date(`${dateStr}T00:00:00.000Z`);
      const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getUTCDay()];

      if (!daySettings[dayAbbr]) {
        console.error("Could not find day settings for:", dayAbbr);
        return;
      }

      const time = timeSlot === "morning" ? daySettings[dayAbbr].morning : daySettings[dayAbbr].evening;
      const [hours, minutes] = time.split(":").map(Number);

      const scheduledAtDate = new Date(`${dateStr}T00:00:00.000Z`);
      scheduledAtDate.setUTCHours(hours, minutes, 0, 0);

      if (isNaN(scheduledAtDate.getTime())) {
        console.error("Constructed an invalid date.");
        return;
      }

      const scheduled_at = scheduledAtDate.toISOString();

      schedulePost({ postId, scheduledAt: scheduled_at, accountId });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* <div className="bg-card rounded-lg"> */}
      <div className="sticky top-0 z-50 p-4  bg-card">
        <SchedulerPostList posts={draftPosts} isLoading={isLoading} />
      </div>
      <div className="overflow-x-auto p-4">
        <ScheduleCalendar posts={scheduledPosts} isLoading={isLoading} />
      </div>
      {/* </div> */}
      <DragOverlay>{activePost ? <DraggableSchedulerPostCard post={activePost} /> : null}</DragOverlay>
    </DndContext>
  );
};

export default PostSchedulePage;
