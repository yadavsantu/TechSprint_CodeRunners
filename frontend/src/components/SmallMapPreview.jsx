// components/SmallMapPreview.jsx
import React from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { MapPin, Navigation } from "lucide-react";

const libraries = ["places"];

const SmallMapPreview = ({ latitude, longitude, address, zoom = 14 }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Function to open navigation in Google Maps
  const handleNavigate = (e) => {
    e.stopPropagation(); // Prevent parent click events
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Try to open in Google Maps app first (mobile), fallback to web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open in Google Maps app
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      // For desktop, open in new tab with directions
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Function to open location in Google Maps (view only)
  const handleViewOnMap = (e) => {
    e.stopPropagation();
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Open location in Google Maps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  // If no coordinates, show a placeholder
  if (!latitude || !longitude) {
    return (
      <div className="w-full h-full rounded-lg border border-gray-300 bg-gray-100 flex flex-col items-center justify-center p-3">
        <MapPin className="w-6 h-6 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500 text-center">No location data</span>
      </div>
    );
  }

  // Map container style for the small preview
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
  };

  if (loadError) {
    return (
      <div className="w-full h-full rounded-lg border border-gray-300 bg-red-50 flex flex-col items-center justify-center p-3">
        <span className="text-xs text-red-500 text-center">Map failed to load</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-lg border border-gray-300 bg-gray-100 flex flex-col items-center justify-center p-3">
        <div className="animate-pulse text-xs text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg border border-gray-300 overflow-hidden relative group">
      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggable: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          gestureHandling: "none",
          styles: [
            {
              featureType: "all",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ visibility: "simplified" }]
            }
          ]
        }}
      >
        <MarkerF
          position={center}
          icon={{
            url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23EF4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
            scaledSize: new window.google.maps.Size(24, 24),
          }}
        />
      </GoogleMap>

      {/* Address bar */}
      {address && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1.5">
          <p className="text-xs truncate px-1">{address}</p>
        </div>
      )}

      {/* Hover Overlay with Navigation Buttons */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
        <button
          onClick={handleNavigate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
        >
          <Navigation size={16} />
          Get Directions
        </button>
        
        <button
          onClick={handleViewOnMap}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
        >
          <MapPin size={16} />
          View on Map
        </button>
      </div>
    </div>
  );
};

export default SmallMapPreview;