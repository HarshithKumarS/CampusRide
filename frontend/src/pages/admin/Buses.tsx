import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search, X, Loader2 } from 'lucide-react';

interface BusObj {
  id: number;
  bus_number: string;
  capacity: number;
  plate_number: string;
  status: string; // 'active', 'maintenance', 'inactive'
  driver_id: number | null;
  driver_name: string | null;
}

interface Driver {
  id: number;
  name: string;
}

const Buses: React.FC = () => {
  const [buses, setBuses] = useState<BusObj[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusObj | null>(null);
  
  // Form states
  const [busNumber, setBusNumber] = useState('');
  const [capacity, setCapacity] = useState(40);
  const [plateNumber, setPlateNumber] = useState('');
  const [status, setStatus] = useState('active');
  const [driverId, setDriverId] = useState<number | ''>('');

  const fetchData = async () => {
    try {
      const [busesRes, driversRes] = await Promise.all([
        api.get('/buses'),
        api.get('/drivers')
      ]);
      setBuses(busesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error('Error fetching buses/drivers', err);
      setError('Failed to load fleet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBus(null);
    setBusNumber('');
    setCapacity(40);
    setPlateNumber('');
    setStatus('active');
    setDriverId('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (bus: BusObj) => {
    setEditingBus(bus);
    setBusNumber(bus.bus_number);
    setCapacity(bus.capacity);
    setPlateNumber(bus.plate_number);
    setStatus(bus.status);
    setDriverId(bus.driver_id || '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      bus_number: busNumber,
      capacity,
      plate_number: plateNumber,
      status,
      driver_id: driverId === '' ? null : driverId
    };

    try {
      if (editingBus) {
        // Edit API
        const res = await api.put(`/buses/${editingBus.id}`, payload);
        setBuses(buses.map(b => b.id === editingBus.id ? res.data : b));
      } else {
        // Create API
        const res = await api.post('/buses', payload);
        setBuses([...buses, res.data]);
      }
      setModalOpen(false);
      fetchData(); // Reload to sync driver names correctly
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bus? Active journey tracks will be removed.')) return;
    try {
      await api.delete(`/buses/${id}`);
      setBuses(buses.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete bus.');
    }
  };

  const filteredBuses = buses.filter(b => 
    b.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-extrabold tracking-tight">Bus Fleet Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View, register, and allocate shuttle drivers to university buses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Add Bus</span>
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
              placeholder="Search by bus number, plate, or driver..."
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
                <th className="px-6 py-4">Bus Code</th>
                <th className="px-6 py-4">Plate Number</th>
                <th className="px-6 py-4 text-center">Capacity</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
              {filteredBuses.length > 0 ? (
                filteredBuses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400">
                      Bus {b.bus_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">{b.plate_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold">{b.capacity} Seats</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{b.driver_name || 'TBD'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        b.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                          : b.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-450'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 inline-flex items-center space-x-0.5 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No registered shuttle buses found.
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
              <h3 className="text-xl font-bold">{editingBus ? 'Edit Bus Details' : 'Register Fleet Bus'}</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bus Code</label>
                  <input
                    type="text"
                    required
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="B01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Plate Registration</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="DL-1Y-XXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fleet Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Allocate Driver</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Choose Driver (Unallocated) --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
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
                  <span>Save Bus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Buses;
