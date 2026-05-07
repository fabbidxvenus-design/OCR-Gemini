import { useEffect, useState } from 'react';
import { X, Settings, Upload } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewProps {
  onCapture: (blob: Blob, dataUrl: string) => void;
  onClose?: () => void;
}

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const {
    videoRef,
    canvasRef,
    stream,
    error,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const result = captureImage();
    if (result) {
      onCapture(result.blob, result.dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onCapture(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black p-4">
        <div className="text-center mb-6">
          <p className="text-error mb-4">{error}</p>
          <label className="inline-flex items-center gap-2 bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-hover transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            Tải ảnh lên
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark overlay with cutout */}
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/85" />
          {/* Center cutout - guide rectangle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[200px] border-2 border-white/60 rounded-2xl" />
        </div>
      )}

      {/* Guide text */}
      {showOverlay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32 text-center pointer-events-none">
          <p className="text-white text-small font-medium opacity-80">
            Hướng nhãn hóa đơn vào khung
          </p>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="flex items-center justify-center w-11 h-11 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          aria-label="Cài đặt"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
        <div className="flex items-center justify-center gap-8">
          {/* File upload */}
          <label className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Capture FAB - 64px */}
          <button
            onClick={handleCapture}
            disabled={!stream}
            className="flex items-center justify-center w-16 h-16 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all active:scale-95 shadow-elevated"
            aria-label="Chụp ảnh"
          >
            <div className="w-12 h-12 bg-white rounded-full" />
          </button>

          {/* Spacer for symmetry */}
          <div className="w-12" />
        </div>
      </div>
    </div>
  );
}