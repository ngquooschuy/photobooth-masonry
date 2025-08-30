interface PreviewGridProps {
  files: { file: File; preview: string }[];
  onRemove: (index: number) => void;
}

export default function PreviewGrid({ files, onRemove }: PreviewGridProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {files.map((file, idx) => (
        <div key={idx} className="relative group aspect-square">
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover rounded-xl"
          />
          <button
            onClick={() => onRemove(idx)}
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
  );
}
