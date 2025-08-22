import { Button, Icon, Title } from '@ui5/webcomponents-react';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel.js';

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
}

export const ChartError: React.FC<ChartErrorProps> = ({ onRetry, error }) => (
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
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      border: '1px solid #ccc',
    }}
  >
    <Icon
      name="error"
      style={{
        fontSize: 48,
        color: '#666',
      }}
    />
    <Title
      level={TitleLevel.H3}
      style={{
        color: '#333',
        margin: 0,
      }}
    >
      Error loading chart
    </Title>
    {error && (
      <p
        style={{
          color: '#666',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {error}
      </p>
    )}
    {onRetry && (
      <Button onClick={onRetry} design="Emphasized" style={{ marginTop: 8 }}>
        Retry
      </Button>
    )}
  </div>
);
