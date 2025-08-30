import { useRef } from "react";
import PreviewGrid from "./PreviewGrid";
import UploadArea from "./UploadArea";
import TagInput from "./TagInput";
import ActionButtons from "./ActionButtons";

interface DropZoneProps {
  isDragging: boolean;
  previewFiles: { file: File; preview: string }[];
  isUploading: boolean;
  tagInput: string;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DropZone({
  isDragging,
  previewFiles,
  isUploading,
  tagInput,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onTagChange,
  onRemoveFile,
  onCancel,
  onConfirm,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative mb-8 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
        isDragging
          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 scale-102 shadow-lg"
          : "bg-white border-gray-200 hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30"
      }`}
    >
      {/* Floating hearts decoration */}
      <div className="absolute -top-4 -right-4 text-2xl animate-bounce">
        💝
      </div>
      <div
        className="absolute -bottom-3 -left-3 text-2xl animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        💖
      </div>

      <div className="relative">
        <div className="space-y-6">
          <PreviewGrid files={previewFiles} onRemove={onRemoveFile} />

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileSelect}
          />

          {previewFiles.length === 0 && (
            <UploadArea onFileSelect={() => inputRef.current?.click()} />
          )}

          {previewFiles.length > 0 && (
            <>
              <TagInput value={tagInput} onChange={onTagChange} />
              <ActionButtons
                onCancel={onCancel}
                onConfirm={onConfirm}
                isUploading={isUploading}
                fileCount={previewFiles.length}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
