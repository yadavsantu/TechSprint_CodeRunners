import React, { useState, useEffect, useRef } from "react";
import { Ambulance, MapPin, Phone, Bell, Radio, Power } from "lucide-react";
import { updateAmbulanceStatus } from "../services/ambulance";
import { getSocket } from "../services/socket";
// import your connected socket instance

const MOCK_AMBULANCE = {
  _id: "507f1f77bcf86cd799439011",
  name: "Nepal Ambulance Service",
  phone: "+977-9841234567",
  address: "Thamel, Kathmandu, Nepal",
  location: { latitude: 27.7172, longitude: 85.324 },
  website: "https://nepalambulance.com",
  category: "Ambulance Service",
  status: "OFFLINE",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2026-01-17T08:45:00Z",
};

export default function AmbulanceDashboard() {
  const [ambulance, setAmbulance] = useState(MOCK_AMBULANCE);
  const [notifications, setNotifications] = useState(0);
  const [emergencies, setEmergencies] = useState([]);
  const socketRef = useRef(null);

  const handleAccept = (emergency) => {
    if (!socketRef.current) return;

    // ✅ 1. OPEN NAVIGATION FIRST (must be first line)
    const { latitude, longitude } = emergency.location;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(mapsUrl, "_blank");

    // ✅ 2. THEN notify server
    socketRef.current.emit("accept-accident", {
      accidentId: emergency._id,
    });
  };

  useEffect(() => {
    if (!socketRef.current) return;

    const onRemoveAccident = ({ accidentId }) => {
      setEmergencies((prev) => prev.filter((e) => e._id !== accidentId));
      setNotifications((prev) => (prev > 0 ? prev - 1 : 0));
    };

    socketRef.current.on("remove-accident", onRemoveAccident);

    return () => {
      socketRef.current.off("remove-accident", onRemoveAccident);
    };
  }, []);

  // Reject an emergency
  const handleReject = (emergencyId) => {
    // Simply remove it locally; other drivers can still see it
    setEmergencies((prev) => prev.filter((e) => e._id !== emergencyId));
    setNotifications((prev) => (prev > 0 ? prev - 1 : 0));
  };

  useEffect(() => {
    const socket = getSocket(); // get the socket instance initialized after login
    if (!socket) return; // socket not connected yet
    socketRef.current = socket;

    if (ambulance.status === "AVAILABLE") {
      socket.emit("join-ambulance-zone", { zoneId: "default" });

      socket.on("new-emergency", (emergency) => {
        console.log("New emergency:", emergency);
        setEmergencies((prev) => [emergency, ...prev]);
        setNotifications((prev) => prev + 1);
      });
    }

    return () => {
      socketRef.current?.off("new-emergency");
    };
  }, [ambulance.status]);

  // Toggle ambulance status
  const handleStatusToggle = async () => {
    const newStatus = ambulance.status === "OFFLINE" ? "AVAILABLE" : "OFFLINE";
    try {
      const { data } = await updateAmbulanceStatus(newStatus);
      setAmbulance(data.ambulance);
      if (newStatus === "OFFLINE") {
        setNotifications(0);
        setEmergencies([]);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Unable to update status. Please try again.");
    }
  };

  const isOnline = ambulance.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-lg">
              <Ambulance className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {ambulance.name}
              </h1>
              <p className="text-sm text-gray-500">Driver Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <button
                onClick={handleStatusToggle}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  isOnline ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isOnline ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-semibold ${
                  isOnline ? "text-green-600" : "text-gray-500"
                }`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            <div className="relative">
              <Bell
                className={`w-6 h-6 ${isOnline ? "text-gray-700" : "text-gray-400"}`}
              />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {isOnline ? (
          <div className="space-y-4">
            {emergencies.length === 0 ? (
              <p className="text-gray-600">Waiting for emergencies...</p>
            ) : (
              emergencies.map((emergency) => (
                <div
                  key={emergency._id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500 flex flex-col gap-3"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {emergency.title}
                    </h4>
                    <p className="text-gray-600">{emergency.description}</p>
                    <p className="text-xs text-gray-400">
                      Location: {emergency.location.latitude.toFixed(4)},{" "}
                      {emergency.location.longitude.toFixed(4)}
                    </p>
                  </div>

                  {/* Accept / Reject buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleAccept(emergency)}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleReject(emergency._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <Power className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-xl font-semibold mt-4 text-gray-900">
              You are Offline
            </h3>
            <p className="text-gray-600 mt-2">
              Set your status to ONLINE to start receiving accident requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
