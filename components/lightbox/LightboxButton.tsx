interface LightboxButtonProps {
  direction: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
  title: string;
}

export default function LightboxButton({
  direction,
  onClick,
  title,
}: LightboxButtonProps) {
  return (
    <button
      className={`absolute ${
        direction === "left" ? "left-4 md:left-8" : "right-4 md:right-8"
      } p-3 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 text-gray-900`}
      onClick={onClick}
      title={title}
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
        <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );
}
