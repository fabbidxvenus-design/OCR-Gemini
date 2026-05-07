# TIP-017: Loading States + Error Handling

## HEADER
- **TIP-ID**: TIP-017
- **Project**: OCR Gemini Mobile Web POC
- **Module**: UX Polish
- **Priority**: P0
- **Depends on**: TIP-006, TIP-007, TIP-009
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3
- **Key files to read first**: 
  - `src/pages/CameraPage.tsx` (add loading states)
  - `src/lib/gemini.ts` (already has retry logic)
- **Patterns to follow**: Skeleton loaders, error boundaries, retry mechanisms

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Add comprehensive loading states and error handling across the application. Show skeleton loaders during data fetching, spinner during OCR processing, and error messages with retry actions. Implement error boundary for unexpected crashes. Provide user-friendly error messages in Vietnamese. Handle network errors, API errors, and timeout scenarios gracefully.

---

## SPECIFICATIONS

### Business Rules

1. **Loading states**: Skeleton loaders for lists, spinner for processing
2. **Error messages**: User-friendly Vietnamese messages
3. **Retry actions**: Allow user to retry failed operations
4. **Error boundary**: Catch unexpected errors, show fallback UI
5. **Network errors**: Detect offline state, show appropriate message
6. **Timeout handling**: Show timeout message after 30 seconds
7. **Progress indicator**: Show progress during OCR processing

### Loading Components

**src/components/ui/Spinner.tsx**:
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Đang tải"
    />
  );
}
```

**src/components/ui/SkeletonCard.tsx**:
```typescript
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
      <div className="flex gap-3">
        {/* Thumbnail skeleton */}
        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

**src/components/ui/ErrorMessage.tsx**:
```typescript
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorMessage({
  title,
  message,
  onRetry,
  retryLabel = 'Thử lại',
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-neutral mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
```

### Error Boundary

**src/components/ErrorBoundary.tsx**:
```typescript
import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-neutral mb-6">
              Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-sm text-neutral cursor-pointer mb-2">
                  Chi tiết lỗi
                </summary>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors w-full"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Updated Camera Page with Loading States

**src/pages/CameraPage.tsx** (add OCR processing state):
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCamera } from '@/hooks/useCamera';
import { useCompression } from '@/hooks/useCompression';
import { processOCR } from '@/lib/gemini';
import { createScan } from '@/db/queries';
import { Camera, RotateCw, X, Loader2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function CameraPage() {
  const navigate = useNavigate();
  const { stream, error: cameraError, startCamera, stopCamera, captureImage, switchCamera } = useCamera();
  const { compressImage } = useCompression();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // ... existing camera logic ...

  const handleConfirm = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setProcessingError(null);
    setProgress('Đang nén ảnh...');

    try {
      // Compress image
      const compressedBlob = await compressImage(capturedImage);
      setProgress('Đang xử lý OCR...');

      // Process OCR
      const ocrResult = await processOCR(compressedBlob);
      setProgress('Đang lưu kết quả...');

      // Save to IndexedDB
      const scanId = await createScan({
        imageDataUrl: capturedImage,
        ocrStructured: ocrResult.structured,
        tokenUsage: ocrResult.tokenUsage,
      });

      setProgress('Hoàn tất!');

      // Navigate to result page
      navigate(`/ocr-result/${scanId}`);
    } catch (error) {
      console.error('[Camera] OCR processing failed:', error);
      
      let errorMessage = 'Không thể xử lý ảnh. Vui lòng thử lại.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Xử lý quá lâu. Vui lòng thử lại với ảnh rõ hơn.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API đã đạt giới hạn. Vui lòng thử lại sau.';
        }
      }
      
      setProcessingError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleRetry = () => {
    setProcessingError(null);
    setCapturedImage(null);
    startCamera();
  };

  // ... existing render logic ...

  return (
    <Layout title="Chụp ảnh" showBottomNav={false}>
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-8">
          <Spinner size="lg" className="mb-4" />
          <p className="text-white text-lg font-medium mb-2">Đang xử lý...</p>
          {progress && (
            <p className="text-white/80 text-sm">{progress}</p>
          )}
        </div>
      )}

      {/* Error State */}
      {processingError && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <ErrorMessage
            title="Xử lý thất bại"
            message={processingError}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* ... existing camera UI ... */}
    </Layout>
  );
}
```

### Updated History Page with Loading States

**src/pages/HistoryPage.tsx** (add skeleton loaders):
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { useSearchScans } from '@/hooks/useScans';
import { Search, Calendar } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const allScans = useScans({ limit: 100, order: 'desc' });
  const searchResults = useSearchScans(debouncedQuery);
  
  const scans = debouncedQuery ? searchResults : allScans;
  const isLoading = scans === undefined;

  // ... existing logic ...

  return (
    <Layout title="Lịch sử">
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, nội dung..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            // Loading state
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : scans && scans.length > 0 ? (
            // ... existing scan cards ...
            scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => handleScanClick(scan.id!)}
                className="w-full bg-white rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors text-left"
              >
                {/* ... existing card content ... */}
              </button>
            ))
          ) : (
            // ... existing empty states ...
            <div>Empty state</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
```

### Wrap App with Error Boundary

**src/App.tsx** (add ErrorBoundary):
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import CameraPage from './pages/CameraPage';
// ... other imports ...

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ... existing routes ... */}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

### Validation

1. **Loading states**: Show during async operations
2. **Error messages**: User-friendly Vietnamese text
3. **Retry actions**: Allow user to retry failed operations
4. **Error boundary**: Catch unexpected errors
5. **Progress indicator**: Show during OCR processing

### Error Handling

- **Network errors**: "Không có kết nối mạng"
- **Timeout errors**: "Xử lý quá lâu"
- **API quota errors**: "API đã đạt giới hạn"
- **Unexpected errors**: Error boundary fallback UI

---

## ACCEPTANCE CRITERIA

### AC-001: OCR Processing - Loading State
- **Given**: User confirms captured image
- **When**: OCR processing starts
- **Then**:
  - Full-screen overlay displays
  - Black background with 80% opacity
  - Large spinner (lg size)
  - Text: "Đang xử lý..."
  - Progress text updates: "Đang nén ảnh..." → "Đang xử lý OCR..." → "Đang lưu kết quả..." → "Hoàn tất!"

### AC-002: OCR Processing - Network Error
- **Given**: Network is offline
- **When**: OCR processing fails
- **Then**:
  - Error message displays
  - Title: "Xử lý thất bại"
  - Message: "Không có kết nối mạng. Vui lòng kiểm tra và thử lại."
  - Retry button shows
  - Retry button text: "Thử lại"

### AC-003: OCR Processing - Timeout Error
- **Given**: OCR takes too long (>30s)
- **When**: Timeout occurs
- **Then**:
  - Error message displays
  - Title: "Xử lý thất bại"
  - Message: "Xử lý quá lâu. Vui lòng thử lại với ảnh rõ hơn."
  - Retry button shows

### AC-004: OCR Processing - Retry
- **Given**: OCR processing failed
- **When**: User taps "Thử lại" button
- **Then**:
  - Error message clears
  - Captured image clears
  - Camera restarts
  - User can capture new image

### AC-005: History Page - Loading State
- **Given**: User navigates to history page
- **When**: Scans are loading from IndexedDB
- **Then**:
  - 5 skeleton cards display
  - Each skeleton has: thumbnail placeholder, title placeholder, text placeholder
  - Skeleton cards animate (pulse effect)

### AC-006: History Page - Loaded State
- **Given**: Scans finish loading
- **When**: Data is available
- **Then**:
  - Skeleton cards disappear
  - Real scan cards display
  - No loading indicators

### AC-007: Error Boundary - Unexpected Error
- **Given**: Unexpected JavaScript error occurs
- **When**: Error is thrown
- **Then**:
  - Error boundary catches error
  - Fallback UI displays
  - Title: "Đã xảy ra lỗi"
  - Message: "Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại."
  - "Về trang chủ" button shows
  - Error details collapsible section shows

### AC-008: Error Boundary - Reset
- **Given**: Error boundary is showing
- **When**: User taps "Về trang chủ" button
- **Then**:
  - Navigates to home page (/)
  - Error state clears
  - App resets

### AC-009: Spinner Component
- **Given**: Spinner is rendered
- **When**: Size prop is "lg"
- **Then**:
  - Spinner is 12x12 (48px)
  - Border width is 4px
  - Primary color border
  - Transparent top border
  - Rotates continuously

### AC-010: Error Message Component
- **Given**: ErrorMessage is rendered with retry
- **When**: Component displays
- **Then**:
  - AlertCircle icon in red circle
  - Title in bold
  - Message in gray
  - Retry button with RefreshCw icon
  - Retry button is primary blue

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement progress bar — text indicator only
- ❌ Add cancel button during processing — let it complete
- ❌ Implement offline mode — require network
- ❌ Add error logging service — console.error only
- ❌ Implement custom error codes — use error messages
- ❌ Add analytics tracking — out of scope

### REUSE:
- ✅ Existing retry logic in gemini.ts
- ✅ Lucide React icons
- ✅ Tailwind utility classes
- ✅ React error boundary pattern

### SKIP (out of scope for TIP-017):
- ⏭️ Progress bar
- ⏭️ Cancel button
- ⏭️ Offline mode
- ⏭️ Error logging service
- ⏭️ Custom error codes
- ⏭️ Analytics tracking

---

## COMPLETION CHECKLIST

- [ ] `src/components/ui/Spinner.tsx` created
- [ ] `src/components/ui/SkeletonCard.tsx` created
- [ ] `src/components/ui/ErrorMessage.tsx` created
- [ ] `src/components/ErrorBoundary.tsx` created
- [ ] `src/pages/CameraPage.tsx` updated with loading states
- [ ] `src/pages/HistoryPage.tsx` updated with skeleton loaders
- [ ] `src/App.tsx` wrapped with ErrorBoundary
- [ ] OCR processing shows loading overlay
- [ ] Progress text updates during processing
- [ ] Network errors show user-friendly message
- [ ] Timeout errors show user-friendly message
- [ ] Retry button works
- [ ] History page shows skeleton loaders
- [ ] Error boundary catches unexpected errors
- [ ] Error boundary reset works
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-017 | Generated: 2026-05-05 | Vibecode Kit v5.0*
