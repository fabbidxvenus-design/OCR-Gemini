import { useEffect, useState } from 'react';
import { Settings, Upload } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewProps {
  onCapture: (blob: Blob, dataUrl: string) => void;
}

export default function CameraView({ onCapture }: CameraViewProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (typeof event.target?.result !== 'string') return;
      onCapture(file, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-ink p-5 text-center">
        <div className="mb-5 rounded-2xl border border-warning/30 bg-warning-light px-4 py-3 text-small font-medium text-warning">
          {error}
        </div>
        <label className="btn-touch cursor-pointer bg-primary text-white shadow-camera-control hover:bg-primary-hover">
          <Upload className="mr-2 h-5 w-5" />
          Tải ảnh lên
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-ink shadow-elevated">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-transparent to-ink/90" />

      {showOverlay && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[46%] h-[220px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/20 bg-black/10 backdrop-blur-[1px]" />
          <div className="absolute left-1/2 top-[46%] h-[220px] w-[300px] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-primary" />
            <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-primary" />
            <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-primary" />
          </div>
        </div>
      )}

      <div className="absolute left-4 right-4 top-4 flex items-start justify-between safe-area-top">
        <div>
          <h2 className="font-display text-heading text-white">Quét tài liệu</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-success-light px-3 py-1 text-caption font-semibold text-success">API Online</span>
            <span className="rounded-full bg-ai-light px-3 py-1 text-caption font-semibold text-ai">Gemini Pro</span>
          </div>
        </div>
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="touch-target flex items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Bật tắt khung hướng dẫn"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showOverlay && (
        <div className="pointer-events-none absolute left-1/2 top-[calc(46%+150px)] w-full -translate-x-1/2 px-8 text-center">
          <p className="font-display text-heading-sm text-white">Đặt tài liệu trong khung</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-caption font-semibold text-white backdrop-blur-sm">Ánh sáng tốt</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-caption font-semibold text-white backdrop-blur-sm">Giữ máy ổn định</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 px-6 safe-area-bottom">
        <div className="mx-auto flex max-w-[300px] items-center justify-center gap-8">
          <label className="touch-target flex cursor-pointer items-center justify-center rounded-full bg-white/15 text-white shadow-camera-control backdrop-blur-md transition-colors hover:bg-white/25">
            <Upload className="h-5 w-5" />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleCapture}
            disabled={!stream}
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-white/10 shadow-camera-control backdrop-blur-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Chụp ảnh"
          >
            <div className="h-14 w-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
