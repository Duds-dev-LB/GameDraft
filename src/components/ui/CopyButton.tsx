import { useState, FC } from 'react';
import { Button } from './Button';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton: FC<CopyButtonProps> = ({ text, label, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? 'Copiado!' : label || 'Copiar'}
    </Button>
  );
};
