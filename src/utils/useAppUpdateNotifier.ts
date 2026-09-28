import { useState, useEffect, useCallback } from 'react';
import {
  RemoteReleaseInfo,
  ElectronUpdaterStatus,
  checkLatestRelease,
  isDesktopApp,
  triggerDesktopUpdateCheck
} from './appVersionManager';

export function useAppUpdateNotifier() {
  const [remoteRelease, setRemoteRelease] = useState<RemoteReleaseInfo | null>(null);
  const [electronStatus, setElectronStatus] = useState<ElectronUpdaterStatus>({ status: 'idle' });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 1. Check for remote release via GitHub API
  const performCheck = useCallback(async (isManual = false) => {
    setIsChecking(true);
    try {
      if (isDesktopApp()) {
        await triggerDesktopUpdateCheck();
      }

      const release = await checkLatestRelease();
      if (release) {
        setRemoteRelease(release);
        if (release.hasUpdate && isManual) {
          setIsUpdateModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('[useAppUpdateNotifier] Error checking updates:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // 2. Electron IPC Listener for Realtime Auto-updater status
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      const unsubs: (() => void)[] = [];

      if (api.onUpdaterStatus) {
        const unsub = api.onUpdaterStatus((statusData: ElectronUpdaterStatus) => {
          console.log('[useAppUpdateNotifier] Received Electron updater status:', statusData);
          setElectronStatus(statusData);

          if (statusData.status === 'available' || statusData.status === 'downloaded') {
            checkLatestRelease().then(rel => {
              if (rel) setRemoteRelease(rel);
            });
          }
        });
        if (typeof unsub === 'function') unsubs.push(unsub);
      }

      if (api.onTriggerCheckUpdates) {
        const unsub = api.onTriggerCheckUpdates(() => {
          console.log('[useAppUpdateNotifier] Triggered check from Electron menu');
          performCheck(true);
        });
        if (typeof unsub === 'function') unsubs.push(unsub);
      }

      if (api.onOpenUpdateModal) {
        const unsub = api.onOpenUpdateModal(() => {
          console.log('[useAppUpdateNotifier] Opened update modal from notification click');
          setIsUpdateModalOpen(true);
        });
        if (typeof unsub === 'function') unsubs.push(unsub);
      }

      return () => {
        unsubs.forEach(fn => fn());
      };
    }
  }, [performCheck]);

  // 3. Initial check on mount + 30 minute interval
  useEffect(() => {
    const timer = setTimeout(() => {
      performCheck(false);
    }, 4000);

    const interval = setInterval(() => {
      performCheck(false);
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [performCheck]);

  const hasUpdate = Boolean(
    remoteRelease?.hasUpdate ||
    electronStatus.status === 'available' ||
    electronStatus.status === 'downloaded' ||
    electronStatus.status === 'downloading'
  );

  return {
    remoteRelease,
    electronStatus,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    isChecking,
    hasUpdate,
    checkForUpdates: () => performCheck(true),
  };
}
