import { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  MapPin,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Download,
  RefreshCw,
  Navigation,
} from "lucide-react";

import {
  getAllAccidentReports,
  acceptReport,
  rejectReport,
} from "../services/accidentReport";

// Import the SmallMapPreview component
import SmallMapPreview from "../components/SmallMapPreview";

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------------- STATS ---------------- */
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "reported").length,
    accepted: reports.filter((r) => r.status === "accepted").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  /* ---------------- FETCH ---------------- */
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllAccidentReports();

      const enriched = res.data.map((r) => ({
        ...r,
        title: r.description
          ? r.description.slice(0, 50) + (r.description.length > 50 ? "..." : "")
          : `Report from ${r.phoneNumber}`,
      }));

      setReports(enriched);
      setFilteredReports(enriched);
    } catch (err) {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* ---------------- FILTER ---------------- */
  useEffect(() => {
    let data = [...reports];

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      data = data.filter(
        (r) =>
          r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.phoneNumber?.includes(searchTerm) ||
          r.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(data);
  }, [searchTerm, statusFilter, reports]);

  /* ---------------- ACTIONS ---------------- */
  const handleAccept = async (id) => {
    try {
      await acceptReport(id);
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "accepted" } : r))
      );
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport(prev => ({ ...prev, status: "accepted" }));
      }
      alert("Report accepted successfully!");
    } catch (err) {
      console.error("Error accepting report:", err);
      alert(err.message || "Failed to accept report");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReport(id);
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
      );
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport(prev => ({ ...prev, status: "rejected" }));
      }
      alert("Report rejected successfully!");
    } catch (err) {
      console.error("Error rejecting report:", err);
      alert(err.message || "Failed to reject report");
    }
  };

  /* ---------------- EXPORT ---------------- */
  const handleExport = () => {
    const data = JSON.stringify(filteredReports, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accident-reports-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    alert("Reports exported successfully!");
  };

  /* ---------------- HELPERS ---------------- */
  const statusColor = (status) =>
    ({
      accepted: "bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500",
      rejected: "bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500",
      reported: "bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500",
    }[status]);

  const formatDate = (d) => new Date(d).toLocaleString();

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">Accident Reports Admin</h1>
              <p className="text-blue-100">
                Manage and verify accident reports
              </p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`${loading ? "animate-spin" : ""}`} size={18} />
            Refresh
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            ["Total Reports", stats.total, "bg-gradient-to-br from-blue-500 to-blue-600"],
            ["Pending", stats.pending, "bg-gradient-to-br from-yellow-500 to-orange-500"],
            ["Accepted", stats.accepted, "bg-gradient-to-br from-green-500 to-emerald-600"],
            ["Rejected", stats.rejected, "bg-gradient-to-br from-red-500 to-pink-600"],
          ].map(([label, value, bgClass]) => (
            <div 
              key={label} 
              className={`${bgClass} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <p className="text-sm font-medium text-white/90 mb-2">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-blue-400" size={20} />
              <input
                className="pl-12 w-full border-2 border-blue-100 rounded-xl p-3.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-blue-50/50"
                placeholder="Search reports by description, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border-2 border-purple-100 rounded-xl p-3.5 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-purple-50/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="reported">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg"
            >
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* REPORTS LIST */}
          <div className="lg:col-span-2 space-y-5">
            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
                <RefreshCw className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Loading reports...
                </h3>
              </div>
            ) : error ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Error loading reports
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchReports}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No reports found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              filteredReports.map((r) => (
                <div
                  key={r._id}
                  onClick={() => setSelectedReport(r)}
                  className={`bg-white rounded-2xl p-5 cursor-pointer border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    selectedReport?._id === r._id ? 'border-blue-400 ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} /> {formatDate(r.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{r.title}</h3>
                      <p className="text-gray-600 mb-4">{r.description}</p>
                      
                      <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                          <MapPin size={14} className="text-blue-500" />
                          {r.location?.address || "No address"}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                          <Users size={14} className="text-purple-500" />
                          {r.phoneNumber}
                        </span>
                      </div>
                    </div>
                    
                    {/* RIGHT SIDE WITH MAP AND ACTIONS */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Small Map Preview */}
                      {r.location?.longitude && r.location?.latitude ? (
                        <div className="w-48 h-32 mb-2">
                          <SmallMapPreview
                            latitude={r.location.latitude}
                            longitude={r.location.longitude}
                            address={r.location?.address || ""}
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-32 rounded-lg border border-gray-300 bg-gray-100 flex flex-col items-center justify-center p-3">
                          <Navigation className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 text-center">No location data</span>
                        </div>
                      )}
                      
                      {/* Status badge and action buttons */}
                      <div className="flex flex-col items-end gap-2">
                        {r.status === "reported" && (
                          <div className="flex gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(r._id);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(r._id);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DETAILS SIDEBAR */}
          <div>
            {selectedReport ? (
              <div className="bg-white rounded-2xl p-6 space-y-6 sticky top-6 shadow-xl border border-gray-100">
                <div className="pb-4 border-b border-gray-200">
                  <h2 className="font-bold text-2xl text-gray-800">Report Details</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: {selectedReport._id}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Description
                  </h3>
                  <p className="text-gray-700">{selectedReport.description || "No description provided"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100/50 p-4 rounded-xl border border-green-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Phone Number</h3>
                    <p className="font-bold text-gray-900">{selectedReport.phoneNumber}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Location
                  </h3>
                  <p className="font-medium text-gray-900 mb-1">{selectedReport.location?.address || "No address"}</p>
                  {selectedReport.location?.latitude && selectedReport.location?.longitude ? (
                    <div className="mt-3 h-64 rounded-lg overflow-hidden border border-gray-300">
                      <SmallMapPreview
                        latitude={selectedReport.location.latitude}
                        longitude={selectedReport.location.longitude}
                        address={selectedReport.location?.address || ""}
                        zoom={15}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No coordinates available</p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Submitted
                  </h3>
                  <p className="text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>

                {/* IMAGES */}
                {selectedReport.images?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Accident Images</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedReport.images.map((img) => (
                        <div
                          key={img._id}
                          onClick={() => setPreviewImage(img.url)}
                          className="border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden bg-gray-50"
                        >
                          <img
                            src={img.url}
                            alt="Accident"
                            className="w-full h-48 object-cover"
                          />
                          <p className="text-xs text-gray-500 p-3 bg-white/80 backdrop-blur-sm">Click to enlarge image</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {selectedReport.status === "reported" && (
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleAccept(selectedReport._id)}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-xl font-bold flex items-center justify-center gap-3"
                    >
                      <CheckCircle size={20} />
                      Accept Report
                    </button>
                    <button
                      onClick={() => handleReject(selectedReport._id)}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:shadow-xl font-bold flex items-center justify-center gap-3"
                    >
                      <XCircle size={20} />
                      Reject Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center border-2 border-dashed border-blue-200 shadow-lg">
                <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="text-white" size={32} />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-2">Select a Report</p>
                <p className="text-gray-600">
                  Click on any report from the list to view detailed information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-3 hover:from-red-600 hover:to-red-700 transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;