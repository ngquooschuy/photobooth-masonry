"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ApiResponse, ImgItem } from "../types/image.types";
import { parseTags } from "../utils/parseTags";
import { API_URL } from "../utils/constants";
import { formatDate } from "../utils/formatDate";
import Header from "./Header";
import TagFilter from "./TagFilter";
import DropZone from "./upload/DropZone";
import Lightbox from "./lightbox/Lightbox";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import EmptyState from "./states/EmptyState";
import ImageGrid from "./image/ImageGrid";

export default function PhotoboothMasonry() {
  const [items, setItems] = useState<ImgItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/images?max=100`);

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const data = (await response.json()) as ApiResponse;
      setItems(
        data.items.map((img) => ({
          id: img.id,
          name: img.name,
          url: img.url,
          size: img.size,
          createdAt: img.createdAt,
          tags: img.tags || [],
          width: img.width,
          height: img.height,
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load images. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<
    { file: File; preview: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleExpandAddImage = () => {
    setIsAdding(!isAdding);
    setPreviewFiles([]);
    setTagInput("");
  };

  const handleFilePreview = useCallback((files: File[]) => {
    const imageFiles = files
      .filter((f) => /^image\//.test(f.type))
      .slice(0, 500);

    Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<{ file: File; preview: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then(setPreviewFiles);
  }, []);

  // Get all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  // Filter items by selected tags
  const filteredItems = useMemo(() => {

    if (selectedTags.length === 0) return items;
    return items.filter((item) =>
      item.tags.some((tag) => selectedTags.includes(tag))
    );
  }, [items, selectedTags]);

  // Handle tag input
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(" ") && value.trim()) {
      const tag = value.trim().replace(/^#/, ""); // Remove # if present
      if (tag && !tagInput.includes(tag)) {
        setTagInput((prev) => prev + (prev ? " #" : "#") + tag);
      }
    } else {
      setTagInput(value);
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const list = Array.from(e.dataTransfer?.files ?? []);
      handleFilePreview(list);
    },
    [handleFilePreview]
  );

  const onChoose = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = Array.from(e.target.files ?? []);
      handleFilePreview(list);
      if (inputRef.current) inputRef.current.value = ""; // allow re-upload same files
    },
    [handleFilePreview]
  );

  const uploadToServer = async (
    file: File,
    tags: string[]
  ): Promise<ImgItem> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tags", JSON.stringify(tags));

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id || crypto.randomUUID(),
        name: file.name,
        url: data.url,
        size: file.size,
        createdAt: Date.now(),
        tags: tags,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleConfirmUpload = useCallback(async () => {
    if (!previewFiles.length) return;

    setIsUploading(true);
    const tags = parseTags(tagInput);
    const uploadedImages: ImgItem[] = [];
    const errors: string[] = [];

    try {
      for (const { file } of previewFiles) {
        try {
          const uploadedImage = await uploadToServer(file, tags);
          uploadedImages.push(uploadedImage);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }

      if (errors.length > 0) {
        alert(`Some uploads failed:\n${errors.join("\n")}`);
      }

      if (uploadedImages.length > 0) {
        // Refresh the image list after successful upload
        await fetchImages();
        setPreviewFiles([]);
        setTagInput("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [previewFiles, tagInput, fetchImages]);

  const removeAt = async (id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/images/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      await fetchImages(); // Refresh the list after successful deletion
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete image: ${errorMessage}`);
    }
  };
  const clearAll = () => {
    if (!confirm("Xoá tất cả ảnh? Hành động này không thể hoàn tác.")) return;
    setItems([]);
  };

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prev = () =>
    setLightboxIdx((i) =>
      i === null ? null : (i - 1 + items.length) % items.length
    );
  const next = () =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % items.length));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx, items.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isAdding={isAdding}
        itemsLength={items.length}
        onAdd={handleExpandAddImage}
        onClearAll={clearAll}
      />
      <main className="max-w-6xl mx-auto p-4">
        {/* Drop zone */}
        {isAdding && (
          <DropZone
            isDragging={isDragging}
            previewFiles={previewFiles}
            isUploading={isUploading}
            tagInput={tagInput}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onFileSelect={onChoose}
            onTagChange={handleTagInput}
            onRemoveFile={(idx) =>
              setPreviewFiles((prev) => prev.filter((_, i) => i !== idx))
            }
            onCancel={() => setPreviewFiles([])}
            onConfirm={handleConfirmUpload}
          />
        )}
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={(tag) =>
            setSelectedTags((prev) =>
              prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
            )
          }
          onClearFilter={() => setSelectedTags([])}
        />

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchImages} />
        ) : filteredItems.length === 0 ? (
          <EmptyState />
        ) : (
          <ImageGrid
            items={filteredItems}
            onImageClick={openLightbox}
            onDelete={removeAt}
          />
        )}
      </main>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          currentImage={items[lightboxIdx]}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
