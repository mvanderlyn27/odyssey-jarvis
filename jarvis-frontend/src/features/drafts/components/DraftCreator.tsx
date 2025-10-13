import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createDraft, uploadMedia, addDraftAsset } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/lib/queries";

const DraftCreator = () => {
  const [file, setFile] = useState<File | null>(null);
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file || !userId) return;

      const newDraft = await createDraft(userId);
      const uploadedMedia = await uploadMedia(file, newDraft.id.toString());
      await addDraftAsset({
        draft_id: newDraft.id,
        asset_url: uploadedMedia.asset_url,
        asset_type: uploadedMedia.asset_type,
        order: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queries.drafts.all(userId!));
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      const acceptedTypes = ["image/webp", "image/jpeg", "video/mp4"];
      if (selectedFile && acceptedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        setFile(null);
        // TODO: Add user feedback for invalid file type
      }
    }
  };

  const handleUpload = () => {
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Draft</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Media File</Label>
          <Input id="picture" type="file" onChange={handleFileChange} accept="image/webp,image/jpeg,video/mp4" />
        </div>
        <Button onClick={handleUpload} disabled={!file || mutation.isPending} className="mt-4">
          {mutation.isPending ? "Creating..." : "Create Draft"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DraftCreator;
