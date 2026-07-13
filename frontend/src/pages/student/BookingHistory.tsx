import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface Reservation {
  id: number;
  bus_id: number;
  bus_number: string;
  route_name: string;
  seat_number: number;
  booking_date: string;
  status: string;
  created_at: string;
}

const BookingHistory: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/reservations');
      // Sort reservations by date desc
      setReservations(res.data.sort((a: any, b: any) => b.id - a.id));
    } catch (err) {
      console.error('Error fetching history', err);
      setError('Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancel = async (id: number) => {
    setError('');
    setSuccess('');
    setCancellingId(id);

    try {
      await api.delete(`/reservations/${id}`);
      setSuccess('Reservation cancelled successfully.');
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
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
        <h1 className="text-3xl font-extrabold tracking-tight">Booking History</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage all your past and active seat reservations.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Booking Date</th>
                <th className="px-6 py-4">Bus</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4 text-center">Seat</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
              {reservations.length > 0 ? (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{new Date(res.booking_date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">
                      Bus {res.bus_number}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{res.route_name}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap font-bold">#{res.seat_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        res.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {res.status === 'active' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            <span>Cancelled</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {res.status === 'active' && (
                        <button
                          onClick={() => handleCancel(res.id)}
                          disabled={cancellingId === res.id}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{cancellingId === res.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No reservation records found for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
