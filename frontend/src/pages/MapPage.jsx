// src/pages/MapPage.jsx
import React, { useState } from 'react';
import LayerToggle from '../components/LayerToggle';
import RoutePlanner from '../components/RoutePlanner';
import Navigation from '../components/Navigation';
import MapView from '../components/MapView';
import { STREET, HYBRID, SATELLITE } from '../utils/mapStyles';

export default function MapPage() {
  const [styleKey, setStyleKey] = useState('street');
  const [map, setMap] = useState(null);
  const [destination, setDestination] = useState(null);
  const [navigating, setNavigating] = useState(false);

  const stopNavigation = () => {
    setNavigating(false);
    setDestination(null);
  };

  const handleStartNavigation = ({ lat, lng }) => {
    setDestination({ lat, lng });
    setNavigating(true);
  };

  const styleUrl =
    styleKey === 'street'
      ? STREET
      : styleKey === 'hybrid'
      ? HYBRID
      : SATELLITE;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <MapView baseStyle={styleUrl} onMapLoad={setMap} />

        {!navigating && map && (
          <div
            style={{
              position: 'absolute',
              top: '68px',
              left: '10px',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              width: '350px',
            }}
          >
            <RoutePlanner map={map} onStartNavigation={handleStartNavigation} />
          </div>
        )}

        {navigating && map && destination && (
          <Navigation
            map={map}
            destination={destination}
            onStopNavigation={stopNavigation}
          />
        )}

        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '10px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '8px',
            padding: '6px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          <LayerToggle currentStyle={styleKey} onStyleChange={setStyleKey} />
        </div>
      </div>
    </div>
  );
}
