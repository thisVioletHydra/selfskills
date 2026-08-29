import { useEffect, useRef, useState } from 'react';
import { subscribeRequestGate } from '#web/shared/api/request-gate';

import '#web/shared/ui/rate-limit-toast.css';

const TOAST_MS = 2800;

export function RateLimitToast() {
  const [open, setOpen] = useState(false);
  const hideTimer = useRef(0);

  useEffect(() => {
    return subscribeRequestGate(() => {
      window.clearTimeout(hideTimer.current);
      setOpen(true);
      hideTimer.current = window.setTimeout(() => {
        setOpen(false);
      }, TOAST_MS);
    });
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="rate-limit-toast" role="status" aria-live="polite">
      rate limit
    </div>
  );
}
