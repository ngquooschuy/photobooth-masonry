interface UploadAreaProps {
  onFileSelect: () => void;
}

export default function UploadArea({ onFileSelect }: UploadAreaProps) {
  return (
    <div className="relative">
      <div className="text-6xl mb-4 animate-pulse">📸</div>
      <div className="font-medium text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Kéo & thả ảnh vào đây
      </div>
      <div className="mt-2 text-sm text-gray-500">hoặc</div>
      <div>
        <button
          className="mt-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
                    hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200
                    shadow-md hover:shadow-lg flex items-center gap-3 mx-auto group"
          onClick={onFileSelect}
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
  );
}
