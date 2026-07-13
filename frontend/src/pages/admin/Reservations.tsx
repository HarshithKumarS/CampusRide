import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, Trash2, CheckCircle2, XCircle, Search, ArrowRightLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Reservation {
  id: number;
  student_id: number;
  student_name: string;
  bus_id: number;
  bus_number: string;
  route_name: string;
  seat_number: number;
  booking_date: string;
  status: string;
  created_at: string;
}

interface AlternateRequest {
  id: number;
  student_name: string;
  original_bus_number: string;
  requested_bus_number: string;
  booking_date: string;
  reason: string;
  status: string;
}

const Reservations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'alternate'>('bookings');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [alternateRequests, setAlternateRequests] = useState<AlternateRequest[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actingRequestId, setActingRequestId] = useState<number | null>(null);

  const fetchAllData = async () => {
    try {
      const [resRes, altRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/alternate-bus')
      ]);
      setReservations(resRes.data.sort((a: any, b: any) => b.id - a.id));
      setAlternateRequests(altRes.data.sort((a: any, b: any) => b.id - a.id));
    } catch (err) {
      console.error('Error fetching admin bookings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCancelReservation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this student booking?')) return;
    setCancellingId(id);
    try {
      await api.delete(`/reservations/${id}`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleAlterationDecision = async (id: number, decision: 'approved' | 'rejected') => {
    setActingRequestId(id);
    try {
      await api.put(`/alternate-bus/${id}`, { status: decision });
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Action failed.');
    } finally {
      setActingRequestId(null);
    }
  };

  const filteredReservations = reservations.filter(r => 
    r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bus_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.route_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlternates = alternateRequests.filter(r => 
    r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.original_bus_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.requested_bus_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Commute Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400">View and approve student seats and temporary bus assignments.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('bookings'); setSearchTerm(''); }}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Daily Seat Bookings
        </button>
        <button
          onClick={() => { setActiveTab('alternate'); setSearchTerm(''); }}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'alternate'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Alternate Bus Requests</span>
        </button>
      </div>

      {/* Filter and Table container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4">
        
        {/* Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'bookings' ? "Search student, bus, route..." : "Search student, bus..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* View render */}
        {activeTab === 'bookings' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Booking Date</th>
                  <th className="px-6 py-4">Bus</th>
                  <th className="px-6 py-4 text-center">Seat</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{res.student_name || 'TBD'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(res.booking_date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400">Bus {res.bus_number}</td>
                      <td className="px-6 py-4 text-center font-bold">#{res.seat_number}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{res.route_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
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
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={cancellingId === res.id}
                            className="text-red-600 hover:text-red-950 dark:hover:text-red-400 font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Alternate Bus Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Original Bus</th>
                  <th className="px-6 py-4">Requested Bus</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredAlternates.length > 0 ? (
                  filteredAlternates.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{req.student_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(req.booking_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-450">Bus {req.original_bus_number}</td>
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">Bus {req.requested_bus_number}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          req.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {req.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              disabled={actingRequestId === req.id}
                              onClick={() => handleAlterationDecision(req.id, 'approved')}
                              className="text-green-600 hover:text-green-800 dark:hover:text-green-400 font-bold flex items-center space-x-0.5 cursor-pointer"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              disabled={actingRequestId === req.id}
                              onClick={() => handleAlterationDecision(req.id, 'rejected')}
                              className="text-red-600 hover:text-red-800 dark:hover:text-red-400 font-bold flex items-center space-x-0.5 cursor-pointer"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No alternate bus requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reservations;
