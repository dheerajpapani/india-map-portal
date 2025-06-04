// src/components/MapView.jsx
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const MapView = forwardRef(({ baseStyle, onMapLoad }, ref) => {
  const container = useRef();
  const mapInstance = useRef(null);

  useImperativeHandle(ref, () => mapInstance.current, []);

  useEffect(() => {
    if (!container.current) return;

    const map = new maplibregl.Map({
      container: container.current,
      style: baseStyle,
      center: [79, 22],
      zoom: 5,
    });

    map.on('load', async () => {
      console.log('✅ Map loaded');

      try {
        const response = await fetch('./india_border.geojson');
        if (!response.ok) throw new Error('Failed to fetch india_border.geojson');
        const borderLineData = await response.json();

        if (map.getSource('india-border')) {
          map.getSource('india-border').setData(borderLineData);
        } else {
          map.addSource('india-border', {
            type: 'geojson',
            data: borderLineData,
          });

          map.addLayer({
            id: 'india-border-line',
            type: 'line',
            source: 'india-border',
            paint: {
              'line-color': '#000000',
              'line-width': 1,
              'line-opacity': 0.5,
            },
          });
        }

        console.log('✅ Border line added');
      } catch (err) {
        console.error('❌ Failed to load india_border.geojson:', err);
      }

      mapInstance.current = map;

      if (typeof onMapLoad === 'function') onMapLoad(map);
    });

    return () => {
      if (map) {
        map.remove();
        mapInstance.current = null;
      }
    };
  }, [baseStyle, onMapLoad]);

  return (
    <div
      ref={container}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
});

export default MapView;
