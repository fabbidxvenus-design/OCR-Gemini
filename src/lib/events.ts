// Shared custom events for cross-component communication

export const BACKGROUND_SAVE_EVENT = 'hlvn:background-save-done';

export interface BackgroundSaveDoneEventDetail {
  localScanId: string;
  success: boolean;
}

export function notifyBackgroundSaveDone(localScanId: string, success: boolean) {
  window.dispatchEvent(new CustomEvent<BackgroundSaveDoneEventDetail>(BACKGROUND_SAVE_EVENT, {
    detail: { localScanId, success },
  }));
}