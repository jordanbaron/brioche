import type { ImageItem } from "./types";

interface StatusBadgeProps {
  status: ImageItem["status"];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    processed: "bg-green text-white",
    processing: "bg-yellow text-foreground",
    pending: "bg-foreground-faint text-white",
  };

  const labels = {
    processed: "Processed",
    processing: "Processing...",
    pending: "Pending",
  };

  return (
    <div
      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </div>
  );
}
