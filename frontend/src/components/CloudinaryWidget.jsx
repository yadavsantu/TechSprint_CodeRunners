import React, { useEffect, useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";

export default function CloudinaryUploadWidget({ onUploadSuccess }) {
  const widgetRef = useRef(null);
  const mountedRef = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    mountedRef.current = true;
     setStatus("loading");

    // ✅ VITE ENV VARIABLES
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

      // Destroy old widget if exists
      if (widgetRef.current) {
        try {
          widgetRef.current.destroy();
        } catch (e) {
          console.warn("Widget destroy failed", e);
        }
        widgetRef.current = null;
      }

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
        },
        (error, result) => {
          if (!mountedRef.current) return;

          if (error) {
            setStatus("error");
            setErrorMessage(error.message || "Upload failed");
            return;
          }

          if (result?.event === "success") {
            onUploadSuccess?.(result.info);
          }
        }
      );

      setStatus("ready");
    };

    // Load script if not already loaded
    if (window.cloudinary) {
      setTimeout(loadWidget, 100);
    } else {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;

      script.onload = () => setTimeout(loadWidget, 200);
      script.onerror = () => {
        if (!mountedRef.current) return;
        setStatus("error");
        setErrorMessage("Failed to load Cloudinary upload widget");
      };

      document.body.appendChild(script);
    }

    return () => {
      mountedRef.current = false;
      if (widgetRef.current) {
        try {
          widgetRef.current.destroy();
        } catch {}
      }
    };
  }, [onUploadSuccess]);

  const openWidget = () => {
    if (!widgetRef.current) {
      setStatus("error");
      setErrorMessage("Upload widget not ready. Refresh the page.");
      return;
    }
    widgetRef.current.open();
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