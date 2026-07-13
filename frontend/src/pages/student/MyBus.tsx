import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bus, ShieldCheck, Ticket } from 'lucide-react';

interface Reservation {
  id: number;
  bus_id: number;
  bus_number: string;
  route_name: string;
  seat_number: number;
  booking_date: string;
  status: string;
}

interface BusDetails {
  id: number;
  bus_number: string;
  capacity: number;
  plate_number: string;
  status: string;
  driver_name: string;
  driver_phone?: string;
  driver_email?: string;
}

const MyBus: React.FC = () => {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get('/reservations');
        // Find active reservation
        const active = res.data.find((r: any) => r.status === 'active');
        if (active) {
          setReservation(active);
          // Query detailed bus details
          const busRes = await api.get('/buses');
          const bus = busRes.data.find((b: any) => b.id === active.bus_id);
          
          // Also fetch driver details by hitting drivers endpoint (which lists driver profiles)
          const driverRes = await api.get('/drivers');
          const driver = driverRes.data.find((d: any) => d.id === bus.driver_id);
          
          setBusDetails({
            ...bus,
            driver_name: driver?.name || 'TBD',
            driver_phone: driver?.phone || 'N/A',
            driver_email: driver?.email || 'N/A'
          });
        }
      } catch (err) {
        console.error('Error fetching bus detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBus();
  }, []);

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
        <h1 className="text-3xl font-extrabold tracking-tight">My Bus Details</h1>
        <p className="text-slate-500 dark:text-slate-400">View detailed fleet specifications and driver coordinates for your assigned commute.</p>
      </div>

      {reservation && busDetails ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Bus Stats Card (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Bus className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold">Bus {busDetails.bus_number}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Registration Plate: {busDetails.plate_number}</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 capitalize">
                  {busDetails.status}
                </span>
              </div>

              {/* Grid detail metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Max Capacity</span>
                  <p className="text-xl font-bold">{busDetails.capacity} Seats</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Seat Number</span>
                  <p className="text-xl font-bold">Seat #{reservation.seat_number}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Booking Date</span>
                  <p className="text-xl font-bold">{new Date(reservation.booking_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm">Designated Travel Route</h4>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold">{reservation.route_name}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Side Driver Profile Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Driver Profile</h3>

              <div className="text-center space-y-3 pb-4 border-b border-slate-100 dark:border-slate-850">
                <div className="h-16 w-16 bg-blue-500 text-white flex items-center justify-center font-bold text-2xl rounded-2xl mx-auto shadow-sm">
                  {busDetails.driver_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-md">{busDetails.driver_name}</h4>
                  <span className="text-xs text-slate-400">Assigned Transit Officer</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone Contact:</span>
                  <span className="font-medium">{busDetails.driver_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Officer Email:</span>
                  <span className="font-medium truncate max-w-[180px]">{busDetails.driver_email}</span>
                </div>
              </div>

              <Link
                to="/student/track-bus"
                className="w-full text-center block py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10"
              >
                Track Bus Live Location
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center py-16 space-y-6">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full inline-block">
            <Ticket className="h-12 w-12" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold">No Active Reservations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You must reserve a seat on an active bus and route to view detailed driver coordinates and specifications here.
            </p>
          </div>
          <Link
            to="/student/reserve-seat"
            className="inline-flex items-center px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Go to Seat Reservation
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBus;
