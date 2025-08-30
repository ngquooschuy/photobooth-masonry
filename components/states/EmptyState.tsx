export default function EmptyState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-gray-400 text-5xl">📷</div>
        <div className="text-gray-500">
          Chưa có ảnh nào. Hãy thêm ảnh mới!
        </div>
      </div>
    </div>
  );
}
