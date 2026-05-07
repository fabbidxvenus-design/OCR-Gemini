# TIP-006: Camera Capture + Preview

## HEADER
- **TIP-ID**: TIP-006
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Camera
- **Priority**: P0
- **Depends on**: TIP-001, TIP-003, TIP-005
- **Estimated**: 8 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Lucide React
- **Key files to read first**: 
  - `src/pages/CameraPage.tsx` (placeholder from TIP-003, will be replaced)
  - `BUILDER-HANDOFF.md` (mobile-first patterns, touch targets)
- **Patterns to follow**: Mobile Camera API, getUserMedia, canvas for image capture, HTTPS requirement

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Implement camera capture functionality using the browser's Camera API (getUserMedia). Create CameraView component with live video preview, capture button, and image preview after capture. Handle camera permissions, multiple camera selection (front/back), and retake functionality. Ensure proper cleanup of media streams. Support both camera capture and file upload fallback for devices without camera access.

---

## SPECIFICATIONS

### Business Rules

1. **Camera access**: Request camera permission on component mount
2. **Live preview**: Show live video stream from camera
3. **Capture**: Take photo and convert to Blob + data URL
4. **Preview**: Show captured image with retake/confirm options
5. **Camera selection**: Toggle between front/back cameras (if available)
6. **Fallback**: File upload input if camera not available
7. **Cleanup**: Release camera stream when component unmounts
8. **HTTPS requirement**: Camera API requires HTTPS (or localhost)

### Camera Hook

**src/hooks/useCamera.ts**:
```typescript
import { useState, useRef, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stream: MediaStream | null;
  error: string | null;
  hasMultipleCameras: boolean;
  currentFacingMode: 'user' | 'environment';
  startCamera: (facingMode?: 'user' | 'environment') => Promise<void>;
  stopCamera: () => void;
  captureImage: () => { blob: Blob; dataUrl: string } | null;
  switchCamera: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    // Check for multiple cameras
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setError(null);
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
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
      setStream(mediaStream);
      setCurrentFacingMode(facingMode);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
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
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = (): { blob: Blob; dataUrl: string } | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    let blob: Blob | null = null;
    canvas.toBlob((b) => {
      blob = b;
    }, 'image/jpeg', 0.95);

    // Wait for blob conversion (synchronous for this use case)
    const blobData = dataURLtoBlob(dataUrl);
    
    return { blob: blobData, dataUrl };
  };

  const switchCamera = async () => {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
  };

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
  };
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
```

### Camera View Component

**src/components/camera/CameraView.tsx**:
```typescript
import { useEffect } from 'react';
import { Camera, SwitchCamera, Upload } from 'lucide-react';
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
```

### Image Preview Component

**src/components/camera/ImagePreview.tsx**:
```typescript
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
```

### Updated Camera Page

**src/pages/CameraPage.tsx**:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';

export default function CameraPage() {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    dataUrl: string;
  } | null>(null);

  const handleCapture = (blob: Blob, dataUrl: string) => {
    setCapturedImage({ blob, dataUrl });
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    
    // TODO: TIP-007 will handle OCR processing
    // For now, just navigate to a placeholder
    console.log('Image confirmed:', capturedImage);
    alert('OCR processing will be implemented in TIP-007');
  };

  return (
    <Layout title="Chụp ảnh" showBottomNav={!capturedImage}>
      <div className="h-full">
        {capturedImage ? (
          <ImagePreview
            imageDataUrl={capturedImage.dataUrl}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        ) : (
          <CameraView onCapture={handleCapture} />
        )}
      </div>
    </Layout>
  );
}
```

### Validation

1. **Camera permission**: Request and handle permission states
2. **Live preview**: Video stream displays correctly
3. **Capture quality**: Image captured at high resolution (1920x1080 ideal)
4. **Camera switch**: Toggle between front/back cameras works
5. **File upload**: Fallback works when camera unavailable
6. **Cleanup**: Media stream released on unmount

### Error Handling

- **Permission denied**: Show error message + file upload fallback
- **Camera not found**: Show error message + file upload fallback
- **Capture failure**: Log error, allow retry
- **HTTPS requirement**: Document in README (localhost works for dev)

---

## ACCEPTANCE CRITERIA

### AC-001: Camera Access
- **Given**: User opens CameraPage
- **When**: Component mounts
- **Then**:
  - Browser requests camera permission
  - If granted, live video preview displays
  - If denied, error message shows with file upload option

### AC-002: Live Preview
- **Given**: Camera permission granted
- **When**: Video stream starts
- **Then**:
  - Live camera feed displays full screen
  - Video is properly oriented
  - No lag or stuttering

### AC-003: Capture Image
- **Given**: Live preview is active
- **When**: User taps capture button (white circle)
- **Then**:
  - Image is captured from current video frame
  - Video stream stops
  - ImagePreview component displays with captured image

### AC-004: Image Preview
- **Given**: Image has been captured
- **When**: ImagePreview displays
- **Then**:
  - Captured image shows full screen
  - "Chụp lại" and "Xác nhận" buttons are visible
  - BottomNav is hidden

### AC-005: Retake
- **Given**: User is viewing captured image
- **When**: User taps "Chụp lại" button
- **Then**:
  - ImagePreview closes
  - Camera restarts
  - Live preview displays again

### AC-006: Confirm
- **Given**: User is viewing captured image
- **When**: User taps "Xác nhận" button
- **Then**:
  - Image data (blob + dataUrl) is available
  - Console logs confirmation (placeholder for TIP-007)
  - Alert shows "OCR processing will be implemented in TIP-007"

### AC-007: Switch Camera
- **Given**: Device has multiple cameras (front + back)
- **When**: User taps switch camera button
- **Then**:
  - Camera switches between front and back
  - Live preview updates to new camera
  - Button only shows if multiple cameras available

### AC-008: File Upload Fallback
- **Given**: Camera access denied or unavailable
- **When**: User taps "Tải ảnh lên" button
- **Then**:
  - File picker opens
  - User selects image file
  - ImagePreview displays with selected image

### AC-009: Cleanup
- **Given**: User is on CameraPage with active camera
- **When**: User navigates away (e.g., taps History in BottomNav)
- **Then**:
  - Camera stream is stopped
  - Camera light turns off
  - No memory leaks

### AC-010: Touch Targets
- **Given**: User is on mobile device
- **When**: User taps any button (capture, retake, confirm, switch, upload)
- **Then**:
  - Touch target is ≥ 44px × 44px
  - Tap registers correctly
  - Visual feedback on tap

---

## CONSTRAINTS

### DO NOT:
- ❌ Use third-party camera libraries — use native getUserMedia API
- ❌ Store full-resolution images yet — compression in TIP-008
- ❌ Implement OCR processing — that's TIP-007
- ❌ Add filters or editing — out of scope for POC
- ❌ Support video recording — photos only
- ❌ Implement QR code scanning — OCR only

### REUSE:
- ✅ Native Camera API (getUserMedia)
- ✅ Canvas API for image capture
- ✅ FileReader API for file upload
- ✅ Lucide React icons
- ✅ Tailwind utility classes
- ✅ Layout component from TIP-003

### SKIP (out of scope for TIP-006):
- ⏭️ Image compression (will be in TIP-008)
- ⏭️ OCR processing (will be in TIP-007)
- ⏭️ Saving to IndexedDB (will be in TIP-007)
- ⏭️ Image filters or adjustments
- ⏭️ Zoom controls
- ⏭️ Flash control

---

## COMPLETION CHECKLIST

- [ ] `src/hooks/useCamera.ts` created
- [ ] `src/components/camera/CameraView.tsx` created
- [ ] `src/components/camera/ImagePreview.tsx` created
- [ ] `src/pages/CameraPage.tsx` updated
- [ ] Camera permission request works
- [ ] Live video preview displays
- [ ] Capture button works
- [ ] Image preview shows after capture
- [ ] Retake button restarts camera
- [ ] Confirm button logs image data
- [ ] Switch camera works (if multiple cameras)
- [ ] File upload fallback works
- [ ] Camera cleanup on unmount works
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tested on Chrome Android + iOS Safari

---

## NOTES FOR BUILDER

1. **HTTPS requirement**: Camera API requires HTTPS in production. For local development, `localhost` works without HTTPS.
2. **iOS Safari**: Use `playsInline` attribute on video element to prevent fullscreen mode.
3. **Permissions**: Handle all three states: granted, denied, prompt.
4. **Cleanup**: Always stop media tracks in cleanup to release camera.
5. **Testing**: Test on real mobile devices, not just desktop DevTools.
6. **Fallback**: File upload is critical for devices without camera or when permission denied.

---

*TIP-006 | Generated: 2026-05-05 | Vibecode Kit v5.0*
