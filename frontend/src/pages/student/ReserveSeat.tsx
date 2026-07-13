import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Ticket, Bus, Calendar, Route as RouteIcon, Info, CheckCircle2, Lock } from 'lucide-react';

interface Route {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  schedule_time: string;
  stops: string[];
}

interface BusObj {
  id: number;
  bus_number: string;
  capacity: number;
  plate_number: string;
  status: string;
}

const ReserveSeat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<BusObj[]>([]);
  
  // Selection states
  const [selectedRouteId, setSelectedRouteId] = useState<number | ''>('');
  const [selectedBusId, setSelectedBusId] = useState<number | ''>('');
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Default to tomorrow
  );
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [takenSeats, setTakenSeats] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch routes and buses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, busesRes] = await Promise.all([
          api.get('/routes'),
          api.get('/buses')
        ]);
        setRoutes(routesRes.data);
        setBuses(busesRes.data.filter((b: any) => b.status === 'active'));
      } catch (err) {
        console.error('Error fetching routes/buses', err);
        setError('Failed to load routes and buses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch taken seats when bus, route or date changes
  useEffect(() => {
    if (selectedBusId && selectedRouteId && bookingDate) {
      const fetchTakenSeats = async () => {
        try {
          const res = await api.get('/reservations/taken-seats', {
            params: {
              bus_id: selectedBusId,
              route_id: selectedRouteId,
              date: bookingDate
            }
          });
          setTakenSeats(res.data);
          setSelectedSeat(null); // Clear selected seat on update
          setError('');
        } catch (err: any) {
          console.error('Error fetching taken seats', err);
          setError('Failed to fetch seat layouts.');
        }
      };
      fetchTakenSeats();
    } else {
      setTakenSeats([]);
    }
  }, [selectedBusId, selectedRouteId, bookingDate]);

  const handleBooking = async () => {
    if (!selectedBusId || !selectedRouteId || !selectedSeat || !bookingDate) {
      setError('Please complete all selection fields first.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post('/reservations', {
        bus_id: selectedBusId,
        route_id: selectedRouteId,
        seat_number: selectedSeat,
        booking_date: bookingDate
      });
      setSuccess(`Seat #${selectedSeat} reserved successfully! Redirecting...`);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking reservation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isGirlsOrStaff = user ? (user.gender === 'female' || user.is_staff) : false;

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
        <h1 className="text-3xl font-extrabold tracking-tight">Reserve a Seat</h1>
        <p className="text-slate-500 dark:text-slate-400">Choose your designated route, bus, date, and select an available seat from the grid.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Setup form parameters (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Booking Parameters</h3>
            
            {/* Demographic info tag */}
            <div className="p-3 bg-blue-50 dark:bg-slate-850 rounded-2xl border border-blue-100 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-blue-600 dark:text-blue-400 block uppercase">Student Demographics</span>
              <div className="flex justify-between">
                <span>Gender: <strong className="capitalize">{user?.gender}</strong></span>
                <span>Type: <strong>{user?.is_staff ? 'Staff Member' : 'Student'}</strong></span>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                <RouteIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                Select Route
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Choose a Route --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.schedule_time})</option>
                ))}
              </select>
            </div>

            {/* Bus */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                <Bus className="h-4 w-4 mr-1.5 text-slate-400" />
                Select Bus
              </label>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">-- Choose a Bus --</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>Bus {b.bus_number}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]} // Cannot book past dates
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Selection info and confirm button */}
            {selectedSeat && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>You have selected <strong>Seat #{selectedSeat}</strong>. Confirm below to book. This seat will be used for both morning and evening journeys.</span>
                </div>
                
                <button
                  onClick={handleBooking}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {submitting ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Col: Seat Grid Mapper (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <h3 className="text-xl font-bold">Interactive Seat Map</h3>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span>Taken</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded bg-blue-600" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px]"><Lock className="h-2.5 w-2.5" /></div>
                  <span>Restricted</span>
                </div>
              </div>
            </div>

            {selectedBusId && selectedRouteId ? (
              <div className="space-y-8">
                {/* Simulated Bus Layout Grid */}
                <div className="max-w-md mx-auto border-4 border-slate-300 dark:border-slate-700 rounded-3xl p-6 relative bg-slate-50/50 dark:bg-slate-950/20">
                  
                  {/* Front Driver Area */}
                  <div className="flex justify-between items-center pb-8 border-b-2 border-slate-200 dark:border-slate-800 mb-6">
                    <div className="text-xs font-bold text-slate-400 flex items-center">
                      <Bus className="h-5 w-5 mr-1" />
                      FRONT
                    </div>
                    <div className="w-8 h-8 rounded-full border-4 border-dashed border-slate-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="space-y-6">
                    
                    {/* Rows 1-6 Section (Girls & Staff) */}
                    <div className="space-y-3">
                      <div className="text-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/5 py-1 rounded-lg border border-indigo-500/10">
                        Rows 1 to 6 — Reserved for Girls & Staff
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 30 }).map((_, index) => {
                          const seatNo = index + 1;
                          const isTaken = takenSeats.includes(seatNo);
                          const isSelected = selectedSeat === seatNo;
                          
                          // Restriction Rule: if not female and not staff, boys cannot book rows 1 to 6
                          const isRestricted = !isGirlsOrStaff;
                          
                          return (
                            <React.Fragment key={seatNo}>
                              <button
                                type="button"
                                disabled={isTaken || isRestricted}
                                onClick={() => setSelectedSeat(seatNo)}
                                className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                  isTaken
                                    ? 'bg-red-500 text-white cursor-not-allowed shadow-inner'
                                    : isRestricted
                                    ? 'bg-slate-250 dark:bg-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                                    : isSelected
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md scale-105'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm'
                                }`}
                              >
                                {isRestricted ? <Lock className="h-3 w-3" /> : seatNo}
                              </button>
                              
                              {/* Empty Aisle Spacer after column 3 (index % 5 === 2) */}
                              {index % 5 === 2 && <div className="col-span-1 pointer-events-none" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rows 7-13 Section (Boys) */}
                    <div className="space-y-3">
                      <div className="text-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 py-1 rounded-lg border border-emerald-500/10">
                        Rows 7 to 13 — Reserved for Boys
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 35 }).map((_, index) => {
                          const seatNo = index + 31;
                          const isTaken = takenSeats.includes(seatNo);
                          const isSelected = selectedSeat === seatNo;
                          
                          // Restriction Rule: girls/staff cannot book rows 7 to 13
                          const isRestricted = isGirlsOrStaff;
                          
                          return (
                            <React.Fragment key={seatNo}>
                              <button
                                type="button"
                                disabled={isTaken || isRestricted}
                                onClick={() => setSelectedSeat(seatNo)}
                                className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                  isTaken
                                    ? 'bg-red-500 text-white cursor-not-allowed shadow-inner'
                                    : isRestricted
                                    ? 'bg-slate-250 dark:bg-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                                    : isSelected
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md scale-105'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm'
                                }`}
                              >
                                {isRestricted ? <Lock className="h-3 w-3" /> : seatNo}
                              </button>
                              
                              {/* Empty Aisle Spacer after column 3 (index % 5 === 2) */}
                              {index % 5 === 2 && <div className="col-span-1 pointer-events-none" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Back exit label */}
                  <div className="mt-8 pt-4 border-t-2 border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold text-slate-400">
                    BACK
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 space-y-4">
                <Ticket className="h-16 w-16 mx-auto opacity-40 text-slate-400" />
                <p className="text-sm">
                  Please select a route, bus, and booking date on the left panel to load the interactive 65-seat layout mapping.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ReserveSeat;
