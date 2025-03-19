import { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px'
};

interface FireStation {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface FireStationMapProps {
  onNearestStationUpdate: (station: FireStation, distance: number) => void; // Callback prop
}

export function FireStationMap({ onNearestStationUpdate }: FireStationMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.GOOGLE_CONSOLE_API || null
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStation, setNearestStation] = useState<FireStation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fireStations: FireStation[] = [
    { name: "Cuttack City Fire Station", lat: 20.47661, lng: 85.87556, address: "Buxi Bazar Road, Cuttack" },
    { name: "Baleswar Fire Station", lat: 21.49499, lng: 86.93787, address: "Town Hall Road, Balasore" },
    { name: "Berhampur Fire Station", lat: 19.31256, lng: 84.78953, address: "near Madam Showroom" },
    { name: "MKCG Berhampur Fire Station", lat: 19.31407, lng: 84.80235, address: "Medical Bank Colony" },
    { name: " Baramunda Fire Station", lat: 20.279042, lng: 85.79927, address: "IRC Village, Baramunda" }, 
    { name: "Fire Station", lat: 20.33344, lng: 85.80953, address: "S.S Vihar Road, Bhubaneswar" },
    { name: "Sambalpur Fire Station", lat: 21.46951, lng: 83.97207, address: "Pattnayakpada, Sambalpur" },
    { name: "Dhenkanal Fire Station", lat: 20.65222, lng: 85.59633, address: "College Road, Dhenkanal" },
    { name: "Aska Fire Station", lat: 19.63365, lng: 84.65261, address: "Asika, Ganjam" },
    { name: "Jeypore Fire Station", lat: 18.86900, lng: 82.56199, address: "Vizianagaram Road, Koraput"},
    { name: "Bhadrak Fire Station", lat: 21.09709, lng: 86.52800, address: "Near NH16, Bhadrak" },
    { name: "Athagarh Fire Station", lat: 20.50805, lng: 85.63191, address: "Pattnayakpada, Sambalpur" },
    { name: "Khurdha Fire Station", lat: 20.17078, lng: 85.61328, address: "Pallahat, Khurdha" },
    { name: "Baripada Fire Station", lat: 21.94535, lng: 86.72517, address: "Meher Colony, Mayurbhanj" },
    { name: "Paralakhemundi Fire Station", lat: 18.80100, lng: 84.09819, address: "Paralakhemundi ,Gajapati" },
    { name: "Nayagarh Fire Station", lat: 20.00204, lng: 85.00242, address: "Nayagarh Odagaon Road, Nayagarh" },
    { name: "Anandapur Fire Station", lat: 21.20847, lng: 86.13747, address: "Anandapur, Keonijhar" },
    { name: "Rourkela Fire Station", lat: 22.22246, lng: 84.85046, address: "Udit Nagar, Rourkela" },
    { name: "G.Udayagiri Fire Station",lat: 20.13050, lng: 85.35929, address: "Paburia-G.Udayagiri, Kandhamal" },
    { name: "Burla Fire Station", lat: 21.49465, lng: 83.86828, address: "Nuabatimuda, Sambalpur" },
    { name: "Bhawanipatna Fire Station", lat: 19.93024, lng: 83.16644, address: "Sakti Nagar Para, Kalahandi" },  
    { name: "Kendrapara Main Branch Fire Station", lat: 20.48918, lng: 86.43146, address: "FCQJ+MGQ, Kendrapara" },
    { name: "Jajpur Fire Station",lat: 20.84809, lng: 86.35560, address: "Aradi Panikoily Road, Jajpur" },
    { name: "Balangir HQ, Fire Station", lat: 20.68957, lng: 83.48166, address: "Tulsi Nagar, Balangir" },
    { name: "Attabira Fire Station", lat: 21.37147, lng: 83.78367, address: "Attabira, Baragard" }, 
    { name: "Ambabhona Fire Station", lat: 21.57131, lng: 83.48022, address: "Ambabhona, Sambalpur" },
    { name: "Polasara Fire Station",lat: 20.13050, lng: 85.35929, address: "PR4C+Q32, Ganjam" },
    { name: "Boudh Fire Station", lat: 20.82149, lng: 84.32694, address: "New Revenue Colony, Boudh" },
    { name: "Sundargard Fire Station", lat: 22.11468, lng: 84.04619, address: "Raigard - Sundargard Road, Sundargard" },  
    
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (!isLoaded) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setUserLocation(userCoords);

        let minDistance = Infinity;
        let nearest: FireStation | null = null;

        fireStations.forEach(station => {
          const dist = calculateDistance(userCoords.lat, userCoords.lng, station.lat, station.lng);

          if (dist < minDistance) {
            minDistance = dist;
            nearest = station;
          }
        });

        if (nearest) {
          setNearestStation(nearest);
          setDistance(minDistance);
          onNearestStationUpdate(nearest, minDistance); // Send data to Weather Dashboard
        }
        
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  }, [isLoaded, onNearestStationUpdate]);

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Nearby Fire Stations</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : userLocation && (
          <div className="space-y-4">
            <GoogleMap mapContainerStyle={containerStyle} center={userLocation} zoom={13}>
              <Marker position={userLocation} 
              icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: 'white'
                }}/>
              {fireStations.map((station, index) => (
                <Marker key={index} position={{ lat: station.lat, lng: station.lng }} title={station.name} />
              ))}
            </GoogleMap>
            {/*
            {nearestStation && distance !== null && (
              <div className="space-y-2">
                <p className="font-medium">
                  Nearest Fire Station: <span className="text-primary">{nearestStation.name}</span>
                </p>
                <p className="font-medium">
                  Distance: <span className="text-primary">{distance.toFixed(2)} km</span>
                </p>
              </div>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
