import { toast } from "sonner";

export const showToast = {
  success: (msg: string, description?: string) => toast.success(msg, { description }),
  error: (msg: string, description?: string) => toast.error(msg, { description }),
  info: (msg: string, description?: string) => toast(msg, { description }),
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => toast.promise(promise, msgs),
};
