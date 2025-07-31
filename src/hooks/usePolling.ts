import { useEffect, useRef, useState } from 'react';

interface UsePollingOptions<T> {
  queryFn: () => Promise<T>;
  interval: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function usePolling<T>({
  queryFn,
  interval,
  enabled = true,
  onSuccess,
  onError
}: UsePollingOptions<T>) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const poll = async () => {
    if (!enabled) return;
    
    setIsPolling(true);
    try {
      const data = await queryFn();
      setLastSyncTime(new Date());
      onSuccess?.(data);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);

  return {
    isPolling,
    lastSyncTime,
    poll
  };
}