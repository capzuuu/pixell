import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TVRemoteContextType {
  triggerRemoteKey: (key: string) => void;
}

const TVRemoteContext = createContext<TVRemoteContextType | undefined>(undefined);

// Web Audio API Synthesizer for subtle TV click feedback
function playSound(type: 'click' | 'select' | 'back') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'select') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'back') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {}
}

export const TVRemoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Spatial Navigation 2D Geometry Engine for Physical Remote D-Pad
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    playSound('click');
    document.body.classList.add('tv-mode');

    // Collect all eligible focusable TV elements
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex="0"]',
      '[data-tv-focus="true"]',
      '.tv-focus-item',
      '.netflix-card-container',
    ].join(', ');

    const allElements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const visibleElements = allElements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      );
    });

    if (visibleElements.length === 0) return;

    const currentEl = document.activeElement as HTMLElement | null;
    const isCurrentValid = currentEl && visibleElements.includes(currentEl);

    if (!isCurrentValid || !currentEl) {
      // Focus first element on page or in main content
      const firstEl = visibleElements[0];
      if (firstEl) {
        firstEl.focus();
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
      return;
    }

    const currRect = currentEl.getBoundingClientRect();
    const currCenter = {
      x: currRect.left + currRect.width / 2,
      y: currRect.top + currRect.height / 2,
    };

    let bestCandidate: HTMLElement | null = null;
    let minScore = Infinity;

    for (const el of visibleElements) {
      if (el === currentEl) continue;

      const rect = el.getBoundingClientRect();
      const targetCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const dx = targetCenter.x - currCenter.x;
      const dy = targetCenter.y - currCenter.y;

      let isEligible = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      switch (direction) {
        case 'right':
          if (dx > 4 && Math.abs(dy) < Math.abs(dx) * 2.2 + 80) {
            isEligible = true;
            primaryDist = dx;
            secondaryDist = Math.abs(dy);
          }
          break;
        case 'left':
          if (dx < -4 && Math.abs(dy) < Math.abs(dx) * 2.2 + 80) {
            isEligible = true;
            primaryDist = -dx;
            secondaryDist = Math.abs(dy);
          }
          break;
        case 'down':
          if (dy > 4 && Math.abs(dx) < Math.abs(dy) * 2.5 + 100) {
            isEligible = true;
            primaryDist = dy;
            secondaryDist = Math.abs(dx);
          }
          break;
        case 'up':
          if (dy < -4 && Math.abs(dx) < Math.abs(dy) * 2.5 + 100) {
            isEligible = true;
            primaryDist = -dy;
            secondaryDist = Math.abs(dx);
          }
          break;
      }

      if (isEligible) {
        const score = primaryDist + secondaryDist * 2.2;
        if (score < minScore) {
          minScore = score;
          bestCandidate = el;
        }
      }
    }

    if (bestCandidate) {
      bestCandidate.focus();
      bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      if (direction === 'down') window.scrollBy({ top: 320, behavior: 'smooth' });
      if (direction === 'up') window.scrollBy({ top: -320, behavior: 'smooth' });
    }
  }, []);

  // Trigger Action on OK / Enter
  const triggerSelect = useCallback(() => {
    playSound('select');
    const currentEl = document.activeElement as HTMLElement | null;
    if (currentEl && typeof currentEl.click === 'function') {
      currentEl.click();
    }
  }, []);

  // Trigger Back Action
  const triggerBack = useCallback(() => {
    playSound('back');
    // 1. If any modal or dropdown is open, dismiss it
    const modalCloseBtn = document.querySelector('[data-tv-close="true"], .modal-close-btn') as HTMLElement | null;
    if (modalCloseBtn) {
      modalCloseBtn.click();
      return;
    }

    // 2. If inside video player, return back
    if (location.pathname.startsWith('/watch')) {
      const backBtn = document.querySelector('[data-tv-player-back="true"]') as HTMLElement | null;
      if (backBtn) {
        backBtn.click();
      } else {
        navigate(-1);
      }
      return;
    }

    // 3. Otherwise go back in browser history or focus home
    if (location.pathname !== '/') {
      navigate(-1);
    } else {
      const homeLink = document.querySelector('nav a') as HTMLElement | null;
      if (homeLink) homeLink.focus();
    }
  }, [location.pathname, navigate]);

  // Unified Remote Key Trigger
  const triggerRemoteKey = useCallback((key: string) => {
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'up':
        moveFocus('up');
        break;
      case 'arrowdown':
      case 'down':
        moveFocus('down');
        break;
      case 'arrowleft':
      case 'left':
        moveFocus('left');
        break;
      case 'arrowright':
      case 'right':
        moveFocus('right');
        break;
      case 'enter':
      case 'ok':
      case 'select':
      case 'center':
        triggerSelect();
        break;
      case 'escape':
      case 'back':
      case 'backspace':
        triggerBack();
        break;
      case 'play':
      case 'pause':
      case 'playpause':
        const playBtn = document.querySelector('[data-tv-play="true"], video') as any;
        if (playBtn) {
          if (playBtn.paused !== undefined) {
            playBtn.paused ? playBtn.play() : playBtn.pause();
          } else {
            playBtn.click();
          }
        }
        break;
      default:
        break;
    }
  }, [moveFocus, triggerSelect, triggerBack]);

  // Global Keydown Listener for Physical Smart TV Remotes & Android TV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in a text input or search box
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea';

      // Always allow Back/Escape from input
      if (isInput && (e.key === 'Escape' || e.keyCode === 27)) {
        (e.target as HTMLElement).blur();
        return;
      }
      if (isInput && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
        return;
      }

      // Android TV / Smart TV D-Pad KeyCodes
      // 19: Up, 20: Down, 21: Left, 22: Right, 23: Center/OK, 4: Back, 179: Play/Pause
      const code = e.keyCode || e.which;

      if (e.key === 'ArrowUp' || code === 19 || code === 38) {
        e.preventDefault();
        triggerRemoteKey('up');
      } else if (e.key === 'ArrowDown' || code === 20 || code === 40) {
        e.preventDefault();
        triggerRemoteKey('down');
      } else if (e.key === 'ArrowLeft' || code === 21 || code === 37) {
        e.preventDefault();
        triggerRemoteKey('left');
      } else if (e.key === 'ArrowRight' || code === 22 || code === 39) {
        e.preventDefault();
        triggerRemoteKey('right');
      } else if (e.key === 'Enter' || code === 23 || code === 13) {
        e.preventDefault();
        triggerRemoteKey('ok');
      } else if (e.key === 'Escape' || e.key === 'Backspace' || code === 4 || code === 27 || code === 8) {
        if (!isInput) {
          e.preventDefault();
          triggerRemoteKey('back');
        }
      } else if (e.key === 'MediaPlayPause' || code === 179) {
        e.preventDefault();
        triggerRemoteKey('playpause');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerRemoteKey]);

  return (
    <TVRemoteContext.Provider value={{ triggerRemoteKey }}>
      {children}
    </TVRemoteContext.Provider>
  );
};

export const useTVRemote = () => {
  const context = useContext(TVRemoteContext);
  if (!context) {
    throw new Error('useTVRemote must be used within a TVRemoteProvider');
  }
  return context;
};
