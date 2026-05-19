export function createError(message: string, cause: unknown): Error {
  const err = new Error(message);
  Object.defineProperty(err, 'cause', { value: cause, configurable: true });
  return err;
}

/**
 * Extract a user-friendly error message from an unknown error thrown by apiClient calls.
 */
export function extractApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    // Check for network / abort failures
    if (cause instanceof TypeError || error.name === 'TypeError') {
      return 'Không có kết nối mạng';
    }
    if (error.name === 'AbortError' || (cause instanceof DOMException && cause.name === 'AbortError')) {
      return 'Không có kết nối mạng';
    }
    // Check for HTTP status coded via cause (e.g. Response object)
    if (cause instanceof Response) {
      switch (cause.status) {
        case 401: return 'Sai email hoặc mật khẩu';
        case 403: return 'Không có quyền truy cập';
        case 404: return 'Không tìm thấy';
        case 500: return 'Lỗi máy chủ nội bộ';
        default: break;
      }
    }
    // Try to read { message } from structured error body
    try {
      const body = (error as Error & { data?: { message?: string } }).data;
      if (body && typeof body.message === 'string') {
        return body.message;
      }
    } catch {
      // ignore
    }
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}
