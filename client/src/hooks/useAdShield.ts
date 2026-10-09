import { useState, useEffect } from 'react';
import { adShield, AdShieldStats } from '../utils/adShield';

export function useAdShield(enabled: boolean = true) {
  const [stats, setStats] = useState<AdShieldStats>(adShield.getStats());
  const [shieldActive, setShieldActive] = useState<boolean>(true);

  useEffect(() => {
    if (enabled && shieldActive) {
      adShield.activate();
    } else {
      adShield.deactivate();
    }

    const unsubscribe = adShield.subscribe((newStats) => {
      setStats(newStats);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, shieldActive]);

  const toggleShield = () => {
    setShieldActive((prev) => !prev);
  };

  return {
    stats,
    shieldActive,
    setShieldActive,
    toggleShield,
    isShieldActive: stats.isActive && shieldActive,
    blockedCount: stats.blockedPopupsCount + stats.blockedRedirectsCount,
  };
}
