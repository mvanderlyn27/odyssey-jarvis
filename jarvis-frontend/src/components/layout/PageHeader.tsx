import React from "react";
import { BackButton } from "@/components/BackButton";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

export default PageHeader;
