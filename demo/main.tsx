import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const DemoApp: React.FC = () => {
  useEffect(() => {
    // Dynamically import and register the web component
    import('../src/web-component/c1x-workflow-builder').then(() => {
      // Web component is now registered
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '12px 20px',
        background: 'hsl(228, 12%, 10%)',
        borderBottom: '1px solid hsl(228, 10%, 18%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'hsl(220, 20%, 92%)', fontFamily: 'var(--font-display)' }}>
          CircuitFlow Canvas
        </h1>
        <span style={{ fontSize: 11, color: 'hsl(220, 10%, 50%)', fontFamily: 'var(--font-mono)' }}>
          Web Component Demo
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Use the web component directly */}
        <c1x-workflow-builder
          show-branding="true"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DemoApp />);
}
