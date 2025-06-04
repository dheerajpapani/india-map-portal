// src/components/LayerToggle.jsx
import React from 'react';

export default function LayerToggle({ onStyleChange, currentStyle }) {
  const styles = {
    button: (active) => ({
      fontSize: '1.2rem',
      width: '2.5rem',
      height: '2.5rem',
      margin: '0.2rem',
      borderRadius: '50%',
      border: active ? '2px solid #007AFF' : '1px solid #ccc',
      backgroundColor: active ? '#e6f0ff' : '#fff',
      cursor: active ? 'default' : 'pointer',
      opacity: active ? 1 : 0.75,
      transition: 'all 0.2s ease-in-out',
    }),
  };

  return (
    <div className="layer-toggle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onClick={() => onStyleChange('street')}
        disabled={currentStyle === 'street'}
        style={styles.button(currentStyle === 'street')}
        title="Street"
      >
        🗺
      </button>
      <button
        onClick={() => onStyleChange('hybrid')}
        disabled={currentStyle === 'hybrid'}
        style={styles.button(currentStyle === 'hybrid')}
        title="Hybrid"
      >
        🛰
      </button>
      <button
        onClick={() => onStyleChange('satellite')}
        disabled={currentStyle === 'satellite'}
        style={styles.button(currentStyle === 'satellite')}
        title="Satellite"
      >
        📷
      </button>
    </div>
  );
}
