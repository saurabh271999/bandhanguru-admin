"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";
import io from "socket.io-client";
import { apiBaseUrl } from "../apis";

const socket = io(apiBaseUrl);

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  projectLocation?: {
    type: string;
    coordinates: number[];
  };
  installerData: {
    id?: string;
    userName?: string;
    installerCode?: string;
    mobileNumber?: string;
    emailId?: string;
    isActive?: boolean;
  };
  mapKey?: string;
  apiKey: string;
  containerClassName?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  projectLocation,
  installerData,
  mapKey,
  apiKey,
  containerClassName,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const installerMarkerRef = useRef<google.maps.Marker | null>(null);
  const projectMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null
  );

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: latitude,
    lng: longitude,
  });

  // Validate and set default project location
  // const safeProjectLocation = projectLocation && projectLocation.coordinates && Array.isArray(projectLocation.coordinates) && projectLocation.coordinates.length >= 2
  //   ? projectLocation
  //   : {
  //     type: "Point",
  //     coordinates: [77.506105, 28.653992] // Default coordinates (longitude, latitude)
  //   };

  useEffect(() => {
    socket.emit("trackInstaller", installerData.id);

    socket.on("locationUpdated", (data) => {
      // Handle different data formats
      let newLocation;
      if (Array.isArray(data)) {
        // If data is an array [lng, lat]
        newLocation = { lat: data[1], lng: data[0] };
      } else if (data.coordinates && Array.isArray(data.coordinates)) {
        // If data has coordinates array [lng, lat]
        newLocation = { lat: data.coordinates[1], lng: data.coordinates[0] };
      } else if (data.lat && data.lng) {
        // If data has lat/lng properties
        newLocation = { lat: data.lat, lng: data.lng };
      } else {
        console.error("Unknown data format:", data);
        return;
      }

      setLocation(newLocation);
    });

    return () => {
      socket.off("locationUpdated");
    };
  }, [installerData]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // useEffect(() => {
  //   if (!isClient || !mapRef.current || !apiKey) return;

  //   const initializeMap = async () => {
  //     try {
  //       const loader = new Loader({
  //         apiKey: apiKey,
  //         version: "weekly",
  //         libraries: ["places"]
  //       });

  //       const { Map } = await loader.importLibrary("maps");
  //       const { Marker } = await loader.importLibrary("marker");

  //       // Create map instance
  //       const map = new Map(mapRef.current!, {
  //         center: { lat: location.lat, lng: location.lng },
  //         zoom: 15,
  //         mapTypeId: google.maps.MapTypeId.ROADMAP,
  //         mapTypeControl: true,
  //         streetViewControl: true,
  //         fullscreenControl: true,
  //         zoomControl: true,
  //         styles: [
  //           {
  //             featureType: "poi",
  //             elementType: "labels",
  //             stylers: [{ visibility: "off" }]
  //           }
  //         ]
  //       });

  //       mapInstanceRef.current = map;

  //       // Static project marker
  //       projectMarkerRef.current = new google.maps.Marker({
  //         position: { lat: projectLocation.coordinates[1], lng: projectLocation.coordinates[0] },
  //         map,
  //         title: "Project Location",
  //         animation: google.maps.Animation.DROP
  //       });

  //       // Create marker
  //       const marker = new google.maps.Marker({
  //         position: { lat: location.lat, lng: location.lng },
  //         map: map,
  //         title: `Installer: ${installerData.userName || "Unknown"}`,
  //         animation: google.maps.Animation.DROP
  //       });

  //       markerRef.current = marker;

  //       // Create info window
  //       const infoWindow = new google.maps.InfoWindow({
  //         content: `
  //           <div style="padding: 10px; max-width: 250px;">
  //             <h3 style="margin: 0 0 10px 0; color: #274699; font-weight: 600;">
  //               ${(mapKey && mapKey.includes('complaint')) ? 'Installer Live Location' : 'Installer Location'}
  //             </h3>
  //             <p style="margin: 5px 0; font-size: 14px; color: #666;">
  //               <strong>Installer:</strong> ${installerData.userName || "Unknown"}
  //             </p>
  //             <p style="margin: 5px 0; font-size: 14px; color: #666;">
  //               <strong>Code:</strong> ${installerData.installerCode || "N/A"}
  //             </p>
  //             <p style="margin: 5px 0; font-size: 14px; color: #666;">
  //               <strong>Mobile:</strong> ${installerData.mobileNumber || "N/A"}
  //             </p>
  //             <p style="margin: 5px 0; font-size: 14px; color: #666;">
  //               <strong>Email:</strong> ${installerData.emailId || "N/A"}
  //             </p>
  //             <p style="margin: 5px 0; font-size: 14px; color: #666;">
  //               <strong>Status:</strong> ${installerData.isActive ? "Active" : "Inactive"}
  //             </p>
  //           </div>
  //         `
  //       });

  //       // Add click listener to marker
  //       marker.addListener("click", () => {
  //         infoWindow.open(map, marker);
  //       });

  //       // Open info window by default
  //       infoWindow.open(map, marker);

  //       setIsMapReady(true);
  //       setMapError(null);

  //     } catch (error) {
  //       console.error('Error initializing Google Map:', error);
  //       setMapError('Failed to load map. Please check your API key.');
  //     }
  //   };

  //   initializeMap();

  //   // Cleanup function
  //   return () => {
  //     if (markerRef.current) {
  //       markerRef.current.setMap(null);
  //       markerRef.current = null;
  //     }
  //     if (mapInstanceRef.current) {
  //       mapInstanceRef.current = null;
  //     }
  //   };
  // }, [isClient, location, installerData, mapKey, apiKey, projectLocation]);

  // Initialize map
  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!mapRef.current) {
      return;
    }

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY" || apiKey === "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY") {
      setMapError("Google Maps API key is missing or invalid. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.");
      return;
    }
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 15,
        });
        mapInstanceRef.current = map;

        // Project marker
        projectMarkerRef.current = projectLocation
          ? new google.maps.Marker({
              position: {
                lat: projectLocation.coordinates[1],
                lng: projectLocation.coordinates[0],
              },
              map,
              title: "Project Location",
              animation: google.maps.Animation.DROP,
            })
          : null;

        // Installer marker
        installerMarkerRef.current = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: installerData.userName || "Installer",
          icon: {
            url: "/images/track.png", // path to your custom icon
            scaledSize: new google.maps.Size(30, 30), // adjust size
            anchor: new google.maps.Point(20, 20), // center of the icon
          },
        });

        // Info window for installer
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div style="padding:10px; max-width:250px;">
            <h3 style="margin:0 0 10px 0; color:#274699; font-weight:600;">
              Installer Location
            </h3>
            <p><strong>Installer:</strong> ${
              installerData.userName || "Unknown"
            }</p>
            <p><strong>Code:</strong> ${
              installerData.installerCode || "N/A"
            }</p>
            <p><strong>Mobile:</strong> ${
              installerData.mobileNumber || "N/A"
            }</p>
            <p><strong>Email:</strong> ${installerData.emailId || "N/A"}</p>
            <p><strong>Status:</strong> ${
              installerData.isActive ? "Active" : "Inactive"
            }</p>
          </div>
        `,
        });

        installerMarkerRef.current.addListener("click", () => {
          infoWindow.open(map, installerMarkerRef.current!);
        });

        // Directions Renderer for road route
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#274699", strokeWeight: 3 },
        });
        directionsRendererRef.current = directionsRenderer;

        if (projectLocation && Array.isArray(projectLocation.coordinates)) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: location,
              destination: {
                lat: projectLocation.coordinates[1],
                lng: projectLocation.coordinates[0],
              },
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                directionsRenderer.setDirections(result);
              }
            }
          );
        }

        setIsMapReady(true);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setMapError(`Failed to load Google Maps: ${error.message}`);
      });

    return () => {
      installerMarkerRef.current?.setMap(null);
      projectMarkerRef.current?.setMap(null);
      directionsRendererRef.current?.setMap(null);
      mapInstanceRef.current = null;
    };
  }, [apiKey, installerData, projectLocation, isClient]);

  // Update route on live location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !directionsRendererRef.current) return;

    if (projectLocation && Array.isArray(projectLocation.coordinates)) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: location,
          destination: {
            lat: projectLocation.coordinates[1],
            lng: projectLocation.coordinates[0],
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRendererRef.current!.setDirections(result);
          }
        }
      );
    }

    if (installerMarkerRef.current) {
      installerMarkerRef.current.setPosition(location);
      mapInstanceRef.current.panTo(location);
    }
  }, [location, projectLocation]);

  if (!isClient) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <MapPin
            size={48}
            className="mx-auto mb-4 text-gray-400 animate-pulse"
          />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <MapPin size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-sm">{mapError}</p>
          <p className="text-xs mt-2">
            Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
          <p className="text-xs mt-1">
            API Key: {apiKey ? "Present" : "Missing"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        containerClassName || "w-full h-96"
      } rounded-lg overflow-hidden border border-gray-200 relative`}
    >
      <div
        ref={mapRef}
        style={{
          height: "100%",
          width: "100%",
          minWidth: "100%",
          minHeight: "100%",
        }}
        className="w-full h-full"
      />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <MapPin
              size={48}
              className="mx-auto mb-4 text-gray-400 animate-pulse"
            />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
