/* eslint-disable @next/next/no-img-element */

import LightboxButton from "./LightboxButton";

interface LightboxProps {
  currentImage: {
    url: string;
    name: string;
  };
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  currentImage,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <LightboxButton
        direction="left"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        title="Ảnh trước"
      />

      <LightboxButton
        direction="right"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        title="Ảnh tiếp theo"
      />

      <img
        src={currentImage.url}
        alt={currentImage.name}
        className="max-h-[90vh] max-w-[95vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
