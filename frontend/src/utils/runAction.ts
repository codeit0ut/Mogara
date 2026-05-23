import type { ToastContextValue } from "../components/Toast";

export async function runAction(
  toast: Pick<ToastContextValue, "success" | "error">,
  fn: () => Promise<void>,
  messages: { success: string; error?: string }
): Promise<boolean> {
  try {
    await fn();
    toast.success(messages.success);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : messages.error ?? "Something went wrong";
    toast.error(msg);
    return false;
  }
}
