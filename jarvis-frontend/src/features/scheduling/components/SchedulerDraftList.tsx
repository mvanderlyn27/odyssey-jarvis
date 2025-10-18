import { usePosts } from "@/features/posts/hooks/usePosts";
import { PostWithAssets } from "@/features/posts/types";
import DraggableSchedulerPostCard from "./DraggableSchedulerPostCard";
import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const SchedulerDraftList = () => {
  const { data: drafts, isLoading } = usePosts({ status: "DRAFT" });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollability();
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [drafts, checkScrollability]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300 + 16;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Drafts</h2>
      <div className="relative flex items-center">
        <Button
          onClick={() => handleScroll("left")}
          variant="outline"
          size="icon"
          className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
          disabled={!canScrollLeft}>
          <ChevronLeftIcon className="h-6 w-6" />
        </Button>
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto px-12 w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-4 p-4">
            {(drafts || []).map((post: PostWithAssets) => (
              <DraggableSchedulerPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        <Button
          onClick={() => handleScroll("right")}
          variant="outline"
          size="icon"
          className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
          disabled={!canScrollRight}>
          <ChevronRightIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SchedulerDraftList;
