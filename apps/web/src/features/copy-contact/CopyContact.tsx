import { cancel, schedule } from '#web/shared/lib/timer-kit';
import { useEffect, useId, useState } from 'react';

type CopyContactProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyContact({ value, label = 'Email', className }: CopyContactProps) {
  const [copied, setCopied] = useState(false);
  const resetId = `copy-contact-reset-${useId()}`;

  useEffect(() => {
    return () => {
      cancel(resetId);
    };
  }, [resetId]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      schedule({
        id: resetId,
        ms: 1600,
        onFire: () => {
          setCopied(false);
        },
      });
    } catch {
      cancel(resetId);
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void onCopy();
      }}
      aria-label={copied ? 'Скопировано' : `Скопировать ${label}`}
    >
      {copied ? 'Скопировано' : label}
    </button>
  );
}
