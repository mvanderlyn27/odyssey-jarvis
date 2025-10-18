import React from "react";
import { BackButton } from "@/components/BackButton";

interface PageHeaderProps {
  title: string;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

export const PageHeader = ({ title, onBackClick, children }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <BackButton onClick={onBackClick} />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};
