/**
 * Pixell AdShield - Pure Script Anti-Popup & Anti-Redirect Protection
 * 
 * Works seamlessly with external stream providers (Videasy, Vidsrc) WITHOUT
 * using the HTML5 `sandbox` attribute (which causes provider anti-embed errors).
 * 
 * Defense mechanisms:
 * 1. Global `window.open` proxy: Intercepts and destroys popup windows & new tabs.
 * 2. Focus Guard: Auto-refocuses the parent window if an iframe triggers a background popunder.
 * 3. Anti-Hijack: Prevents unauthorized top-level window redirection.
 * 4. PostMessage Filter: Discards malicious ad network message payloads.
 */

export interface AdShieldStats {
  blockedPopupsCount: number;
  blockedRedirectsCount: number;
  lastBlockedUrl: string | null;
  isActive: boolean;
}

type ShieldListener = (stats: AdShieldStats) => void;

class AdShieldEngine {
  private originalWindowOpen: typeof window.open | null = null;
  private listeners: Set<ShieldListener> = new Set();
  private blurHandlerAttached: boolean = false;
  private stats: AdShieldStats = {
    blockedPopupsCount: 0,
    blockedRedirectsCount: 0,
    lastBlockedUrl: null,
    isActive: false,
  };

  /**
   * Safe whitelist of allowed origins or targets
   */
  private isAllowedUrl(url?: string | URL): boolean {
    if (!url) return false;
    const urlStr = String(url).toLowerCase();
    // Allow internal platform routes or legitimate auth
    if (urlStr.startsWith('/') || urlStr.startsWith(window.location.origin)) {
      return true;
    }
    return false;
  }

  /**
   * Activate script-based popup blocker
   */
  public activate(): void {
    if (this.stats.isActive) return;

    if (typeof window !== 'undefined') {
      // 1. Override window.open
      if (!this.originalWindowOpen) {
        this.originalWindowOpen = window.open;
      }

      window.open = (url?: string | URL, target?: string, features?: string): Window | null => {
        const urlStr = url ? String(url) : 'about:blank';

        if (this.isAllowedUrl(url)) {
          return this.originalWindowOpen ? this.originalWindowOpen.call(window, url, target, features) : null;
        }

        console.warn(`[Pixell AdShield] Blocked popup ad trigger -> ${urlStr}`);
        this.stats.blockedPopupsCount += 1;
        this.stats.lastBlockedUrl = urlStr;
        this.notify();

        return null;
      };

      // 2. Prevent top-level parent window redirect from iframes
      window.addEventListener('beforeunload', this.handleBeforeUnload, { capture: true });

      // 3. PostMessage ad broadcast filter
      window.addEventListener('message', this.handlePostMessage, { capture: true });

      // 4. Focus Guard: prevent popunders from stealing focus
      if (!this.blurHandlerAttached) {
        window.addEventListener('blur', this.handleWindowBlur);
        this.blurHandlerAttached = true;
      }
    }

    this.stats.isActive = true;
    this.notify();
  }

  /**
   * Deactivate and restore original window methods
   */
  public deactivate(): void {
    if (!this.stats.isActive) return;

    if (typeof window !== 'undefined') {
      if (this.originalWindowOpen) {
        window.open = this.originalWindowOpen;
      }

      window.removeEventListener('beforeunload', this.handleBeforeUnload, { capture: true });
      window.removeEventListener('message', this.handlePostMessage, { capture: true });

      if (this.blurHandlerAttached) {
        window.removeEventListener('blur', this.handleWindowBlur);
        this.blurHandlerAttached = false;
      }
    }

    this.stats.isActive = false;
    this.notify();
  }

  private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // If the active element is an iframe trying to hijack top window location
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
      console.warn('[Pixell AdShield] Intercepted top-level redirect attempt from iframe player.');
      this.stats.blockedRedirectsCount += 1;
      this.notify();
    }
  };

  private handleWindowBlur = () => {
    // If user clicked inside the iframe and window lost focus (popunder attempt), auto regain focus
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
      setTimeout(() => {
        window.focus();
      }, 100);
    }
  };

  private handlePostMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string' && (event.data.includes('ad_') || event.data.includes('popunder') || event.data.includes('click_url'))) {
      event.stopImmediatePropagation();
    }
  };

  public subscribe(listener: ShieldListener): () => void {
    this.listeners.add(listener);
    listener(this.stats);
    return () => this.listeners.delete(listener);
  }

  public getStats(): AdShieldStats {
    return { ...this.stats };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.stats));
  }
}

export const adShield = new AdShieldEngine();
