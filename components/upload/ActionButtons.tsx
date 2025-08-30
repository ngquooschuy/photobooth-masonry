interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  isUploading: boolean;
  fileCount: number;
}

export default function ActionButtons({
  onCancel,
  onConfirm,
  isUploading,
  fileCount,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center gap-3">
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-700 font-medium
                 hover:bg-gray-50 transition-all duration-200"
      >
        Huỷ
      </button>
      <button
        onClick={onConfirm}
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
          `Thêm ${fileCount} ảnh`
        )}
      </button>
    </div>
  );
}
