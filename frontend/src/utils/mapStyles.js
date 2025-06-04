// frontend/src/utils/mapStyles.js

import { MAPTILER_KEY, OPENFREEMAP_URL } from '../config.js';

export const STREET    = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;
export const SATELLITE = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`;
export const HYBRID    = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
