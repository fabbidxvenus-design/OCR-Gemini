import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import OCRResultPage from '@/pages/OCRResultPage';
import EditPage from '@/pages/EditPage';
import HistoryPage from '@/pages/HistoryPage';
import HistoryDetailPage from '@/pages/HistoryDetailPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import RootRedirect from '@/components/layout/RootRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { CheckCircle2, Circle, Loader2, X } from 'lucide-react';
import { processOCR } from '@/lib/gemini';
import { compressImageForOCR } from '@/lib/compression';
import { createPendingScan, createScan } from '@/hooks/useScans';
import { useSettings } from '@/hooks/useSettings';

const BACKGROUND_SAVE_RETRY_DELAYS_MS = [0, 1000, 3000];

async function saveScanInBackground(scanData: Parameters<typeof createScan>[0], pendingScanId: string) {
  for (let attempt = 0; attempt < BACKGROUND_SAVE_RETRY_DELAYS_MS.length; attempt += 1) {
    const delayMs = BACKGROUND_SAVE_RETRY_DELAYS_MS[attempt] ?? 0;
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    try {
      await createScan(scanData);
      return;
    } catch {
      if (attempt === BACKGROUND_SAVE_RETRY_DELAYS_MS.length - 1) {
        sessionStorage.setItem(`hlvn.pendingScanSaveFailed.${pendingScanId}`, '1');
        window.dispatchEvent(new CustomEvent('hlvn:scan-save-failed', { detail: { scanId: pendingScanId } }));
      }
    }
  }
}

function CameraPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    dataUrl: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (blob: Blob, dataUrl: string) => {
    setCapturedImage({ blob, dataUrl });
    setError(null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setProgress('');
    setError(null);
  };

  const handleRetry = () => {
    if (capturedImage) {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Optimize compression for speed
      const compressedBlob = await compressImageForOCR(capturedImage.blob);
      setProgress('Đang xử lý OCR...');

      // Process OCR with user's selected model tier
      const ocrResult = await processOCR(compressedBlob, settings.selectedModelTier);
      setProgress('Hoàn tất!');

      const scanData = {
        timestamp: new Date(),
        imageDataUrl: '',
        ocrRaw: ocrResult.ocrRaw,
        ocrStructured: ocrResult.structured,
        edited: false,
        tokenUsage: ocrResult.tokenUsage,
        apiKeyIndex: ocrResult.apiKeyIndex,
        modelTier: ocrResult.modelTier,
      };
      const pendingScanId = createPendingScan(scanData);
      navigate(`/ocr-result/${pendingScanId}`);

      void saveScanInBackground(scanData, pendingScanId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Layout title="Chụp ảnh" showBottomNav={!capturedImage || isProcessing}>
      <div className="h-[calc(100vh-8rem)]">
        {isProcessing ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-surface px-6 py-8">
            <div className="w-full max-w-[340px]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-card">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <h2 className="font-display text-heading-lg text-text-primary">Đang xử lý</h2>
                <p className="mt-2 text-body-sm text-text-secondary">Vui lòng chờ trong giây lát</p>
              </div>

              <div className="card-production mb-4 p-4" role="status" aria-live="polite">
                <div className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.12em] text-text-muted">
                  <span className="rounded-full bg-ai-light px-2 py-0.5 text-ai">Gemini Pro</span>
                  <span>~3s</span>
                </div>

                <ol className="space-y-3" aria-label="Tiến trình xử lý OCR">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
                    <span className="text-body text-text-primary">Tải ảnh lên</span>
                    <span className="sr-only">Hoàn thành</span>
                  </li>
                  <li className="flex items-center gap-3" aria-current={progress.includes('OCR') ? 'step' : undefined}>
                    {progress.includes('OCR') ? (
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-primary" aria-hidden="true" />
                    ) : progress.includes('lưu') || progress.includes('Hoàn tất') ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-text-muted" aria-hidden="true" />
                    )}
                    <span className={`text-body ${progress.includes('OCR') ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      Nhận dạng OCR
                    </span>
                    <span className="sr-only">{progress.includes('OCR') ? 'Đang xử lý' : progress.includes('Hoàn tất') ? 'Hoàn thành' : 'Chưa bắt đầu'}</span>
                  </li>
                  <li className="flex items-center gap-3" aria-current={progress.includes('lưu') ? 'step' : undefined}>
                    {progress.includes('lưu') ? (
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-primary" aria-hidden="true" />
                    ) : progress.includes('Hoàn tất') ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-text-muted" aria-hidden="true" />
                    )}
                    <span className={`text-body ${progress.includes('lưu') ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      Chuẩn hóa trường dữ liệu
                    </span>
                    <span className="sr-only">{progress.includes('lưu') ? 'Đang xử lý' : progress.includes('Hoàn tất') ? 'Hoàn thành' : 'Chưa bắt đầu'}</span>
                  </li>
                  <li className="flex items-center gap-3" aria-current={progress.includes('Hoàn tất') ? 'step' : undefined}>
                    {progress.includes('Hoàn tất') ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 text-text-muted" aria-hidden="true" />
                    )}
                    <span className={`text-body ${progress.includes('Hoàn tất') ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      Lưu kết quả
                    </span>
                    <span className="sr-only">{progress.includes('Hoàn tất') ? 'Hoàn thành' : 'Chưa bắt đầu'}</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={handleRetake}
                aria-label="Hủy và quay lại chụp ảnh"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-4 py-3 text-body font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              >
                <X className="h-5 w-5" />
                Hủy
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full bg-surface p-4">
            <ErrorMessage
              title="Xử lý thất bại"
              message={error}
              onRetry={handleRetry}
            />
            <button
              onClick={handleRetake}
              className="mt-4 px-4 py-2 text-primary font-medium hover:underline"
            >
              Chụp lại ảnh khác
            </button>
          </div>
        ) : capturedImage ? (
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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/home" element={<RootRedirect />} />

          {/* Protected routes */}
          <Route
            path="/camera"
            element={
              <ProtectedRoute>
                <CameraPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ocr-result/:scanId"
            element={
              <ProtectedRoute>
                <OCRResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:scanId"
            element={
              <ProtectedRoute>
                <EditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:scanId"
            element={
              <ProtectedRoute>
                <HistoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;