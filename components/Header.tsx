interface HeaderProps {
  isAdding: boolean;
  itemsLength: number;
  onAdd: () => void;
  onClearAll: () => void;
}

export default function Header({
  isAdding,
  itemsLength,
  onAdd,
  onClearAll,
}: HeaderProps) {
  return (
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
                ✨ mduk&qhuy
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative px-6 py-2.5 text-sm font-medium text-white rounded-full
                       bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400
                       hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500
                       transform hover:scale-105 active:scale-95
                       transition-all duration-200 
                       shadow-[0_0_20px_rgba(250,187,255,0.3)]
                       hover:shadow-[0_0_25px_rgba(250,187,255,0.5)]
                       flex items-center gap-2 overflow-hidden group"
              onClick={onAdd}
            >
              <span
                className="absolute inset-0 bg-[length:20px_20px] bg-repeat opacity-20
                             bg-gradient-to-r from-white/20 via-white/0 to-white/0"
              ></span>
              <span className="relative flex items-center gap-2">
                {!isAdding ? (
                  <>
                    <span className="text-lg group-hover:rotate-12 transition-transform duration-300">
                      ✨
                    </span>
                    Thêm mới
                  </>
                ) : (
                  <>
                    <span className="text-lg group-hover:-rotate-90 transition-transform duration-300">
                      ✖
                    </span>
                    Đóng
                  </>
                )}
              </span>
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-50 to-red-50 text-red-500 rounded-full
                       border border-red-200 hover:border-red-300 hover:from-pink-100 hover:to-red-100
                       transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
              disabled={itemsLength === 0}
              onClick={onClearAll}
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
  );
}
