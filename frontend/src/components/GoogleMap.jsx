import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap as GoogleMapView,
  useLoadScript,
  MarkerF,
  Autocomplete,
  InfoWindowF,
} from "@react-google-maps/api";
import { MapPin, Navigation, Maximize2 } from "lucide-react";

const libraries = ["places"];
const defaultCenter = { lat: 27.700769, lng: 85.30014 };

export default function GoogleMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geoPermission, setGeoPermission] = useState("unknown");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const geocoderRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const geocodeAndSetLocation = useCallback((position) => {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    setCenter(pos);
    setMarkerPosition(pos);
    setInfoWindowOpen(true);

    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    geocoderRef.current?.geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setCurrentAddress(results[0].formatted_address);
      } else {
        setCurrentAddress("Address not found");
      }
    });
  }, []);

  useEffect(() => {
    if (!("permissions" in navigator)) return;

    let mounted = true;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!mounted) return;
        setGeoPermission(status.state);
        status.onchange = () => setGeoPermission(status.state);
      })
      .catch(() => setGeoPermission("unknown"));

    return () => {
      mounted = false;
    };
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const newPos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setCenter(newPos);
    setMarkerPosition(newPos);
    setCurrentAddress(place.formatted_address || "Selected location");
    setInfoWindowOpen(true);
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geocodeAndSetLocation(pos);
        setDetectingLocation(false);
        setGeoPermission("granted");
      },
      (err) => {
        console.error(err);
        setDetectingLocation(false);
        setGeoPermission("denied");
        alert("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [geocodeAndSetLocation]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (loadError) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load Google Maps. Check API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading Google Maps…
      </div>
    );
  }

  const containerStyle = {
    width: "100%",
    height: isFullscreen ? "100vh" : "300px",
  };

  return (
    <div
      ref={containerRef}
      className={isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}
    >
      {/* Controls */}
      <div className="space-y-3 mb-3">
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </Autocomplete>

        <button
          onClick={handleUseMyLocation}
          disabled={detectingLocation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white"
        >
          <Navigation className="w-4 h-4" />
          {detectingLocation ? "Detecting..." : "Use My Location"}
        </button>

        {markerPosition && (
          <div className="flex gap-2 text-sm text-gray-700 bg-blue-50 p-2 rounded">
            <MapPin className="w-4 h-4 text-blue-600" />
            {currentAddress}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border">
        <GoogleMapView
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={(map) => (mapRef.current = map)}
          onUnmount={() => (mapRef.current = null)}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <MarkerF position={markerPosition}>
              {infoWindowOpen && (
                <InfoWindowF
                  position={markerPosition}
                  onCloseClick={() => setInfoWindowOpen(false)}
                >
                  <p className="text-xs">{currentAddress}</p>
                </InfoWindowF>
              )}
            </MarkerF>
          )}
        </GoogleMapView>

        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 bg-white p-2 rounded shadow"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="w-full mt-4 py-2 border rounded"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
}