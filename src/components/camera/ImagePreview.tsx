import { RotateCcw, Check } from 'lucide-react';
import { PrimaryButton } from '@/components/ui';

interface ImagePreviewProps {
  imageDataUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function ImagePreview({ imageDataUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="relative w-full h-full bg-black">
      <img src={imageDataUrl} alt="Captured" className="w-full h-full object-contain" />

      <div className="absolute bottom-8 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/30 transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Chụp lại
          </button>
          <PrimaryButton onClick={onConfirm} className="shadow-elevated">
            <Check className="w-5 h-5 mr-2" />
            Xác nhận
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}