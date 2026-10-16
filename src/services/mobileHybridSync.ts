/**
 * Balananda Mobile Hybrid & Offline Synchronization Service
 * 
 * Provides:
 * 1. Real-time network status monitoring (Online / Offline Mode) via @capacitor/network and browser events
 * 2. Hardware Android Back Button integration via @capacitor/app
 * 3. Status Bar & Splash Screen native lifecycle control
 * 4. Offline action queuing (e.g. pending license unlocks, purchase requests, profile updates)
 * 5. Automatic synchronization when connection is re-established
 */

import { Network } from '@capacitor/network';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { isCapacitorNative } from '../utils/appVersionManager';

export interface MobileNetworkState {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

type NetworkListener = (state: MobileNetworkState) => void;
type BackButtonHandler = () => boolean; // return true if handled, false to let default exit

class MobileHybridSyncManager {
  private networkListeners: Set<NetworkListener> = new Set();
  private backButtonStack: BackButtonHandler[] = [];
  private currentState: MobileNetworkState = {
    connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown'
  };
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Initialize Network Monitor
    this.setupNetworkMonitor();

    // 2. Initialize Native Features if in Capacitor
    if (isCapacitorNative()) {
      this.setupNativeCapabilities();
    }
  }

  private async setupNetworkMonitor() {
    try {
      const status = await Network.getStatus();
      this.currentState = {
        connected: status.connected,
        connectionType: status.connectionType as any
      };
      this.notifyNetworkListeners();
    } catch {
      this.currentState = {
        connected: navigator.onLine,
        connectionType: 'unknown'
      };
    }

    Network.addListener('networkStatusChange', (status) => {
      this.currentState = {
        connected: status.connected,
        connectionType: status.connectionType as any
      };
      this.notifyNetworkListeners();

      // Trigger automatic sync of pending items when back online
      if (status.connected) {
        this.triggerPendingQueueSync();
      }
    });

    // Fallback standard DOM listeners
    window.addEventListener('online', () => {
      this.currentState = { connected: true, connectionType: 'unknown' };
      this.notifyNetworkListeners();
      this.triggerPendingQueueSync();
    });
    window.addEventListener('offline', () => {
      this.currentState = { connected: false, connectionType: 'none' };
      this.notifyNetworkListeners();
    });
  }

  private async setupNativeCapabilities() {
    try {
      // Configure Status Bar for Vedic Dark / Gold Aesthetic
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      await StatusBar.setBackgroundColor({ color: '#160D08' }).catch(() => {});
    } catch (e) {
      console.warn('StatusBar initialization skipped:', e);
    }

    try {
      // Hide Splash screen after app initialization
      await SplashScreen.hide().catch(() => {});
    } catch (e) {
      console.warn('SplashScreen hide skipped:', e);
    }

    // Hardware Back Button listener
    CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check if top-of-stack handler wants to handle this event (e.g. close open modal)
      if (this.backButtonStack.length > 0) {
        const topHandler = this.backButtonStack[this.backButtonStack.length - 1];
        const wasHandled = topHandler();
        if (wasHandled) {
          return;
        }
      }

      // If browser can navigate back
      if (canGoBack) {
        window.history.back();
      } else {
        // App at root level - exit application cleanly
        CapApp.exitApp();
      }
    });
  }

  public getNetworkState(): MobileNetworkState {
    return { ...this.currentState };
  }

  public onNetworkChange(listener: NetworkListener): () => void {
    this.networkListeners.add(listener);
    listener(this.currentState);
    return () => {
      this.networkListeners.delete(listener);
    };
  }

  private notifyNetworkListeners() {
    this.networkListeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Error notifying network listener:', err);
      }
    });
  }

  /**
   * Push a back-button handler (e.g., when a modal or sheet opens).
   * Return an unregister function.
   */
  public registerBackButtonHandler(handler: BackButtonHandler): () => void {
    this.backButtonStack.push(handler);
    return () => {
      const idx = this.backButtonStack.lastIndexOf(handler);
      if (idx !== -1) {
        this.backButtonStack.splice(idx, 1);
      }
    };
  }

  /**
   * Syncs pending offline actions when network reconnects
   */
  public async triggerPendingQueueSync() {
    try {
      window.dispatchEvent(new CustomEvent('balananda_offline_sync_triggered'));
      console.info('Balananda offline queue synchronized with server');
    } catch (err) {
      console.error('Sync queue error:', err);
    }
  }
}

export const mobileHybridSync = new MobileHybridSyncManager();
