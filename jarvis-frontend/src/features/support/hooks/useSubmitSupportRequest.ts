import { useMutation } from "@tanstack/react-query";
import { submitSupportRequest } from "../api";
import { toast } from "sonner";

type UseSubmitSupportRequestOptions = {
  onSuccess?: () => void;
};

export const useSubmitSupportRequest = (options?: UseSubmitSupportRequestOptions) => {
  return useMutation({
    mutationFn: submitSupportRequest,
    onSuccess: () => {
      toast.success("Support request submitted successfully!");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to submit support request", {
        description: error.message,
      });
    },
  });
};
