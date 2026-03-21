import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        className: "rounded-xl border px-3 py-2 text-sm shadow-sm",
        style: {
          background: "#ffffff",
          color: "#0f172a",
          borderColor: "#e2e8f0",
        },
        success: {
          style: {
            background: "#ecfdf5",
            color: "#065f46",
            borderColor: "#a7f3d0",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#991b1b",
            borderColor: "#fecaca",
          },
        },
      }}
    />
  );
}
