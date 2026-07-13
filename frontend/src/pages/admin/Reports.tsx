import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileSpreadsheet, Download, RefreshCw, BarChart3 } from 'lucide-react';

interface BusObj {
  id: number;
  bus_number: string;
  capacity: number;
  driver_name: string | null;
}

interface Reservation {
  id: number;
  student_name: string;
  bus_number: string;
  route_name: string;
  seat_number: number;
  booking_date: string;
  status: string;
}

const Reports: React.FC = () => {
  const [buses, setBuses] = useState<BusObj[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = async () => {
    setRefreshing(true);
    try {
      const [busesRes, resRes] = await Promise.all([
        api.get('/buses'),
        api.get('/reservations')
      ]);
      setBuses(busesRes.data);
      setReservations(resRes.data);
    } catch (err) {
      console.error('Error fetching report data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleDownloadCSV = () => {
    if (reservations.length === 0) return;
    
    // Create CSV content headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Booking ID,Student Name,Bus Number,Route Name,Seat Number,Booking Date,Status\n";
    
    // Fill records
    reservations.forEach(r => {
      csvContent += `${r.id},"${r.student_name || 'TBD'}",${r.bus_number},"${r.route_name}",${r.seat_number},${r.booking_date},${r.status}\n`;
    });
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campusride_transit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Statistics calculations
  const totalBookings = reservations.length;
  const activeBookings = reservations.filter(r => r.status === 'active').length;
  const cancelledBookings = totalBookings - activeBookings;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">View overall seating metrics and download reservation schedules.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchReportData}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          
          <button
            onClick={handleDownloadCSV}
            disabled={reservations.length === 0}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center space-x-2 transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Seating Booked</span>
          <h3 className="text-3xl font-bold">{activeBookings} Seats</h3>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cancellations</span>
          <h3 className="text-3xl font-bold">{cancelledBookings} Logs</h3>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Utilization rate</span>
          <h3 className="text-3xl font-bold">
            {buses.length > 0 
              ? `${Math.round((activeBookings / (buses.reduce((acc, b) => acc + b.capacity, 0))) * 100)}%`
              : '0%'
            }
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fleet Utilization Table (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Bus Utilization Breakdown
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Bus Code</th>
                    <th className="px-6 py-4">Driver Name</th>
                    <th className="px-6 py-4 text-center">Active Bookings</th>
                    <th className="px-6 py-4 text-center">Remaining seats</th>
                    <th className="px-6 py-4 text-right">Fill Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {buses.map(b => {
                    const busBookings = reservations.filter(r => r.bus_number === b.bus_number && r.status === 'active').length;
                    const fillRate = Math.round((busBookings / b.capacity) * 100);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="px-6 py-4 font-bold text-blue-600">Bus {b.bus_number}</td>
                        <td className="px-6 py-4 font-medium">{b.driver_name || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-center font-semibold">{busBookings}</td>
                        <td className="px-6 py-4 text-center font-semibold">{b.capacity - busBookings}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${fillRate > 75 ? 'text-rose-600' : fillRate > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                            {fillRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Download Capsule info (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6 py-10">
            <div className="p-4 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full inline-block">
              <FileSpreadsheet className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Export Seating List</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Export all student seat reservations, bus plate numbers, assigned routes, and timestamps to a standard CSV report for office review.
              </p>
            </div>
            
            <button
              onClick={handleDownloadCSV}
              disabled={reservations.length === 0}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Download CSV Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
