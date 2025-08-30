"use client";
/* eslint-disable @next/next/no-img-element */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// --- Types ---
type ApiResponse = {
  items: {
    id: string;
    name: string;
    url: string;
    size: number;
    createdAt: number;
    width?: number;
    height?: number;
    tags: string[];
  }[];
  next_cursor: string | null;
};

type ImgItem = {
  id: string;
  name: string;
  url: string; // blob URL or data URL
  size: number;
  createdAt: number;
  width?: number;
  height?: number;
  tags: string[]; // array of tags without # prefix
};
import { parseTags } from "../utils/parseTags";
import { API_URL } from "../utils/constants";
import { formatDate } from "../utils/formatDate";

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
      selectedTags.every((tag) => item.tags.includes(tag))
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

  const storageHint = useMemo(() => items.length > 150, [items.length]);

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

  const [isUploading, setIsUploading] = useState(false);

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
  }, [previewFiles, tagInput, setItems]);

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
  }, [lightboxIdx, items.length]);

  const download = (item: ImgItem) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name || "image";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Photobooth
              </h1>
              <div className="relative">
                <span
                  className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 text-purple-700 rounded-full
                               border border-purple-200 shadow-sm"
                >
                  ✨ Gallery
                </span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-50 to-red-50 text-red-500 rounded-full
                           border border-red-200 hover:border-red-300 hover:from-pink-100 hover:to-red-100
                           transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                onClick={handleExpandAddImage}
              >
                {!isAdding ? "Thêm mới" : "Đóng"}
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-50 to-red-50 text-red-500 rounded-full
                           border border-red-200 hover:border-red-300 hover:from-pink-100 hover:to-red-100
                           transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                disabled={items.length === 0}
                onClick={clearAll}
              >
                <span role="img" aria-label="trash" className="text-lg">
                  🗑️
                </span>
                Xoá tất cả
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Drop zone */}
        {isAdding && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative mb-8 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              isDragging
                ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 scale-102 shadow-lg"
                : "bg-white border-gray-200 hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30"
            }`}
          >
            {/* Tag input */}
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
                {/* Preview Grid */}
                {previewFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previewFiles.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={() =>
                            setPreviewFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 
                                     group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
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
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div className="relative">
                  <div className="text-6xl mb-4 animate-pulse">📸</div>
                  <div className="font-medium text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Kéo & thả ảnh vào đây
                  </div>
                  <div className="mt-2 text-sm text-gray-500">hoặc</div>
                  <div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={onChoose}
                    />
                    <button
                      className="mt-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
                                    hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200
                                    shadow-md hover:shadow-lg flex items-center gap-3 mx-auto group"
                      onClick={() => inputRef.current?.click()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:rotate-12 transition-transform duration-300"
                      >
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                        <line x1="16" y1="5" x2="22" y2="5"></line>
                        <line x1="19" y1="2" x2="19" y2="8"></line>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                      <span className="relative">
                        Chọn ảnh
                        <span className="absolute -top-1 -right-2 text-yellow-300 animate-ping">
                          ✨
                        </span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tag Input & Actions */}
                {previewFiles.length > 0 && (
                  <>
                    <div className="max-w-md mx-auto">
                      <div className="relative">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={handleTagInput}
                          placeholder="Thêm tags (ví dụ: #nature #portrait)"
                          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-purple-100 
                                     placeholder:text-gray-400 text-purple-700
                                     focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 
                                     transition-all duration-200 shadow-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                          #
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setPreviewFiles([])}
                        className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-700 font-medium
                                   hover:bg-gray-50 transition-all duration-200"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={handleConfirmUpload}
                        disabled={isUploading}
                        className={`px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
                                   transition-all duration-200 shadow-md flex items-center gap-2
                                   ${
                                     isUploading
                                       ? "opacity-75 cursor-not-allowed"
                                       : "hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 hover:shadow-lg"
                                   }`}
                      >
                        {isUploading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Đang tải lên...
                          </>
                        ) : (
                          `Thêm ${previewFiles.length} ảnh`
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mb-6 ">
            <div className="text-sm text-gray-500 mb-2">Lọc theo tag:</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedTags.includes(tag)
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading and Error states */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-8 w-8 text-purple-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-600">Đang tải ảnh...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-red-500 text-5xl">⚠️</div>
              <div className="text-red-600">{error}</div>
              <button
                onClick={fetchImages}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-gray-400 text-5xl">📷</div>
              <div className="text-gray-500">
                Chưa có ảnh nào. Hãy thêm ảnh mới!
              </div>
            </div>
          </div>
        ) : (
          /* Masonry grid via CSS columns */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filteredItems.map((it, idx) => (
              <figure
                key={it.id}
                className="mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm bg-white border"
              >
                <img
                  src={it.url}
                  alt={it.name}
                  loading="lazy"
                  className="w-full h-auto cursor-zoom-in block"
                  onClick={() => openLightbox(idx)}
                />
                <figcaption className="px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                    <span className="truncate" title={it.name}>
                      {it.tags[0] ? it.tags[0] : "no-tags"}-picture-
                      {formatDate(it.createdAt)}
                    </span>
                    <button
                      className="p-2 rounded-full bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 
                                text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                      onClick={() => removeAt(it.id)}
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
                  {it.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {it.tags.map((tag) => (
                        <button
                          disabled={true}
                          key={tag}
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            )
                          }
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
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute left-4 md:left-8 p-3 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            title="Ảnh trước"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            className="absolute right-4 md:right-8 p-3 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            title="Ảnh tiếp theo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <img
            src={items[lightboxIdx].url}
            alt={items[lightboxIdx].name}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Helper styles for masonry compatibility across browsers */}
      <style>{`
        /* Ensure proper masonry breaks in Safari/Firefox */
        .break-inside-avoid { break-inside: avoid; }
      `}</style>
    </div>
  );
}
