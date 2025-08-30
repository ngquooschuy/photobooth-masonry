interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-red-500 text-5xl">⚠️</div>
        <div className="text-red-600">{error}</div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
