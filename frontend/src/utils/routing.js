// Geocode a place name via Nominatim 
export async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MyMapApp/1.0 (dheerajpapani@gmail.com)', 
      'Referer': 'https://dheerajpapani.github.io/india-map-portal/' 
    }
  });
  if (!res.ok) throw new Error('Failed to fetch geocode');
  const [item] = await res.json();
  return item ? { lat: +item.lat, lng: +item.lon } : null;
}

// Fetch up to 3 alternative routes via OSRM
export async function getRoutes(from, to) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MyMapApp/1.0 (dheerajpapani@gmail.com)',
      'Referer': 'https://dheerajpapani.github.io/india-map-portal/'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch route');

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No routes found');
  }

  return data.routes.slice(0, 3);
}
