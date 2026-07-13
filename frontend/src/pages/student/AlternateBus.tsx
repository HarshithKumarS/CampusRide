import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Bus, ArrowRightLeft, CheckCircle2, Trash2 } from 'lucide-react';

interface AlternateRequest {
  id: number;
  original_bus_number: string;
  requested_bus_number: string;
  booking_date: string;
  reason: string;
  status: string;
}

interface BusObj {
  id: number;
  bus_number: string;
}

const AlternateBus: React.FC = () => {
  const [requests, setRequests] = useState<AlternateRequest[]>([]);
  const [buses, setBuses] = useState<BusObj[]>([]);
  
  // Form input
  const [requestedBusId, setRequestedBusId] = useState<number | ''>('');
  const [bookingDate, setBookingDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [reqsRes, busesRes] = await Promise.all([
        api.get('/alternate-bus'),
        api.get('/buses')
      ]);
      setRequests(reqsRes.data);
      setBuses(busesRes.data.filter((b: any) => b.status === 'active'));
    } catch (err) {
      console.error('Error loading alternate requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/alternate-bus', {
        requested_bus_id: requestedBusId,
        booking_date: bookingDate,
        reason
      });
      setSuccess('Alternate bus request submitted successfully. Awaiting admin approval.');
      setReason('');
      setRequestedBusId('');
      setBookingDate('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request. Verify you have a reservation for this date.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this pending alternate bus request?')) return;
    try {
      await api.delete(`/alternate-bus/${id}`);
      setRequests(requests.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete request.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Temporary Bus Assignment</h1>
        <p className="text-slate-500 dark:text-slate-400">Request an alternate bus for a specific date if you need to board from a different route stop.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 mr-1" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Request Form (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Submit Request</h3>
            
            <form onSubmit={handleRequest} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                  <Bus className="h-4 w-4 mr-1.5 text-slate-400" />
                  Target Alternate Bus
                </label>
                <select
                  required
                  value={requestedBusId}
                  onChange={(e) => setRequestedBusId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Choose Bus --</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>Bus {b.bus_number}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason for alternate commute</label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Need to board from Sector 15 instead of depot today..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>

            </form>
          </div>
        </div>

        {/* Alternate Requests Logs (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <ArrowRightLeft className="h-5 w-5 mr-2 text-blue-600" />
              Request Dispatch Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Commute Date</th>
                    <th className="px-6 py-4">Original Bus</th>
                    <th className="px-6 py-4">Requested Bus</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {requests.length > 0 ? (
                    requests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{new Date(r.booking_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-450">Bus {r.original_bus_number}</td>
                        <td className="px-6 py-4 font-bold text-blue-650 dark:text-blue-400">Bus {r.requested_bus_number}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{r.reason}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            r.status === 'approved'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                              : r.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {r.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No alternate bus requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlternateBus;
