import { useState, useCallback } from 'react';
import { metroApi } from '../services/api.js';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearestStations, setNearestStations] = useState([]);

  const getNearestStations = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await metroApi.findNearest(latitude, longitude, 3);
          setNearestStations(data.nearest || []);
        } catch (err) {
          setError('Could not find nearest stations');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError('Location permission denied. Please allow location access.');
        else if (err.code === 2) setError('Location unavailable. Try again.');
        else setError('Location request timed out.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const clear = () => {
    setNearestStations([]);
    setError('');
  };

  return { loading, error, nearestStations, getNearestStations, clear };
}
