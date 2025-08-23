import { Button, MessageStrip } from '@ui5/webcomponents-react';
import { useEffect, useState } from 'react';

// Constants for skeleton items
const SKELETON_ITEMS = [1, 2, 3];

export const ChartSkeleton: React.FC = () => (
  <div
    style={{
      borderRadius: 8,
      padding: 16,
      background: '#fff',
      width: '100%',
      height: 500,
      marginBottom: 16,
      marginTop: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <div
      style={{
        flex: 1,
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite',
        borderRadius: 4,
      }}
    />
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      {SKELETON_ITEMS.map((item) => (
        <div
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#f0f0f0',
            }}
          />
          <div
            style={{
              width: 60,
              height: 12,
              background: '#f0f0f0',
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

export interface ChartErrorProps {
  onRetry?: () => void;
  error?: string;
  closable?: boolean;
}

export const ChartError: React.FC<ChartErrorProps> = ({
  onRetry,
  error,
  closable = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Show again when a new error message arrives
  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  if (!isOpen) return null;

  return (
    <MessageStrip
      design="Critical"
      hideCloseButton={!closable}
      onClose={() => setIsOpen(false)}
      style={{
        width: '100%',
        marginTop: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1 }}>{error}</span>
        {onRetry && (
          <Button
            design="Emphasized"
            onClick={onRetry}
            style={{ marginLeft: 'auto' }}
          >
            Retry
          </Button>
        )}
      </div>
    </MessageStrip>
  );
};
