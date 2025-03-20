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
    { name: "Sambalpur Fire Station", lat: 21.46931, lng: 83.97208, address: "Pattnayakpada, Sambalpur" },
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
    { name: "Keonjhar Fire Station", lat: 21.62926, lng: 85.57364, address: "JHHF+MFX, Keonjhar" },
    { name: "Balijhari Fire Station",lat: 20.41150, lng: 85.22157, address: "C66C+HJR, Cuttack" },
    { name: "Banki Fire Station", lat: 20.36597, lng: 85.53198, address: "9G8J+9QQ, Banki Road, Cuttack" },
    { name: "Rairangpur Fire Station", lat: 22.28021, lng: 86.16244, address: "75J7+323, Mahuldiha Road, Mayurbhanj" }, 
    { name: "Angul Fire Station", lat: 20.84177, lng: 85.10666, address: "R4R4+PM3, NH55, Angul" },
    { name: "Bhanjanagar Fire Station", lat: 19.91672, lng: 84.56406, address: "WH87+MHX, Bhanjanagar, Ganjam" },
    { name: "Jagatsinghpur Fire Station", lat: 20.25236, lng: 86.19359, address: "Jagatsinghpur, Jagatsinghpur" },
    { name: "Rayagada Fire Station",lat: 19.16263, lng: 83.42084, address: "Ring Road, Rayagada" },
    { name: "Birmaharajpur Fire Station", lat: 20.86715, lng: 84.04950, address: "V28X+VQ5, Subarnapur" },
    { name: "Chhatrapur Fire Station", lat: 19.35838, lng: 84.99442, address: "Conservation, Ganjam" }, 
    { name: "Talcher Fire Station", lat: 20.94183, lng: 85.22058, address: "W6RC+P6G, Baghuabol, Angul" },
    { name: "Gunupur Fire Station",lat: 19.06037, lng: 83.82264, address: "3R6F+43, Rayagada" },
    { name: "Jharsuguda Fire Station", lat: 21.88966, lng: 84.02885, address: "V2QH+VG9, Bijju Nagar, Jharsuguda" },
    { name: "Daspalla Fire Station", lat: 20.31726, lng: 84.85337, address: "8V83+W85, Jagapur, Nayagarh" },  
    { name: "Padampur Fire Station", lat: 20.99263, lng: 83.07834, address: "X3VH+28R, Padampur, Baragard" },
    { name: "Karanjia Fire Station",lat: 21.76332, lng: 85.96346, address: "QX77+89F, Mayurbhanj" },
    { name: "Redhakhol Fire Station", lat: 21.06681, lng: 84.33386, address: "388M+PHC, Redhakhol, Sambalpur" },
    { name: "Phulbani Fire Station", lat: 20.47150, lng: 84.24110, address: "F6CR+HCX, Narayani Sahi Road, Kandhamal" }, 
    { name: "Koraput Fire Station", lat: 18.80785, lng: 82.70691, address: "R454+4QR, Pujariput, Koraput" },
    { name: "Bhuban Fire Station", lat: 20.89106, lng: 85.81683, address: "VRR8+FM3, Srischhabhagirathapur Sasansamil Ga, Odisha 759017, Dhenkanal" }, 
    { name: "Pallahara Fire Station", lat: 21.44394, lng: 85.18153, address: "C5VJ+HJF, Samiapali, Odisha 759119, Angul" },
    { name: "Atthamallik Fire Station", lat: 20.73214, lng: 84.53591, address: "Manjor, Athmallik, Odisha 759125, Agul" }, 
    { name: "Malkangiri Fire Station", lat: 18.28345, lng: 81.98096, address: "7XMJ+9CC, Korukonda, Odisha 764051, Malkangiri" },
    { name: "Nuapada Fire Station", lat: 20.88717, lng: 82.50880, address: "VGP5+VG7, Khariar Road, Odisha 766104, Nuapada" },
    { name: "Udala Fire Station", lat: 21.57296, lng: 86.56980, address: "HHF9+5WM, Near Pariba Market, Radho road, SH 19, Udala, Odisha 757041, Mayurbhanj" },
    { name: "Titilagarh Fire Station",lat: 19.16263, lng: 83.42084, address: "74MR+QVJ, Titilagarh, Odisha 767042, Bolangir" },
    { name: "Nilagiri Fire Station", lat: 21.45802, lng: 86.76899, address: "FQ59+5HR, Nilagiri, Odisha 756040, Balasore" },
    { name: "Hindol Fire Station", lat: 20.61961, lng: 85.20324, address: "J693+R7X, saradha pur., Hindol, Odisha 759022, Dhenkanal" }, 
    { name: "Dharmagarh Fire Station", lat: 19.88705, lng: 82.79424, address: "VQPV+RP6, Dharmagarh, Odisha 766015, Kalahandi" },
    { name: "Champua Fire Station", lat: 22.06732, lng: 85.64863, address: "3J8X+WFC, Pradhanmantri Sadak Yojana Rd, Anandapur Alias Panchapokharia, Odisha 758041, Keonjhar" },
    { name: "Bonai Fire Station", lat: 21.80638, lng: 84.96619, address: "RX48+HF4, Amatpali, Odisha 770038, Sundargard" }, 
    { name: "Baliguda Fire Station", lat: 20.19733, lng: 83.90019, address: "5WW2+X32, Balliguda, Badagan, Odisha 762103, Kandhamal" },
    { name: "Jajpur Road Fire Station", lat: 20.97311, lng: 86.12302, address: "X4FF+46M, National Highway 215, Odisha, 755019, Jajpur" },
    { name: "Tangi Fire Station", lat: 19.93086, lng: 85.39870, address: "W9JX+8GC, Tangi, Ratanapurpatna, Odisha 752023, Khurdha" },
    { name: "Soro Fire Station",lat: 21.30374, lng: 86.69312, address: "8M3V+F6X, Soro, Odisha 756045, Balasore" },
    { name: "Nimapara Fire Station", lat: 20.05356, lng: 86.00286, address: "3233+C4H, Nimapara Road, Nimapada, Odisha 752106, Puri" },
    { name: "Chandikhol Fire Station", lat: 20.70449, lng: 86.13529, address: "Chandikhol Chhak, Khosalpur, Odisha 755044, Jajpur" }, 
    { name: "Kantamal Fire Station", lat: 20.64833, lng: 83.74831, address: "JPXX+88M, Deuldunguri, Odisha 762017, Boudh" },


    { name: "Panposh Fire Station",lat: 22.24848, lng: 84.80239, address: "6RX2+4PM, Kalinga Vihar, Chhend Colony, Rourkela, Odisha 769015, Sundargard " },
    {/*    { name: "Nilagiri Fire Station", lat: 21.45802, lng: 86.76899, address: "FQ59+5HR, Nilagiri, Odisha 756040, Balasore" },
    { name: "Hindol Fire Station", lat: 20.61961, lng: 85.20324, address: "J693+R7X, saradha pur., Hindol, Odisha 759022, Dhenkanal" }, 
    { name: "Dharmagarh Fire Station", lat: 19.88705, lng: 82.79424, address: "VQPV+RP6, Dharmagarh, Odisha 766015, Kalahandi" },
    { name: "Champua Fire Station", lat: 22.06732, lng: 85.64863, address: "3J8X+WFC, Pradhanmantri Sadak Yojana Rd, Anandapur Alias Panchapokharia, Odisha 758041, Keonjhar" },
    { name: "Bonai Fire Station", lat: 21.80638, lng: 84.96619, address: "RX48+HF4, Amatpali, Odisha 770038, Sundargard" }, 
    { name: "Baliguda Fire Station", lat: 20.19733, lng: 83.90019, address: "5WW2+X32, Balliguda, Badagan, Odisha 762103, Kandhamal" },
    { name: "Jajpur Road Fire Station", lat: 20.97311, lng: 86.12302, address: "X4FF+46M, National Highway 215, Odisha, 755019, Jajpur" },
    { name: "Tangi Fire Station", lat: 19.93086, lng: 85.39870, address: "W9JX+8GC, Tangi, Ratanapurpatna, Odisha 752023, Khurdha" },
    { name: "Soro Fire Station",lat: 21.30374, lng: 86.69312, address: "8M3V+F6X, Soro, Odisha 756045, Balasore" },
    { name: "Nimapara Fire Station", lat: 20.05356, lng: 86.00286, address: "3233+C4H, Nimapara Road, Nimapada, Odisha 752106, Puri" },
    { name: "Chandikhol Fire Station", lat: 20.70449, lng: 86.13529, address: "Chandikhol Chhak, Khosalpur, Odisha 755044, Jajpur" }, 
    { name: "Kantamal Fire Station", lat: 20.64833, lng: 83.74831, address: "JPXX+88M, Deuldunguri, Odisha 762017, Boudh" },
  */}
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
