import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/utils/constants";

interface TagInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tags?max=100`);
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      setSuggestions(data.tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter(
    (tag) => 
      !value.split(" ").includes(tag) && // Don't show already selected tags
      tag.toLowerCase().includes(value.toLowerCase()) // Case insensitive search
  );

  const handleSuggestionClick = (tag: string) => {
    const event = {
      target: {
        value: value + (value ? " " : "") + tag
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Thêm tags (ví dụ: #nature #portrait)"
          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-purple-100 
                   placeholder:text-gray-400 text-purple-700
                   focus:border-purple-300 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 
                   transition-all duration-200 shadow-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
          #
        </span>

        {/* Suggestions Dropdown */}
        {showSuggestions && (filteredSuggestions.length > 0 || loading) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border-2 border-purple-100 max-h-60 overflow-auto"
          >
            {loading ? (
              <div className="px-4 py-2 text-gray-500">Đang tải...</div>
            ) : (
              filteredSuggestions.map((tag) => (
                <button
                  key={tag}
                  className="w-full px-4 py-2 text-left hover:bg-purple-50 text-purple-700
                           transition-colors duration-150 flex items-center gap-2"
                  onClick={() => handleSuggestionClick(tag)}
                >
                  <span className="text-purple-400">#</span>
                  {tag}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}