import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, 
  FileText, Clock, CheckCircle, AlertCircle,
  Edit, LogOut, TrendingUp, Shield, Bell, Loader
} from "lucide-react";
import { getUserProfile, getUserReports } from "../services/user";

const UserDashboard = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
    avatar: null
  });

  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both profile and reports in parallel
      const [profileData, reportsData] = await Promise.all([
        getUserProfile(),
        getUserReports()
      ]);
      
      // Map API response to component state
      setUserData({
        name: profileData.name || profileData.fullName || "User",
        email: profileData.email || "",
        phone: profileData.phone || profileData.phoneNumber || "",
        address: profileData.address || profileData.location || "Not provided",
        joinDate: profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "",
        avatar: profileData.avatar || profileData.profileImage || null
      });
      
      // Handle different response structures
      setReports(reportsData.reports || reportsData || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Your logout logic here
    // await logout();
    // navigate to login
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
    // API call to update profile
  };

  // Calculate stats directly from reports array using .length
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    inProgressReports: reports.filter(r => r.status === 'in-progress' || r.status === 'in_progress').length,
  };

  // Get recent reports (last 3)
  const recentReports = reports.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress':
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Rapid<span className="text-red-600">Response</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {userData.name || "User"}!
              </h1>
              <p className="text-blue-100">
                Thank you for helping make our community safer. Your reports matter.
              </p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Submit New Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                    {userData.avatar ? (
                      <img 
                        src={userData.avatar} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-blue-600" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{userData.name || "User"}</h2>
                <p className="text-gray-500">Verified Citizen</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium truncate">{userData.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{userData.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{userData.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{userData.joinDate || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Your Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reports Submitted</span>
                  <span className="font-bold text-blue-600">{stats.totalReports}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lives Potentially Saved</span>
                  <span className="font-bold text-green-600">{stats.totalReports * 2}+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time Avg</span>
                  <span className="font-bold text-purple-600">8.2 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Analytics & Reports */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold">{stats.totalReports}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Total Reports</h3>
                <p className="text-sm text-gray-500">All reports submitted</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold">{stats.pendingReports}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Pending</h3>
                <p className="text-sm text-gray-500">Awaiting response</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold">{stats.resolvedReports}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Resolved</h3>
                <p className="text-sm text-gray-500">Successfully handled</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold">{stats.inProgressReports}</span>
                </div>
                <h3 className="font-semibold text-gray-900">In Progress</h3>
                <p className="text-sm text-gray-500">Currently being handled</p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'reports'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Reports
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'activity'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Activity Log
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    {recentReports.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No reports yet</p>
                        <p className="text-sm text-gray-400 mt-1">Submit your first report to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentReports.map((report) => (
                          <div key={report.id || report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{report.type || report.incidentType || "Report"}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                  <span className="flex items-center space-x-1">
                                    {getStatusIcon(report.status)}
                                    <span>{report.status}</span>
                                  </span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{report.description || "No description"}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {report.location || "Unknown location"}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {report.date ? new Date(report.date).toLocaleDateString() : 
                                   report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown date"}
                                </span>
                              </div>
                            </div>
                            <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">All Reports</h3>
                    {reports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No reports found</p>
                        <p className="text-sm text-gray-400 mt-2">Start by submitting your first emergency report</p>
                        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Submit Report
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((report) => (
                              <tr key={report.id || report._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {report.date ? new Date(report.date).toLocaleDateString() : 
                                     report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {report.type || report.incidentType || "Report"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{report.location || "Unknown"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                    {report.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                                    View
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h3>
                    {reports.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No activity yet</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reports.slice(0, 5).map((report, index) => (
                          <div key={report.id || report._id} className="flex items-start space-x-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              {index < Math.min(reports.length - 1, 4) && <div className="w-0.5 h-12 bg-gray-200"></div>}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Submitted {report.type || report.incidentType || "a report"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown date"} • 
                                {report.createdAt ? ` ${new Date(report.createdAt).toLocaleTimeString()}` : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Section */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Emergency?</h3>
                  <p className="text-red-100">
                    Don't hesitate to call emergency services directly
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">100 / 102</div>
                  <p className="text-sm text-red-100">Emergency Numbers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;