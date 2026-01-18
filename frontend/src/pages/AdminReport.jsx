import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  FileText, Download, Filter, Calendar, Users, AlertCircle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, MapPin, Clock, ChevronRight, Search, RefreshCw, Eye,
  BarChart3, PieChart as PieChartIcon, FileBarChart, DownloadCloud
} from 'lucide-react';
import { getAllAccidentReports } from '../services/accidentReport';
import SmallMapPreview from '../components/SmallMapPreview';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('table'); 

  // Fetch reports
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllAccidentReports();
      const sortedReports = res.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sortedReports);
      setFilteredReports(sortedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...reports];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report =>
        report.description?.toLowerCase().includes(term) ||
        report.phoneNumber?.includes(term) ||
        report.location?.address?.toLowerCase().includes(term) ||
        report._id.toLowerCase().includes(term)
      );
    }

    // Date range filter
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
        break;
      default:
        break;
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, searchTerm, dateRange]);

  // Calculate statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'reported').length,
    accepted: reports.filter(r => r.status === 'accepted').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
    today: reports.filter(r => {
      const today = new Date();
      const reportDate = new Date(r.createdAt);
      return reportDate.toDateString() === today.toDateString();
    }).length,
    week: reports.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) >= weekAgo;
    }).length,
  };

  const trendData = reports.reduce((acc, report) => {
    const date = new Date(report.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count++;
    return acc;
  }, {});

  const trendChartData = Object.values(trendData).slice(-14);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Accepted', value: stats.accepted, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
  ];

  // Hourly distribution
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourReports = reports.filter(report => {
      const reportHour = new Date(report.createdAt).getHours();
      return reportHour === hour;
    });
    return {
      hour: `${hour}:00`,
      reports: hourReports.length,
    };
  });

  // Monthly distribution
  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthReports = reports.filter(report => {
      const reportMonth = new Date(report.createdAt).getMonth();
      return reportMonth === month;
    });
    return {
      month: new Date(2024, month).toLocaleDateString('en-US', { month: 'short' }),
      reports: monthReports.length,
    };
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Export data
  const exportToCSV = () => {
    const headers = ['ID', 'Description', 'Status', 'Phone', 'Address', 'Date', 'Images'];
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(report => [
        `"${report._id}"`,
        `"${report.description || ''}"`,
        `"${report.status}"`,
        `"${report.phoneNumber || ''}"`,
        `"${report.location?.address || ''}"`,
        `"${formatDate(report.createdAt)}"`,
        `"${report.images?.length || 0}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-24 flex flex-col justify-center">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-3xl text-white">Accident Reports Analytics</h1>
              <p className="text-blue-100 mt-1">Comprehensive insights and statistics</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchReports}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
              >
                <DownloadCloud size={18} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: 'Total Reports',
              value: stats.total,
              icon: FileBarChart,
              color: 'from-blue-500 to-blue-600',
              trend: '+12%'
            },
            {
              title: 'Pending',
              value: stats.pending,
              icon: AlertCircle,
              color: 'from-yellow-500 to-amber-600',
              trend: '+5%'
            },
            {
              title: 'Accepted',
              value: stats.accepted,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-600',
              trend: '+8%'
            },
            {
              title: 'Rejected',
              value: stats.rejected,
              icon: XCircle,
              color: 'from-red-500 to-rose-600',
              trend: '-3%'
            },
            {
              title: 'Today',
              value: stats.today,
              icon: TrendingUp,
              color: 'from-purple-500 to-violet-600',
              trend: '+15%'
            }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <stat.icon className="text-white" size={24} />
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-white/90 mb-2">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <PieChartIcon className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Status Distribution</h3>
              </div>
              <div className="text-sm text-gray-500">
                {reports.length} total reports
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Reports']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports Trend Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Reports Trend (14 Days)</h3>
              </div>
              <select 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Reports"
                    stroke="#3b82f6" 
                    fill="#93c5fd" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Clock className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Hourly Distribution</h3>
              </div>
              <div className="text-sm text-gray-500">
                Peak hours: 8AM - 6PM
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="reports" 
                    name="Reports"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reports List Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Filters and Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h3 className="font-bold text-2xl text-gray-900">All Reports</h3>
                <p className="text-gray-500 mt-1">
                  {filteredReports.length} reports found
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="reported">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    className={`px-4 py-2.5 ${viewType === 'table' ? 'bg-blue-50 text-blue-600 border-r border-gray-300' : 'text-gray-600'}`}
                    onClick={() => setViewType('table')}
                  >
                    Table
                  </button>
                  <button
                    className={`px-4 py-2.5 ${viewType === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setViewType('grid')}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Table/Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports found matching your filters</p>
              </div>
            ) : viewType === 'table' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr 
                        key={report._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {report.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {report.location?.address || 'No address'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div 
                    key={report._id} 
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Map Preview */}
                    {report.location?.latitude && report.location?.longitude ? (
                      <div className="h-48">
                        <SmallMapPreview
                          latitude={report.location.latitude}
                          longitude={report.location.longitude}
                          address={report.location.address || ''}
                          zoom={13}
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <MapPin className="text-gray-400" size={32} />
                      </div>
                    )}
                    
                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {report.description?.substring(0, 80) || 'No description'}...
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {report.location?.address?.substring(0, 60) || 'No location'}...
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {report.phoneNumber || 'No phone'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-2xl text-gray-900">Report Details</h3>
                <p className="text-gray-500 text-sm mt-1">
                  ID: {selectedReport._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                      {selectedReport.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Location Details</h4>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl">
                      <p className="font-medium text-gray-900 mb-2">
                        {selectedReport.location?.address || 'No address'}
                      </p>
                      {selectedReport.location?.latitude && selectedReport.location?.longitude && (
                        <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-300">
                          <SmallMapPreview
                            latitude={selectedReport.location.latitude}
                            longitude={selectedReport.location.longitude}
                            address={selectedReport.location.address || ''}
                            zoom={15}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-block ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Phone</h4>
                      <p className="font-bold text-gray-900">{selectedReport.phoneNumber}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Submitted</h4>
                      <p className="font-medium text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Images</h4>
                      <p className="font-bold text-gray-900">{selectedReport.images?.length || 0}</p>
                    </div>
                  </div>
                  
                  {selectedReport.images?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Accident Images</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedReport.images.map((img, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                            <img
                              src={img.url}
                              alt={`Accident ${idx + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;