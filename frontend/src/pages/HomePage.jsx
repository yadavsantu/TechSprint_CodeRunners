

import { useState, useEffect } from "react";
import { Camera, Phone, X, Check, Upload } from "lucide-react";
import CloudinaryUploadWidget from "../components/CloudinaryWidget";
import GoogleMap from "../components/GoogleMap";


const SimpleReportForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    contactNumber: "",
  });

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------------ Location ------------------ */
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({
          lat,
          lng,
          address: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
        });
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  }, []);

  /* ------------------ Cloudinary ------------------ */
  const handleCloudinaryUpload = (result) => {
    if (uploadedImages.length >= 5) return;

    setUploadedImages((prev) => [
      ...prev,
      {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        thumbnail: result.thumbnail_url,
      },
    ]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      alert("Location required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      description: formData.description,
      phoneNumber: formData.contactNumber,
      location: {
        latitude: location.lat,
        longitude: location.lng,
        source: "gps",
      },
      images: uploadedImages.map((img) => ({
        url: img.url,
        public_id: img.publicId,
        format: img.format,
      })),
    };

    try {
      await submitReport(payload);
      alert("Report submitted successfully");
      setFormData({ description: "", contactNumber: "" });
      setUploadedImages([]);
    } catch (err) {
      alert("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Rapid Response. Save lives wit one tap.
          </h1>
          <p className="text-gray-600">
            Submit essential information for immediate response
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Upload Section */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="text-blue-600" />
                <div>
                  <h2 className="font-semibold">Upload Photos</h2>
                  <p className="text-sm text-gray-500">
                    Max 5 clear photos
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50">
                <Upload className="text-gray-400 mb-2" />
                <CloudinaryUploadWidget
                  onUploadSuccess={handleCloudinaryUpload}
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img.thumbnail || img.url}
                        className="rounded-lg object-cover aspect-square"
                      />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-2">Incident Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the incident..."
                className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Contact */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <Phone className="text-green-600" />
                Contact Number
              </h2>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+977XXXXXXXX"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Map */}
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <GoogleMap />
            </div>

            {/* Submit */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-xl p-6 shadow-sm">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.description ||
                  !formData.contactNumber
                }
                className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>

              <p className="text-xs text-center mt-4 text-gray-600">
                <span className="text-red-600 font-semibold">Emergency?</span>{" "}
 
                Call 100 / 102 immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleReportForm;