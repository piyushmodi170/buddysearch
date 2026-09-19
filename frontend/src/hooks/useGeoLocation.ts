import { useState, useEffect } from 'react';

interface GeoLocationState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ coords: null, error: 'Geolocation is not supported', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setLocation({ coords: null, error: err.message, loading: false });
      }
    );
  }, []);

  return location;
}
