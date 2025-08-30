import { ImgItem } from "@/types/image.types";
import { useMemo } from "react";

export function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (!bytes) return "0 B";
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function StorageHint(items: ImgItem[]) {
  const maxStorage = useMemo(() => items.length > 150, [items.length]);
  return maxStorage;
}

export function DownloadImage(item: ImgItem) {
  const a = document.createElement("a");
  a.href = item.url;
  a.download = item.name || "image";
  a.click();
}
