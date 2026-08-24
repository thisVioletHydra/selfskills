import { useState } from "react";

type CopyContactProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyContact({ value, label = "Email", className }: CopyContactProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
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
      aria-label={copied ? "Скопировано" : `Скопировать ${label}`}
    >
      {copied ? "Скопировано" : label}
    </button>
  );
}
