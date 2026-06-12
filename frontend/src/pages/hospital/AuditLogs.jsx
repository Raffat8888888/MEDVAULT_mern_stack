import React, { useEffect, useState } from "react";
import axios from "axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    role: '',
    dateRange: 'all'
  });
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filters]);

  const fetchLogs = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await axios.get("http://localhost:5000/api/auditlogs");
    setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    setError("Failed to fetch audit logs. Please try again.");
    setLogs([]);
  } finally {
    setLoading(false);
  }
};

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by action
    if (filters.action) {
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter(log => 
        log.performedBy?.role?.toLowerCase() === filters.role.toLowerCase()
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          cutoffDate = new Date(0); // No filter
      }

      filtered = filtered.filter(log => new Date(log.time) >= cutoffDate);
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      role: '',
      dateRange: 'all'
    });
  };

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const getUniqueRoles = () => {
    const roles = new Set();
    logs.forEach(log => {
      if (log.performedBy?.role) {
        roles.add(log.performedBy.role);
      }
    });
    return Array.from(roles);
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('add')) return 'text-green-600';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'text-red-600';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'text-blue-600';
    if (actionLower.includes('login') || actionLower.includes('access')) return 'text-purple-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>{error}
          <button 
            onClick={fetchLogs}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              type="text"
              placeholder="Search actions..."
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {getUniqueRoles().map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Logs</h3>
          <p className="text-2xl font-bold text-blue-900">{logs.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Filtered Results</h3>
          <p className="text-2xl font-bold text-green-900">{filteredLogs.length}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Unique Users</h3>
          <p className="text-2xl font-bold text-purple-900">
            {new Set(logs.map(log => log.performedBy?.name).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left border border-gray-300 font-semibold">Action</th>
                <th className="p-3 text-left border border-gray-300 font-semibold">Performed By</th>
                <th className="p-3 text-left border border-gray-300 font-semibold">Role</th>
                <th className="p-3 text-left border border-gray-300 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={`${log.time}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className={`p-3 border border-gray-300 font-medium ${getActionColor(log.action)}`}>
                      {log.action || 'Unknown Action'}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {log.performedBy?.name || 'Unknown User'}
                    </td>
                    <td className="p-3 border border-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.performedBy?.role || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-3 border border-gray-300 text-sm text-gray-600">
                      {formatTime(log.time)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    {logs.length === 0 ? 'No audit logs found' : 'No logs match your current filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length > 50 && (
        <div className="text-center text-gray-500 text-sm">
          Showing {filteredLogs.length} results. Consider using filters to narrow down the results.
        </div>
      )}
    </div>
  );
};

export default AuditLogs;