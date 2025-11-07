import { motion } from "framer-motion";
import React from "react";

interface NewPostDetailAssetButtonProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const NewPostDetailAssetButton = ({ onFileChange, disabled = false }: NewPostDetailAssetButtonProps) => {
  return (
    <div className="w-[300px] flex-shrink-0">
      <motion.div
        className="w-full aspect-[9/16] relative group overflow-hidden rounded-lg"
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
        <label
          htmlFor="file-upload"
          className={`w-full h-full flex items-center justify-center bg-muted rounded-lg ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}>
          <span className="text-4xl">+</span>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
            accept="image/webp,image/jpeg,video/mp4"
            disabled={disabled}
          />
        </label>
      </motion.div>
    </div>
  );
};
