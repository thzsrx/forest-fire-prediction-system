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
    { name: "Berhampur Fire Station", lat: 19.31242, lng: 84.78960, address: "8Q6Q+XR9, near Madam Showroom, Gandhi Nagar, Brahmapur, Odisha 760001" },
    { name: "MKCG Berhampur Fire Station", lat: 19.31407, lng: 84.80235, address: "Medical Bank Colony" },
    { name: " Baramunda Fire Station", lat: 20.279042, lng: 85.79927, address: "IRC Village, Baramunda" }, 
   // { name: "Fire Station", lat: 20.33344, lng: 85.80953, address: "S.S Vihar Road, Bhubaneswar" },
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
    { name: "G.Udayagiri Fire Station",lat: 20.13048, lng: 84.35930, address: "49J5+5M9, Badabali jungal, Odisha 762100, Kandhamal" },
    { name: "Burla Fire Station", lat: 21.49465, lng: 83.86828, address: "Nuabatimuda, Sambalpur" },
    { name: "Bhawanipatna Fire Station", lat: 19.93024, lng: 83.16644, address: "Sakti Nagar Para, Kalahandi" },  
    { name: "Kendrapara Main Branch Fire Station", lat: 20.48918, lng: 86.43146, address: "FCQJ+MGQ, Kendrapara" },
    { name: "Jajpur Fire Station",lat: 20.84809, lng: 86.35560, address: "Aradi Panikoily Road, Jajpur" },
    { name: "Balangir HQ, Fire Station", lat: 20.68957, lng: 83.48166, address: "Tulsi Nagar, Balangir" },
    { name: "Attabira Fire Station", lat: 21.37147, lng: 83.78367, address: "Attabira, Baragard" }, 
    { name: "Ambabhona Fire Station", lat: 21.57131, lng: 83.48022, address: "Ambabhona, Sambalpur" },
    { name: "Polasara Fire Station",lat: 19.70689, lng: 84.82015, address: "PR4C+Q32, Polasara, Odisha 761105, Ganjam" },
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
    { name: "Digapahandi Fire Station", lat: 19.39312, lng: 84.57064, address: "9HVC+67R, Rajapur, Odisha 761012, Ganjam" },
    { name: "Sorada Fire Station", lat: 19.75503, lng: 84.43105, address: "Fire Station Road, near Block Office, Surada, Odisha 761108, Sorada" }, 
    { name: "Ranpur Fire Station", lat: 20.07160, lng: 85.33288, address: "38CM+J49, Raj-Ranpur, Purunabasanta, Odisha 752026, Nayagarh" },
    { name: "Salipur Fire Station", lat: 20.47499, lng: 86.10824, address: "F4F5+X78, Lunahar, Salipur, Odisha 754202, Cuttack" },
    { name: "Dhamnagar Fire Station", lat: 20.97377, lng: 86.39627, address: "Sasan, Bhandari Pokhari, Odisha 756120, Bhadrak" }, 
    { name: "Hatadihi Fire Station", lat: 21.20566, lng: 86.36182, address: "6946+6QV, Rauturapur, Odisha 756115, Keonjhar" },
    { name: "Kujanga Fire Station", lat: 20.31954, lng: 86.54299, address: "8G9V+R59, Santara, Odisha 754141, Jagatsinghpur" },
    { name: "Odagaon Fire Station", lat: 20.00203, lng: 85.00242, address: "Nayagarh, Nayagarh, SH-21, Nayagarh Aska Road, Nayagarh Odagaon Road, Odagaan, Odagaan, Odisha 752081, Nayagarh" },
    { name: "Parjang Fire Station",lat: 20.91320, lng: 85.31226, address: "W876+7V, Garhaparajang, Odisha 759120, Dhenkanal" },
    { name: "Gondia Fire Station", lat: 20.77255, lng: 85.80310, address: "QRF3+276, Mandara Rd, Sriramchandrapur, Odisha 759016, Dhenkanal" },
    { name: "Khajuriakata Fire Station", lat: 20.70180, lng: 85.31553, address: "Hindol - Gudiakateni Rd, Balimi, Ranjagola, Odisha 759020, Dhenkanal" }, 
    { name: "Bologarh Fire Station", lat: 20.16959, lng: 85.27614, address: "579G+RFJ, NH224, Bolagarh, Odisha 752066, Khurdha" }, 
    { name: "Basta Fire Station", lat: 21.69740, lng: 87.06100, address: "M3W6+X98, Sadanandapur, Basta, Odisha 756029, Balasore" }, 
    { name: "Kodala Fire Station", lat: 19.62675, lng: 84.93793, address: "JWGP+RXG, Kodala, Odisha 761032, Ganjam" },
    { name: "Khalikote Fire Station", lat: 19.61311, lng: 85.11988, address: "KeshPur Chhaka, Ganjam NH-5, Baharagora Chennai Highway, Chagadia, Dadima, Odisha 761029, Ganjam" },
    { name: "R.Udayagiri Fire Station", lat: 19.15968, lng: 84.14104, address: "545R+VCF, R. Udayagiri, Odisha 761016, Gajapati" }, 
    { name: "Madanpur Rampur Fire Station", lat: 20.22994, lng: 83.49986, address: "6FHX+XWH, Ambagaon, Odisha 766102, Subarnapur" },
    { name: "Hinjilikat Fire Station", lat: 19.47881, lng: 85.74799, address: "FPHX+G5H, Hinjillikatu, Odisha 761102, Ganjam" },
    { name: "Kotpada Fire Station",lat: 19.14348, lng: 82.31417, address: "kotapad, Murtahandi, Odisha 764058, Koraput" },
    { name: "Rajkanika Fire Station", lat: 20.73824, lng: 86.70201, address: "PPQ2+8R3, Gangadharpur, Odisha 754220, Kendrapara" },
    { name: "Pattamundei Fire Station", lat: 20.57918, lng: 86.54772, address: "Patamundai, Kendrapara SH-9A, Aul, Road, Aali, Jagatpur, Aali, Odisha 754215, Kendrapara" }, 
    { name: "Mohana Fire Station", lat: 19.43840, lng: 84.26386, address: "C7Q7+9G5, Odisha 761015, Gajapati" },
    { name: "Basudevpur Fire Station",lat: 21.12098, lng: 86.75019, address: "4QC2+93W, Basudebpur, Odisha 756125, Bhadrak" },
    { name: "Begunia Fire Station", lat: 20.20206, lng: 85.44489, address: "6C2V+RW8, Jagiribad, Odisha 752062, Khurdha" },
    { name: "Chhendipada Fire Station", lat: 21.08363, lng: 84.88316, address: "3VMM+C6Q, Chhendipada, Odisha 759124, Angul" }, 
    { name: "Brahmagiri Fire Station", lat: 19.79494, lng: 85.67869, address: "QMVH+XFW, Palanka, Odisha 752011, Puri" },
    { name: "Chandrasekharpur Fire Station", lat: 20.33071, lng: 85.80970, address: "8RM5+5R2, 309, S.S. Vihar Road, Phase-VII, HIG Colony, Sailashree Vihar, Chandrasekharpur, Bhubaneswar, Odisha 751021, Khurdha" },
    { name: "Betnoti Fire Station", lat: 21.73184, lng: 86.84172, address: "Jadipal, Odisha 757025, Mayurbhanj" }, 
    { name: "Secretariat  Fire Station", lat: 20.27019, lng: 85.82694, address: "7RCG+3QM, near SAP Head Quarters, Keshari Nagar, Bhubaneswar, Odisha 751001, Khurdha" },
    { name: "Tirtol Fire Station", lat: 20.30759, lng: 86.33360, address: "State Highway 12, Cuttack - Paradeep Rd, Tirtol, Odisha 754137, Jagatsinghpur" },
    { name: "Odisha Agnishama Seva Kendra, Jatni Fire Station", lat: 20.17652, lng: 85.70114, address: "5PG2+JF2, Jatni Rd, Jatni, Bhubaneswar, Odisha 752050, Khurdha" },
    { name: "Parjang Fire Station",lat: 20.73493, lng: 83.67526, address: "PMMG+X46, Tarbha, Odisha 767016, Subarnapur" },
    { name: "Rasol Fire Station", lat: 20.61720, lng: 85.31850, address: "J889+VCF, Rasol, Odisha 759021, Dhenkanal" },
    { name: "Patrapur Fire Station", lat: 19.12998, lng: 84.57047, address: "4HHC+X6Q, Patrapur, Bamakei, Odisha 761004, Ganjam" }, 
    { name: "Bissam Cuttack Fire Station", lat: 19.51326, lng: 83.51177, address: "GG76+8P2, Bissamcuttack, Bishama Katek, Odisha 765019, Rayagada" },
   
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
