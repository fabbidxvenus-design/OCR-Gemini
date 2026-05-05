import { useEffect } from 'react';
import { SwitchCamera, Upload } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewProps {
  onCapture: (blob: Blob, dataUrl: string) => void;
}

export default function CameraView({ onCapture }: CameraViewProps) {
  const {
    videoRef,
    canvasRef,
    stream,
    error,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
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
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center mb-6">
          <p className="text-error mb-4">{error}</p>
          <label className="inline-flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target cursor-pointer">
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

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          {/* File upload fallback */}
          <label className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full hover:bg-white/30 transition-colors touch-target cursor-pointer">
            <Upload className="w-6 h-6 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={!stream}
            className="flex items-center justify-center w-20 h-20 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
            aria-label="Chụp ảnh"
          >
            <div className="w-16 h-16 bg-white border-4 border-gray-900 rounded-full" />
          </button>

          {/* Switch camera */}
          {hasMultipleCameras && (
            <button
              onClick={switchCamera}
              className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full hover:bg-white/30 transition-colors touch-target"
              aria-label="Đổi camera"
            >
              <SwitchCamera className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}