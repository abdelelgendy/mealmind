import { useState, useEffect } from 'react';

/**
 * Hook to detect network status and provide offline/online state
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Network: Online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Network: Offline');
    };

    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        setConnectionType(navigator.connection.effectiveType || 'unknown');
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange);
      setConnectionType(navigator.connection.effectiveType || 'unknown');
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, connectionType };
}
