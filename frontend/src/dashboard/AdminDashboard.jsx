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
} from "lucide-react";

import {
  getAllAccidentReports,
  acceptReport,
  rejectReport,
} from "../services/accidentReport";

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
      // Update the reports state
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "accepted" } : r))
      );
      // Update selected report if it's the one being accepted
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
      // Update the reports state
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
      );
      // Update selected report if it's the one being rejected
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
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      reported: "bg-yellow-100 text-yellow-700",
    }[status]);

  const formatDate = (d) => new Date(d).toLocaleString();

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" />
            <div>
              <h1 className="font-bold">Accident Reports Admin</h1>
              <p className="text-xs text-gray-500">
                Manage and verify accident reports
              </p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw className={`${loading ? "animate-spin" : ""}`} size={16} />
            Refresh
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Total Reports", stats.total, "text-gray-900"],
            ["Pending", stats.pending, "text-yellow-600"],
            ["Accepted", stats.accepted, "text-green-600"],
            ["Rejected", stats.rejected, "text-red-600"],
          ].map(([label, value, colorClass]) => (
            <div key={label} className="bg-white p-4 rounded border shadow">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              className="pl-10 w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="flex items-center gap-2 border px-4 rounded hover:bg-gray-50"
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LIST */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Loading reports...
                </h3>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Error loading reports
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchReports}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                  className="bg-white border rounded p-4 cursor-pointer hover:shadow transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <p className="text-gray-600 mt-1">{r.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {r.location?.address || "No address"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {formatDate(r.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {r.phoneNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColor(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                      
                      {r.status === "reported" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(r._id);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(r._id);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DETAILS */}
          <div>
            {selectedReport ? (
              <div className="bg-white border rounded p-6 space-y-4 sticky top-6">
                <h2 className="font-bold text-gray-900">Report Details</h2>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="p-2 bg-gray-50 rounded">{selectedReport.description || "No description provided"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                    <p className="font-medium">{selectedReport.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <p className="font-medium">{selectedReport.location?.address || "No address"}</p>
                  {selectedReport.location?.latitude && selectedReport.location?.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {selectedReport.location.latitude}, Lng: {selectedReport.location.longitude}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                  <p>{formatDate(selectedReport.createdAt)}</p>
                </div>

                {/* IMAGES */}
                {selectedReport.images?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Accident Images</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedReport.images.map((img) => (
                        <div
                          key={img._id}
                          onClick={() => setPreviewImage(img.url)}
                          className="border rounded cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <img
                            src={img.url}
                            alt="Accident"
                            className="w-full h-48 object-contain bg-gray-100 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS FOR SELECTED REPORT */}
                {selectedReport.status === "reported" && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleAccept(selectedReport._id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept Report
                    </button>
                    <button
                      onClick={() => handleReject(selectedReport._id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border rounded p-6 text-center">
                <AlertCircle className="mx-auto mb-2 text-gray-400" size={48} />
                <p className="font-semibold text-gray-900 mb-1">Select a Report</p>
                <p className="text-gray-500 text-sm">
                  Click on any report to view detailed information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="object-contain rounded shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
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