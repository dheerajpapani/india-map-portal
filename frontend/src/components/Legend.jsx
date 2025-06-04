// src/components/Legend.jsx
import React from 'react';

const Legend = ({ items }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 0 5px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <h4>Legend</h4>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: item.color,
            marginRight: '8px',
            border: '1px solid #333'
          }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
