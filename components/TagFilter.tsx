interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearFilter: () => void;
}

export default function TagFilter({
  allTags,
  selectedTags,
  onTagSelect,
  onClearFilter,
}: TagFilterProps) {
  if (allTags.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-2">Lọc theo tag:</div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
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
            onClick={onClearFilter}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
