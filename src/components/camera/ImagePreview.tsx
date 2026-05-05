import { RotateCcw, Check } from 'lucide-react';

interface ImagePreviewProps {
  imageDataUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function ImagePreview({ imageDataUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="relative w-full h-full bg-black">
      {/* Image preview */}
      <img
        src={imageDataUrl}
        alt="Captured"
        className="w-full h-full object-contain"
      />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          {/* Retake button */}
          <button
            onClick={onRetake}
            className="flex items-center gap-2 bg-white/20 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/30 transition-colors touch-target"
          >
            <RotateCcw className="w-5 h-5" />
            Chụp lại
          </button>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target"
          >
            <Check className="w-5 h-5" />
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}