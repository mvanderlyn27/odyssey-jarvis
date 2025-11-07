import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ Icon, title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="mb-4">
        <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
