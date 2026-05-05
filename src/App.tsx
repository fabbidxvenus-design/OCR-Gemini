import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import OCRResultPage from '@/pages/OCRResultPage';
import EditPage from '@/pages/EditPage';
import HistoryPage from '@/pages/HistoryPage';
import HistoryDetailPage from '@/pages/HistoryDetailPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import RootRedirect from '@/components/layout/RootRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import CameraView from '@/components/camera/CameraView';
import ImagePreview from '@/components/camera/ImagePreview';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { processOCR } from '@/lib/gemini';
import { compressImageForOCR } from '@/lib/compression';
import { createScan } from '@/hooks/useScans';

function CameraPage() {
  const navigate = useNavigate();
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

      // Process OCR
      const ocrResult = await processOCR(compressedBlob);
      setProgress('Đang lưu kết quả...');

      // Create scan record
      const scanId = await createScan({
        timestamp: new Date(),
        imageDataUrl: capturedImage.dataUrl,
        ocrStructured: ocrResult.structured,
        edited: false,
        tokenUsage: ocrResult.tokenUsage,
      });

      setProgress('Hoàn tất!');

      // Navigate to result page
      setTimeout(() => {
        navigate(`/ocr-result/${scanId}`);
      }, 300);
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
          <div className="flex flex-col items-center justify-center h-full bg-white">
            <Spinner size="lg" className="mb-4" />
            <p className="text-lg font-medium text-gray-900">Đang xử lý...</p>
            <p className="text-neutral mt-2">{progress}</p>
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

          {/* Catch all - redirect to login */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;