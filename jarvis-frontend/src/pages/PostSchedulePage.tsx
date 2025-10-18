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
  const { draftPosts, scheduledPosts, setDraftPosts, setScheduledPosts, movePostToSchedule, movePostToDrafts } =
    useSchedulePageStore();

  useEffect(() => {
    if (posts) {
      const drafts = posts.filter((p) => p.status === "DRAFT");
      const scheduled = posts.filter((p) => p.status === "SCHEDULED");
      setDraftPosts(drafts);
      setScheduledPosts(scheduled);
    }
  }, [posts, setDraftPosts, setScheduledPosts]);

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
    if (!over) return;

    const postId = active.id as string;
    const overId = over.id.toString();

    if (overId === "drafts-list" || draftPosts.some((p) => p.id === overId)) {
      const oldIndex = draftPosts.findIndex((p) => p.id === postId);
      const newIndex = overId === "drafts-list" ? draftPosts.length - 1 : draftPosts.findIndex((p) => p.id === overId);

      if (oldIndex !== -1) {
        if (newIndex !== -1) {
          setDraftPosts(arrayMove(draftPosts, oldIndex, newIndex));
        }
      } else {
        movePostToDrafts(postId);
        unschedulePost(postId);
      }
      return;
    }

    const parts = overId.split("-");
    const timeSlot = parts.pop();
    const dateStr = parts.pop();
    const accountId = parts.join("-");

    if (!dateStr || !timeSlot || !accountId) return;

    const day = new Date(dateStr);
    const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getUTCDay()];
    const time = timeSlot === "morning" ? daySettings[dayAbbr].morning : daySettings[dayAbbr].evening;
    const [hours, minutes] = time.split(":").map(Number);

    const scheduledAtDate = new Date(dateStr);
    scheduledAtDate.setUTCHours(hours, minutes, 0, 0);

    if (isNaN(scheduledAtDate.getTime())) {
      console.error("Constructed date is invalid.");
      return;
    }

    const scheduled_at = scheduledAtDate.toISOString();

    movePostToSchedule(postId, scheduled_at, accountId);
    schedulePost({
      postId: postId,
      scheduledAt: scheduled_at,
      accountId: accountId,
    });
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 py-4">
          <SchedulerPostList posts={draftPosts} isLoading={isLoading} onSort={setDraftPosts} />
        </div>
        <div className="overflow-x-auto">
          <ScheduleCalendar posts={scheduledPosts} isLoading={isLoading} />
        </div>
      </div>
      <DragOverlay>{activePost ? <DraggableSchedulerPostCard post={activePost} /> : null}</DragOverlay>
    </DndContext>
  );
};

export default PostSchedulePage;
