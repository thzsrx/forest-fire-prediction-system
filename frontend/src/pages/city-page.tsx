import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useForecastQuery, useWeatherQuery } from "@/hooks/use-weather";
import { useParams, useSearchParams } from "react-router-dom";
import { WeatherForecast } from "@/components/weatherForecast";
import { WeatherDetails } from "@/components/weatherDetail";
import { CurrentWeather } from "@/components/currentweather";
import { HourlyTemperature } from "@/components/hourlyTemperature";
import WeatherSkeleton from "@/components/loading-structure";
import { FavoriteButton } from "@/components/Favorite-button";

export default function CityPage() {
    const [searchParams] = useSearchParams();
    const params = useParams();
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lon = parseFloat(searchParams.get("lon") || "0");

    console.log("from city page");
    const coordinates = { lat, lon };
    
    const forecastQuery = useForecastQuery(coordinates);
    const weatherQuery = useWeatherQuery(coordinates);
   
    if (weatherQuery.error || forecastQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weather data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />;
  }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{params.cityName}, {weatherQuery.data.sys.country}</h1>
                <div>
                    {/* favorite button */}
                    <FavoriteButton data = {{ ...weatherQuery.data, name: params.cityName }} />
                </div>
                </div>

            <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                    <CurrentWeather data = {weatherQuery.data} />
                    <HourlyTemperature data = {forecastQuery.data} />
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-start">
                    <WeatherDetails data = {weatherQuery.data} />
                    <WeatherForecast data = {forecastQuery.data} />
                </div>
            </div>
        </div>
    );
};

