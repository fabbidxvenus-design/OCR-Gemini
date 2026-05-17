import { useState, useRef, useEffect, useCallback } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  error: string | null;
  hasMultipleCameras: boolean;
  currentFacingMode: 'user' | 'environment';
  startCamera: (facingMode?: 'user' | 'environment') => Promise<void>;
  stopCamera: () => void;
  captureImage: () => Promise<{ blob: Blob; dataUrl: string } | null>;
  switchCamera: () => Promise<void>;
  isActive: boolean;
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.82);
  });

  if (!blob) throw new Error('Không thể chụp ảnh. Vui lòng thử lại.');
  return blob;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('environment');

  // Use ref to track current stream - avoids stale closure issues
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    // Check for multiple cameras
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch((err) => {
      console.warn('Could not enumerate devices:', err);
      // Continue without knowing if multiple cameras are available
    });
  }, []);

  // Cleanup function to revoke all object URLs
  const revokeAllObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      revokeAllObjectUrls();
    };
  }, [revokeAllObjectUrls]);

  // Update ref when stream changes
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setError(null);

      // Stop existing stream using ref to avoid stale closure
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCurrentFacingMode(facingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Camera error:', errorMessage);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera.');
        } else if (err.name === 'NotFoundError') {
          setError('Không tìm thấy camera. Vui lòng sử dụng tải ảnh lên.');
        } else {
          setError('Không thể truy cập camera. Vui lòng thử lại.');
        }
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    revokeAllObjectUrls();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [revokeAllObjectUrls]);

  const captureImage = useCallback(async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas 2D context not available');
      return null;
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await canvasToJpegBlob(canvas);
      const dataUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.push(dataUrl);
      return { blob, dataUrl };
    } catch (err) {
      console.error('Failed to capture image:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
  }, [currentFacingMode, startCamera]);

  return {
    videoRef,
    canvasRef,
    stream,
    error,
    hasMultipleCameras,
    currentFacingMode,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    isActive: stream !== null,
  };
}