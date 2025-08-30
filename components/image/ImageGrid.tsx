import type { ImgItem } from "@/types/image.types";
import ImageCard from "./ImageCard";

interface ImageGridProps {
  items: ImgItem[];
  onImageClick: (index: number) => void;
  onDelete: (id: string) => void;
}

export default function ImageGrid({ items, onImageClick, onDelete }: ImageGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {items.map((item, idx) => (
        <ImageCard
          key={item.id}
          item={item}
          onImageClick={() => onImageClick(idx)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
}
