/* eslint-disable @next/next/no-img-element */
import { formatDate } from "@/utils/formatDate";
import type { ImgItem } from "@/types/image.types";

interface ImageCardProps {
  item: ImgItem;
  onImageClick: () => void;
  onDelete: () => void;
}

export default function ImageCard({ item, onImageClick, onDelete }: ImageCardProps) {
  return (
    <figure className="mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm bg-white border">
      <img
        src={item.url}
        alt={item.name}
        loading="lazy"
        className="w-full h-auto cursor-zoom-in block"
        onClick={onImageClick}
      />
      <figcaption className="px-3 py-2 space-y-2">
        <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
          <span className="truncate" title={item.name}>
            {item.tags[0] ? item.tags[0] : "no-tags"}-picture-
            {formatDate(item.createdAt)}
          </span>
          <button
            className="p-2 rounded-full bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 
                    text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
            onClick={onDelete}
            title="Xoá ảnh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <button
                disabled={true}
                key={tag}
                className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-full
                       hover:bg-purple-100 transition-colors duration-200"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
