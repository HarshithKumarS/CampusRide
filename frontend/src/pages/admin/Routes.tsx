import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search, X, Loader2, Route as RouteIcon } from 'lucide-react';

interface RouteObj {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  schedule_time: string;
  stops: string[];
}

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteObj[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteObj | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [stopsString, setStopsString] = useState('');

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      setRoutes(res.data);
    } catch (err) {
      console.error('Error fetching routes', err);
      setError('Failed to fetch routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setName('');
    setStartLocation('');
    setEndLocation('');
    setScheduleTime('');
    setStopsString('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (route: RouteObj) => {
    setEditingRoute(route);
    setName(route.name);
    setStartLocation(route.start_location);
    setEndLocation(route.end_location);
    setScheduleTime(route.schedule_time);
    setStopsString(route.stops.join(', '));
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const stopsArray = stopsString.split(',').map(s => s.trim()).filter(s => s !== '');
    const payload = {
      name,
      start_location: startLocation,
      end_location: endLocation,
      schedule_time: scheduleTime,
      stops: stopsArray
    };

    try {
      if (editingRoute) {
        // Edit API
        const res = await api.put(`/routes/${editingRoute.id}`, payload);
        setRoutes(routes.map(r => r.id === editingRoute.id ? res.data : r));
      } else {
        // Create API
        const res = await api.post('/routes', payload);
        setRoutes([...routes, res.data]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this route? Active bookings associated will remain but routes references will clear.')) return;
    try {
      await api.delete(`/routes/${id}`);
      setRoutes(routes.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete route.');
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.end_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campus Bus Routes</h1>
          <p className="text-slate-500 dark:text-slate-400">View, create, and configure daily shuttle route stops.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Add Route</span>
        </button>
      </div>

      {/* Filter and Table container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4">
        
        {/* Search bar */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by route name, start or end destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Route Name</th>
                <th className="px-6 py-4">Commence point</th>
                <th className="px-6 py-4">End Destination</th>
                <th className="px-6 py-4">Departure Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <RouteIcon className="h-4 w-4 text-blue-500" />
                      <span>{r.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{r.start_location}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{r.end_location}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{r.schedule_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 inline-flex items-center space-x-0.5 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 inline-flex items-center space-x-0.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No registered campus routes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold">{editingRoute ? 'Edit Route Details' : 'Add New Shuttle Route'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Route Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Route A - North Campus Express"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Commence Point</label>
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Central Station Metro"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">End Destination</label>
                  <input
                    type="text"
                    required
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="North Campus Gate 4"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Departure Time</label>
                <input
                  type="text"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Route Stops (Comma-separated list)</label>
                <textarea
                  required
                  rows={3}
                  value={stopsString}
                  onChange={(e) => setStopsString(e.target.value)}
                  placeholder="Metro Hub, Sector 12 Gate, Engineering Block, Administration building"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center space-x-1 cursor-pointer"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Routes;
