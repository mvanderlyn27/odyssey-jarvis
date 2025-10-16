import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import DraftsList from "@/features/scheduling/components/DraftsList";
import ScheduleCalendar from "@/features/scheduling/components/ScheduleCalendar";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useSchedulePost } from "@/features/posts/hooks/useSchedulePost";
import PostCard, { PostWithAssets } from "@/features/scheduling/components/PostCard";
import { useUnschedulePost } from "@/features/posts/hooks/useUnschedulePost";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { useSchedulePageStore } from "@/store/useSchedulePageStore";

const PostSchedulePage = () => {
  const { morningTime, eveningTime } = useScheduleStore();
  const { mutate: schedulePost } = useSchedulePost();
  const { mutate: unschedulePost } = useUnschedulePost();
  const [activePost, setActivePost] = useState<PostWithAssets | null>(null);

  const { data: posts, isLoading } = usePosts({ status: "DRAFT,SCHEDULED" });
  const { draftPosts, scheduledPosts, setDraftPosts, setScheduledPosts, movePostToSchedule, movePostToDrafts } =
    useSchedulePageStore();
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  useEffect(() => {
    if (posts && !isStoreInitialized) {
      const drafts = posts.filter((p) => p.status === "DRAFT");
      const scheduled = posts.filter((p) => p.status === "SCHEDULED");
      setDraftPosts(drafts);
      setScheduledPosts(scheduled);
      setIsStoreInitialized(true);
    }
  }, [posts, isStoreInitialized, setDraftPosts, setScheduledPosts]);

  const handleDragStart = (event: DragStartEvent) => {
    const post = event.active.data.current?.post as PostWithAssets;
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

    if (overId === "drafts-list") {
      movePostToDrafts(postId);
      unschedulePost(postId);
      return;
    }

    const parts = overId.split("-");
    const timeSlot = parts.pop();
    const datePart = parts.pop();
    const monthPart = parts.pop();
    const yearPart = parts.pop();
    const accountId = parts.join("-");

    const time = timeSlot === "morning" ? morningTime : eveningTime;
    const [hours, minutes] = time.split(":").map(Number);

    const scheduledAtDate = new Date(
      parseInt(yearPart!),
      parseInt(monthPart!) - 1,
      parseInt(datePart!),
      hours,
      minutes
    );

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
        <h1 className="text-2xl font-bold">Post Scheduler</h1>
        <DraftsList posts={draftPosts} isLoading={isLoading} />
        <div className="overflow-x-auto">
          <ScheduleCalendar posts={scheduledPosts} isLoading={isLoading} />
        </div>
      </div>
      <DragOverlay>{activePost ? <PostCard post={activePost} isOverlay /> : <div></div>}</DragOverlay>
    </DndContext>
  );
};

export default PostSchedulePage;
