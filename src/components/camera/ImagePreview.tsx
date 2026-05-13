import { RotateCcw, Check } from 'lucide-react';
import { PrimaryButton } from '@/components/ui';

interface ImagePreviewProps {
  imageDataUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export default function ImagePreview({ imageDataUrl, onRetake, onConfirm }: ImagePreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-ink shadow-elevated">
      <img src={imageDataUrl} alt="Captured" className="h-full w-full object-contain" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent px-6 pb-12 pt-20 safe-area-bottom">
        <div className="mx-auto max-w-[320px] pb-2">
          <p className="mb-4 text-center font-display text-heading text-white">Xác nhận ảnh chụp</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onRetake}
              className="btn-touch flex-1 border-2 border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Chụp lại
            </button>
            <PrimaryButton onClick={onConfirm} className="flex-1 shadow-camera-control">
              <Check className="mr-2 h-5 w-5" />
              Xác nhận
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
