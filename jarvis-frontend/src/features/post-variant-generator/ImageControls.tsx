import { Button } from "@/components/ui/button";

interface ImageControlsProps {
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isDirty: boolean;
  onRandomize: () => void;
  onRandomizeAll: () => void;
}

export const ImageControls = ({
  onSave,
  onCancel,
  onDelete,
  isDirty,
  onRandomize,
  onRandomizeAll,
}: ImageControlsProps) => {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex gap-2">
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="outline" onClick={onRandomize}>
          Randomize
        </Button>
        <Button variant="outline" onClick={onRandomizeAll}>
          Randomize All
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!isDirty}>
          Save
        </Button>
      </div>
    </div>
  );
};
