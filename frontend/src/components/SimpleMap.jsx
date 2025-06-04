// src/components/SimpleMap.jsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function SimpleMap() {
  const container = useRef();

  useEffect(() => {
    const map = new maplibregl.Map({
      container: container.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=',
      center: [79, 22],
      zoom: 5,
    });

    map.on('load', () => {
      console.log('✅ SimpleMap loaded');
    });

    return () => map.remove();
  }, []);

  return (
    <div 
      ref={container} 
      style={{ width: '100%', height: '600px', border: '1px solid #ccc' }} 
    />
  );
}
