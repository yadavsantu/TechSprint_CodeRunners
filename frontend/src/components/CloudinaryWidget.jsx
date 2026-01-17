import React, { useEffect, useRef, useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";

export default function CloudinaryUploadWidget({ onUploadSuccess }) {
  const widgetRef = useRef(null);
  const mountedRef = useRef(false);
  const widgetInitializedRef = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  // Memoize the callback to prevent unnecessary re-renders
  const handleUploadSuccess = useCallback((info) => {
    if (onUploadSuccess) {
      onUploadSuccess(info);
    }
  }, [onUploadSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Only initialize once
    if (widgetInitializedRef.current) return;
    
    setStatus("loading");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setStatus("error");
      setErrorMessage(
        `Missing environment variables:
VITE_CLOUDINARY_CLOUD_NAME=${cloudName || "your_cloud_name"}
VITE_CLOUDINARY_UPLOAD_PRESET=${uploadPreset || "your_upload_preset"}`
      );
      return;
    }

    const loadWidget = () => {
      if (!mountedRef.current) return;

      if (!window.cloudinary) {
        setStatus("error");
        setErrorMessage("Cloudinary SDK not loaded");
        return;
      }

      // Only create widget if it doesn't exist
      if (widgetRef.current) {
        setStatus("ready");
        return;
      }

      try {
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            sources: ["local", "camera"],
            multiple: true,
            maxFiles: 5,
            clientAllowedFormats: [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "webp",
              "mp4",
              "mov",
            ],
            maxFileSize: 10_000_000, // 10MB
            folder: "accident_reports",
            showAdvancedOptions: false,
            showPoweredBy: false,
            singleUploadAutoClose: false,
          },
          (error, result) => {
            if (!mountedRef.current) return;
            
            if (error) {
              console.error("Upload widget error:", error);
              // Don't set error state here unless it's a critical error
              // Cloudinary sometimes throws non-critical errors
              return;
            }

            if (result && result.event === "success") {
              console.log("Upload successful:", result.info);
              handleUploadSuccess(result.info);
            } else if (result && result.event === "close") {
              console.log("Widget closed");
            }
          }
        );

        widgetInitializedRef.current = true;
        setStatus("ready");
      } catch (error) {
        console.error("Failed to create widget:", error);
        setStatus("error");
        setErrorMessage("Failed to initialize upload widget");
      }
    };

    // Load script if not already loaded
    if (window.cloudinary) {
      loadWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.id = "cloudinary-script";

      script.onload = () => {
        // Give it a moment to initialize
        setTimeout(loadWidget, 100);
      };
      
      script.onerror = () => {
        if (!mountedRef.current) return;
        setStatus("error");
        setErrorMessage("Failed to load Cloudinary upload widget");
      };

      // Check if script already exists
      if (!document.getElementById("cloudinary-script")) {
        document.body.appendChild(script);
      } else {
        // Script already exists, just initialize
        setTimeout(loadWidget, 100);
      }
    }

    return () => {
      mountedRef.current = false;
      // Don't destroy widget on cleanup if we want to reuse it
      // Only destroy on actual component unmount
      widgetInitializedRef.current = false;
    };
  }, [handleUploadSuccess]); // Only depend on the memoized callback

  const openWidget = () => {
    if (!widgetRef.current) {
      setStatus("error");
      setErrorMessage("Upload widget not ready. Refresh the page.");
      return;
    }
    
    try {
      widgetRef.current.open();
    } catch (error) {
      console.error("Error opening widget:", error);
      setStatus("error");
      setErrorMessage("Failed to open upload widget. Please refresh.");
    }
  };

  return (
    <div className="text-center space-y-2">
      <button
        type="button"
        onClick={openWidget}
        disabled={status !== "ready"}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition
          ${
            status === "ready"
              ? "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
      >
        <Upload className="h-4 w-4" />
        {status === "loading" && "Loading..."}
        {status === "ready" && "Upload Photos / Video"}
        {status === "error" && "Upload Error"}
      </button>

      {status === "loading" && (
        <p className="text-xs text-gray-500">
          Initializing upload widget...
        </p>
      )}

      {status === "ready" && (
        <p className="text-xs text-gray-500">
          Upload up to 5 images or videos
        </p>
      )}

      {status === "error" && (
        <div className="flex items-start justify-center gap-2 text-xs text-red-600 max-w-sm mx-auto">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p className="whitespace-pre-line text-left">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}