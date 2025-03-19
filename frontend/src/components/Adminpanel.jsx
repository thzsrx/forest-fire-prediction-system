import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const Adminpanel = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/locations")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error fetching locations:", error));
  }, []);

  return (
    <Card className="m-6 p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Location Data</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-gray-800">
              <TableHead>#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Nearest Station</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>Wind Speed (m/s)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc, index) => (
              <TableRow key={index} className="border-b">
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {loc.hasImage && (
                    <img 
                      src={`http://localhost:3000/api/locations/image/${loc.id}`}
                      alt="Location preview"
                      className="h-12 w-12 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{loc.username}</TableCell>
                <TableCell>{loc.name}</TableCell>
                <TableCell>{loc.state}</TableCell>
                <TableCell>{loc.lat.toFixed(4)}</TableCell>
                <TableCell>{loc.lon.toFixed(4)}</TableCell>
                <TableCell>{loc.nearestStation.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{loc.nearestStation.address}</TableCell>
                <TableCell>{loc.nearestStation.distance.toFixed(2)}</TableCell>
                <TableCell>{loc.windSpeed?.toFixed(1)}</TableCell>
                <TableCell>{loc.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Adminpanel;
