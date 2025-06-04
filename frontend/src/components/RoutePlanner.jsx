// src/components/RoutePlanner.jsx

import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import Autosuggest from 'react-autosuggest';
import { FaTelegramPlane } from 'react-icons/fa';
import { geocode, getRoutes } from '../utils/routing';

export default function RoutePlanner({ map, onStartNavigation }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [routes, setRoutes] = useState([]);        // OSRM route objects
  const [routeNames, setRouteNames] = useState([]); // ["Fastest","Shortest","Scenic"]
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [popup, setPopup] = useState(null);

  // Refs for start/end markers:
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const isMapReady = !!map;

  // Cleanup all route layers + popup + markers
  const cleanup = () => {
    if (!map) return;
    routes.forEach((_, i) => {
      if (map.getLayer(`routeLine-${i}`)) map.removeLayer(`routeLine-${i}`);
      if (map.getSource(`route-${i}`)) map.removeSource(`route-${i}`);
    });
    if (popup) {
      popup.remove();
      setPopup(null);
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }
  };

  // Whenever routes or selected index changes → redraw map
  useEffect(() => {
    if (!map) return;
    cleanup();
    if (!routes.length) return;

    routes.forEach((route, i) => {
      const isSel = i === selectedRouteIndex;
      map.addSource(`route-${i}`, {
        type: 'geojson',
        data: route.geometry,
      });
      map.addLayer({
        id: `routeLine-${i}`,
        type: 'line',
        source: `route-${i}`,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': isSel ? '#007AFF' : '#A9A9A9',
          'line-width': isSel ? 6 : 4,
          'line-opacity': isSel ? 0.9 : 0.4,
        },
      });
    });

    if (selectedRouteIndex !== null) {
      const selRoute = routes[selectedRouteIndex];
      const coords = selRoute.geometry.coordinates;
      const midpoint = coords[Math.floor(coords.length / 2)];
      const startCoord = coords[0];
      const endCoord = coords[coords.length - 1];

      // Remove old popup
      if (popup) {
        popup.remove();
        setPopup(null);
      }

      // Place start pin (📍)
      // NEW “start pin + bold text” snippet
      const startEl = document.createElement('div');
      startEl.style.display = 'flex';
      startEl.style.flexDirection = 'column';
      startEl.style.alignItems = 'center';

      // bold black label (truncated at first comma)
      const startLabel = document.createElement('span');
      startLabel.style.fontWeight = 'bold';
      startLabel.style.color = 'black';
      startLabel.style.fontSize = '12px';
      startLabel.style.marginBottom = '2px';
      startLabel.innerText = from.split(',')[0]; 
      startEl.appendChild(startLabel);

      // then the 📍 emoji
      const startEmoji = document.createElement('div');
      startEmoji.style.fontSize = '24px';
      startEmoji.innerText = '📍';
      startEl.appendChild(startEmoji);

      startMarkerRef.current = new maplibregl.Marker({ element: startEl })
        .setLngLat(startCoord)
        .addTo(map);


      // Place end pin (🏁)
      // NEW “end pin + bold text” snippet
      const endEl = document.createElement('div');
      endEl.style.display = 'flex';
      endEl.style.flexDirection = 'column';
      endEl.style.alignItems = 'center';

      // bold black label (truncated at first comma)
      const endLabel = document.createElement('span');
      endLabel.style.fontWeight = 'bold';
      endLabel.style.color = 'black';
      endLabel.style.fontSize = '12px';
      endLabel.style.marginBottom = '2px';
      endLabel.innerText = to.split(',')[0];
      endEl.appendChild(endLabel);

      // then the 🏁 emoji
      const endEmoji = document.createElement('div');
      endEmoji.style.fontSize = '24px';
      endEmoji.innerText = '🏁';
      endEl.appendChild(endEmoji);

      endMarkerRef.current = new maplibregl.Marker({ element: endEl })
        .setLngLat(endCoord)
        .addTo(map);


      // Show combined route info at the midpoint
      const newPopup = new maplibregl.Popup({ offset: 15, closeOnClick: false })
        .setLngLat(midpoint)
        .setHTML(`
          <div style="font-size:14px; max-width:240px;">
            📏 <b>Distance:</b> ${(selRoute.distance / 1000).toFixed(2)} km<br/>
            ⏱ <b>Duration:</b> ${(selRoute.duration / 60).toFixed(1)} min<br/>
          </div>
        `)
        .addTo(map);

      setPopup(newPopup);

      // Fit map to show route
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60 });
    }

    const onClick = (e) => {
      for (let i = 0; i < routes.length; i++) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [`routeLine-${i}`],
        });
        if (features.length) {
          setSelectedRouteIndex(i);
          return;
        }
      }
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
      cleanup();
    };
  }, [map, routes, selectedRouteIndex]);

  // Autocomplete: fetch via Nominatim (limit=5), show full display_name
  const fetchSuggestions = async (value, setSuggestions) => {
    const q = value.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
      );
      const data = await res.json();
      // Use FULL display_name here (no splitting)
      const allNames = data.map((item) => item.display_name);
      setSuggestions(allNames);
    } catch {
      setSuggestions([]);
    }
  };

  // Swap "From" and "To"
  const swapPlaces = () => {
    setFrom(to);
    setTo(from);
    setRoutes([]);
    setSelectedRouteIndex(null);
    setError(null);
  };

  // Use current location for "From"
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          // Keep the full display_name in the input
          const name = data.display_name;
          setFrom(name);
        } catch {
          setFrom(`${latitude}, ${longitude}`);
        }
      },
      () => setError('Unable to access location')
    );
  };

  // Plan route: geocode → getRoutes() → assign custom route names
  const planRoute = async () => {
    setError(null);
    if (!from || !to) {
      setError('Enter both locations');
      return;
    }
    setLoading(true);
    try {
      const fromCoord = await geocode(from);
      const toCoord = await geocode(to);
      if (!fromCoord || !toCoord) {
        setError('Invalid locations');
        setLoading(false);
        return;
      }

      let newRoutes = await getRoutes(fromCoord, toCoord);
      if (!newRoutes || newRoutes.length === 0) {
        setError('No routes found');
        setLoading(false);
        return;
      }

      // Limit to 3
      newRoutes = newRoutes.slice(0, 3);

      // Compute “Fastest” (min duration), “Shortest” (min distance), and “Scenic” (any leftover)
      const fastestIdx = newRoutes.reduce(
        (best, r, i) => (r.duration < newRoutes[best].duration ? i : best),
        0
      );
      const shortestIdx = newRoutes.reduce(
        (best, r, i) => (r.distance < newRoutes[best].distance ? i : best),
        0
      );
      const names = new Array(newRoutes.length).fill('Scenic');
      names[fastestIdx] = 'Fastest';
      names[shortestIdx] = 'Shortest';
      setRouteNames(names);

      setRoutes(newRoutes);
      setSelectedRouteIndex(fastestIdx);
    } catch (err) {
      setError('Route error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // When “Start Navigation” is clicked
  const handleNavigate = () => {
    if (
      selectedRouteIndex === null ||
      !routes[selectedRouteIndex] ||
      !onStartNavigation
    )
      return;

    const coords = routes[selectedRouteIndex].geometry.coordinates;
    const last = coords[coords.length - 1];
    onStartNavigation({ lat: last[1], lng: last[0] });
  };

  const renderSuggestion = (suggestion) => <div>{suggestion}</div>;

  const renderRouteList = () => {
    if (!routes.length) return null;
    return (
      <div
        style={{
          marginTop: '1rem',
          maxHeight: 180,
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: 6,
          backgroundColor: '#fafafa',
          fontSize: '0.9rem',
        }}
      >
        {routes.map((route, i) => (
          <div
            key={i}
            onClick={() => setSelectedRouteIndex(i)}
            style={{
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              backgroundColor: i === selectedRouteIndex ? '#007AFF' : '#f0f0f0',
              color: i === selectedRouteIndex ? '#fff' : '#333',
              borderBottom: '1px solid #eee',
            }}
            title={`Distance: ${(route.distance / 1000).toFixed(
              2
            )} km, Duration: ${(route.duration / 60).toFixed(1)} min`}
          >
            <b>{routeNames[i]}</b>
          </div>
        ))}
      </div>
    );
  };

  const inputStyle = {
    padding: '0.65rem 0.75rem',
    width: '100%',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    outline: 'none',
  };

  const autosuggestTheme = {
    container: { position: 'relative', flex: 1 },
    input: { ...inputStyle },
    suggestionsContainer: {
      position: 'absolute',
      top: '100%',
      zIndex: 100,
      backgroundColor: '#f9f9f9',
      width: '100%',
      border: '1px solid #ccc',
      borderTop: 'none',
      borderRadius: '0 0 6px 6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxHeight: 300,
      overflowY: 'auto',
    },
    suggestion: {
      padding: '10px 12px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
    },
    suggestionHighlighted: {
      backgroundColor: '#f0f0f0',
    },
  };

  return (
    <div style={{ maxWidth: 360, fontFamily: 'sans-serif' }}>
      {/* “From” input + Swap + “Use current location” */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <Autosuggest
          suggestions={fromSuggestions}
          onSuggestionsFetchRequested={({ value }) =>
            fetchSuggestions(value, setFromSuggestions)
          }
          onSuggestionsClearRequested={() => setFromSuggestions([])}
          getSuggestionValue={(s) => s}
          renderSuggestion={renderSuggestion}
          theme={autosuggestTheme}
          inputProps={{
            placeholder: 'From',
            value: from,
            onChange: (_, { newValue }) => setFrom(newValue),
            disabled: !isMapReady || loading,
          }}
        />
        <button
          onClick={swapPlaces}
          title="Swap From/To"
          style={{
            padding: '0.6rem',
            fontSize: '1.2rem',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading}
        >
          ⇄
        </button>
        <button
          onClick={useCurrentLocation}
          title="Use current location"
          style={{
            padding: '0.6rem',
            fontSize: '1.2rem',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading || !isMapReady}
        >
          📍
        </button>
      </div>

      {/* “To” input + Navigate button */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <Autosuggest
          suggestions={toSuggestions}
          onSuggestionsFetchRequested={({ value }) =>
            fetchSuggestions(value, setToSuggestions)
          }
          onSuggestionsClearRequested={() => setToSuggestions([])}
          getSuggestionValue={(s) => s}
          renderSuggestion={renderSuggestion}
          theme={autosuggestTheme}
          inputProps={{
            placeholder: 'To',
            value: to,
            onChange: (_, { newValue }) => setTo(newValue),
            disabled: !isMapReady || loading,
          }}
        />
        <button
          onClick={handleNavigate}
          disabled={selectedRouteIndex === null}
          title="Start Navigation"
          style={{
            padding: '0.6rem',
            fontSize: '1.2rem',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor:
              selectedRouteIndex === null ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FaTelegramPlane />
        </button>
      </div>

      {/* Plan Route button */}
      <button
        onClick={planRoute}
        disabled={!isMapReady || loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#007AFF',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Planning...' : 'Plan Route'}
      </button>

      {/* Error message */}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>
      )}

      {/* Route list with custom names */}
      {renderRouteList()}
    </div>
  );
}
