import React from "react";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { PostStatus } from "@/features/posts/types";

interface PageHeaderProps {
  title?: string;
  onBackClick?: () => void;
  children?: React.ReactNode;
  status?: PostStatus;
}

export const PageHeader = ({ title, onBackClick, children, status }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <BackButton onClick={onBackClick} />
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {status && <Badge variant="outline">{status}</Badge>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};
