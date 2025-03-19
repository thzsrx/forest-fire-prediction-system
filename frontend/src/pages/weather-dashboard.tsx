import { useCallback, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, RefreshCw, Upload } from "lucide-react";
import { useGeolocation } from "../hooks/use-geolocation";
import WeatherSkeleton from "@/components/loading-structure";
import { AlertDescription, AlertTitle, Alert } from "@/components/ui/alert";
import { useForecastQuery, useReverseGeocodeQuery, useWeatherQuery } from "@/hooks/use-weather";
import { CurrentWeather } from "@/components/currentweather";
import { WeatherDetails } from "@/components/weatherDetail";
import { WeatherForecast } from "@/components/weatherForecast";
import { FireStationMap } from "@/components/fire-station-map";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WeatherDashboard = () => {

  const navigate = useNavigate();
  const { coordinates, error: locationError, getLocation, isLoading: locationLoading } = useGeolocation();
  const [nearestStation, setNearestStation] = useState<{ name: string; address: string } | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ loading: boolean; error: string | null; success: boolean }>({
    loading: false,
    error: null,
    success: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [savedLocationId, setSavedLocationId] = useState<string | null>(null);

  const locationQuery = useReverseGeocodeQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const weatherQuery = useWeatherQuery(coordinates);
  
  //console.log(weatherQuery.data.wind.speed);

  const handleSaveLocation = useCallback(async (formData: FormData) => {
    setSaveStatus({ loading: true, error: null, success: false });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!locationQuery.data?.[0] || !nearestStation || !nearestDistance) {
        throw new Error('Missing location data');
      }

      const response = await axios.post('/api/locations', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSavedLocationId(response.data.location._id);
      setSaveStatus({ loading: false, error: null, success: true });
      setTimeout(() => setSaveStatus(s => ({ ...s, success: false })), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Server error'
        : error instanceof Error
        ? error.message
        : 'Unknown error';
        
      setSaveStatus({ loading: false, error: message, success: false });
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [locationQuery.data, nearestStation, nearestDistance, navigate]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', locationQuery.data?.[0]?.name || '');
      formData.append('state', locationQuery.data?.[0]?.state || '');
      formData.append('lat', coordinates?.lat?.toString() || '');
      formData.append('lon', coordinates?.lon?.toString() || '');
      formData.append('windSpeed', weatherQuery.data?.wind?.speed.toString() || '');
      formData.append('nearestStation[name]', nearestStation?.name || '');
      formData.append('nearestStation[address]', nearestStation?.address || '');
      formData.append('nearestStation[distance]', nearestDistance?.toString() || '');

      handleSaveLocation(formData);
    }
  };
  const handleNearestStationUpdate = useCallback((station: { name: string; address: string }, distance: number) => {
    setNearestStation(station);
    setNearestDistance(distance);
  }, []);

useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  checkAuth();
}, [navigate]); 

// Add these handler functions
const handleLogout = () => {
  localStorage.removeItem("token");
  setIsAuthenticated(false);
  navigate("/login");
};

const handleSignup = () => {
  navigate("/signup");
};

  const handleRefresh = () => {
    getLocation();
    if (coordinates) {
        weatherQuery.refetch()
        forecastQuery.refetch()
        locationQuery.refetch() 
    }
    };

    if (locationLoading) {
        return <WeatherSkeleton /> 
    }

    if (locationError) {
        return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
                <p>{locationError}</p>
                <Button onClick={getLocation} variant={"outline"} className="w-fit">
                    <MapPin className="mr-2 h-4 w-4" />
                    Enable Location
                </Button>
            </AlertDescription>
        </Alert>
        )
    }
    
    if (!coordinates) {
        return (
        <Alert variant="destructive">
            <AlertTitle>Location Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
                <p>Please enable location access to see your local weather.</p>
                <Button onClick={getLocation} variant={"outline"} className="w-fit">
                    <MapPin className="mr-2 h-4 w-4" />
                    Enable Location
                </Button>
            </AlertDescription>
        </Alert>
        )
    }
   
    const locationName = locationQuery.data?.[0];

    if (weatherQuery.error || forecastQuery.error) {
        return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
                <p>Failed to fetch weather data. Please try again.</p>
                <Button onClick={getLocation} variant={"outline"} className="w-fit">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </AlertDescription>
        </Alert>
        )
    }

    if (!weatherQuery.data || !forecastQuery.data) {
        return <WeatherSkeleton />;
    }


   return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant={'outline'} 
            size={'icon'} 
            onClick={handleRefresh} 
            disabled={weatherQuery.isFetching || forecastQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${weatherQuery.isFetching ? "animate-spin" : ""}`}/>
          </Button>
          {isAuthenticated ? (
            <Button
              variant="default"
              onClick={handleLogout}
              className="hover:bg-red-100 hover:text-red-600"
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleSignup}
            >
              Sign Up
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <CurrentWeather data={weatherQuery.data} locationName={locationName} />
          <WeatherDetails data={weatherQuery.data} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg shadow-md space-y-4">
              <div className="h-130">
                <FireStationMap onNearestStationUpdate={handleNearestStationUpdate} />
              </div>

              {nearestStation && nearestDistance !== null && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Nearest Fire Station</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        onClick={handleSaveLocation}
                        disabled={saveStatus.loading}
                        variant="default"
                      >
                        {saveStatus.loading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                          </div>
                        ) : 'Save Location'}
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Station Name:</span>{' '}
                      <span className="font-medium">{nearestStation.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Address:</span>{' '}
                      <span className="font-medium">{nearestStation.address}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Distance:</span>{' '}
                      <span className="font-medium">{nearestDistance.toFixed(2)} km</span>
                    </p>
                  </div>

                  {savedLocationId && (
                    <div className="mt-4">
                      <img 
                        src={`/api/locations/image/${savedLocationId}`}
                        alt="Location preview"
                        className="rounded-lg max-h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  {saveStatus.error && (
                    <p className="text-red-500 text-sm mt-2">{saveStatus.error}</p>
                  )}
                  {saveStatus.success && (
                    <p className="text-green-500 text-sm mt-2">Location saved successfully!</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  );
};
export default WeatherDashboard;
