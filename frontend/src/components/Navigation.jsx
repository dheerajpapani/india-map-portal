import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

function haversineDistance([lng1, lat1], [lng2, lat2]) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getBearing(from, to) {
  const [lon1, lat1] = from.map((deg) => (deg * Math.PI) / 180);
  const [lon2, lat2] = to.map((deg) => (deg * Math.PI) / 180);
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export default function Navigation({ map, destination, onStopNavigation }) {
  const [userLoc, setUserLoc] = useState(null);
  const [nextInstruction, setNextInstruction] = useState('');
  const [nextDistance, setNextDistance] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [autoCenter, setAutoCenter] = useState(true);
  const [lastSpokenStep, setLastSpokenStep] = useState(null);

  const watchIdRef = useRef(null);
  const userMarkerRef = useRef(null);
  const spokenRef = useRef('');
  const routeRef = useRef(null);
  const rerouteThreshold = 30;

  function updateUserMarker(loc, bearing = 0) {
    if (!map) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.style.fontSize = '28px';
      el.style.transformOrigin = 'center center';
      el.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
      el.style.userSelect = 'none';
      el.innerText = '🚘';

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(loc)
        .addTo(map);
    } else {
      const el = userMarkerRef.current.getElement();
      el.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
      userMarkerRef.current.setLngLat(loc);
    }
  }

  function cleanupRouteLayer() {
    if (!map) return;
    if (map.getLayer('navRouteLine')) map.removeLayer('navRouteLine');
    if (map.getSource('navRoute')) map.removeSource('navRoute');
  }

  async function fetchRoute(fromCoord, toCoord) {
    const coords = `${fromCoord[0]},${fromCoord[1]};${toCoord[0]},${toCoord[1]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch route');
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) throw new Error('No route found');
    return data.routes[0];
  }

  function drawRouteOnMap(geojson) {
    if (!map) return;

    if (map.getSource('navRoute')) {
      map.getSource('navRoute').setData({
        type: 'Feature',
        geometry: geojson,
      });
    } else {
      map.addSource('navRoute', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: geojson,
        },
      });
      map.addLayer({
        id: 'navRouteLine',
        type: 'line',
        source: 'navRoute',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#007AFF',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });
    }
  }

  function findClosestStepIndex(loc, steps) {
    let minDist = Infinity;
    let bestIdx = 0;
    steps.forEach((step, idx) => {
      const coords = step.geometry.coordinates;
      const mid = coords[Math.floor(coords.length / 2)];
      const d = haversineDistance(loc, mid);
      if (d < minDist) {
        minDist = d;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  function computeNextInstruction(loc, routeObj) {
    if (!routeObj) return;
    const steps = routeObj.legs[0].steps;
    if (!steps.length) return;

    const idx = findClosestStepIndex(loc, steps);
    const step = steps[idx];
    const instructionText = step.maneuver.instruction || 'Continue';
    setNextInstruction(instructionText);

    const distToManeuver = haversineDistance(loc, step.maneuver.location);
    setNextDistance(distToManeuver);

    if (
      distToManeuver <= 100 &&
      idx !== lastSpokenStep &&
      spokenRef.current !== instructionText
    ) {
      const utter = new SpeechSynthesisUtterance(instructionText);
      spokenRef.current = instructionText;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      setLastSpokenStep(idx);
    }
  }

  function computeRemainingAndETA(loc, routeObj) {
    if (!routeObj) return;
    const destCoord = [destination.lng, destination.lat];
    const remDist = haversineDistance(loc, destCoord);
    setRemainingDistance(remDist);
    const avgSpeed = routeObj.distance / routeObj.duration;
    if (avgSpeed > 0) {
      const etaSec = remDist / avgSpeed;
      setEtaMinutes((etaSec / 60).toFixed(1));
    } else setEtaMinutes(0);
  }

  useEffect(() => {
    if (!map || !destination || !navigator.geolocation) return;

    if (!map.isStyleLoaded()) {
      map.once('load', () => startWatch());
    } else {
      startWatch();
    }

    function startWatch() {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const newLoc = [coords.longitude, coords.latitude];
          const oldLoc = userLoc;
          setUserLoc(newLoc);

          const bearing = oldLoc ? getBearing(oldLoc, newLoc) : 0;
          updateUserMarker(newLoc, bearing);
          if (autoCenter) map.easeTo({ center: newLoc, zoom: 16 });

          if (!routeRef.current) {
            try {
              const newRoute = await fetchRoute(newLoc, [
                destination.lng,
                destination.lat,
              ]);
              routeRef.current = newRoute;
              cleanupRouteLayer();
              drawRouteOnMap(newRoute.geometry);
              computeNextInstruction(newLoc, newRoute);
              computeRemainingAndETA(newLoc, newRoute);
            } catch (err) {
              console.error(err);
            }
            return;
          }

          const closestPoint = routeRef.current.geometry.coordinates.reduce(
            (closest, coord) => {
              const dist = haversineDistance(newLoc, coord);
              return dist < closest.dist ? { coord, dist } : closest;
            },
            { coord: null, dist: Infinity }
          );

          if (closestPoint.dist > rerouteThreshold) {
            try {
              const reRoute = await fetchRoute(newLoc, [
                destination.lng,
                destination.lat,
              ]);
              routeRef.current = reRoute;
              cleanupRouteLayer();
              drawRouteOnMap(reRoute.geometry);
              computeNextInstruction(newLoc, reRoute);
              computeRemainingAndETA(newLoc, reRoute);
              window.speechSynthesis.cancel();
              spokenRef.current = '';
              setLastSpokenStep(null);
            } catch (err) {
              console.error('Re-routing error:', err);
            }
          } else {
            computeNextInstruction(newLoc, routeRef.current);
            computeRemainingAndETA(newLoc, routeRef.current);
          }
        },
        (err) => console.error('GPS error', err),
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (userMarkerRef.current) userMarkerRef.current.remove();
      cleanupRouteLayer();
      window.speechSynthesis.cancel();
    };
  }, [map, destination]);

  if (!routeRef.current) return <div>Waiting for location and route...</div>;

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'white',
      padding: '12px',
      borderRadius: '10px',
      maxWidth: 300,
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ marginTop: 0 }}>Navigation</h3>
      <p><strong>Next:</strong> {nextInstruction}</p>
      <p><strong>Distance to maneuver:</strong> {nextDistance.toFixed(0)} m</p>
      <p>
        <strong>Remaining distance:</strong> {(remainingDistance / 1000).toFixed(2)} km<br />
        <strong>ETA:</strong> {etaMinutes} min
      </p>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
        <button onClick={onStopNavigation}>Stop Navigation</button>
        <label style={{ marginLeft: 10 }}>
          <input
            type="checkbox"
            checked={autoCenter}
            onChange={(e) => setAutoCenter(e.target.checked)}
          /> Auto center
        </label>
      </div>
    </div>
  );
}
