import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { MapPin, Bus, Navigation, RefreshCw } from 'lucide-react';

interface Journey {
  id: number;
  bus_id: number;
  bus_number: string;
  route_id: number;
  route_name: string;
  status: string;
  current_stop: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

interface Route {
  id: number;
  name: string;
  stops: string[];
}

const TrackBus: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJourneys = async () => {
    setRefreshing(true);
    try {
      const [journeysRes, routesRes] = await Promise.all([
        api.get('/journeys'),
        api.get('/routes')
      ]);
      setJourneys(journeysRes.data);
      setRoutes(routesRes.data);
      
      // Auto select first journey if none is selected
      if (journeysRes.data.length > 0 && !selectedJourneyId) {
        setSelectedJourneyId(journeysRes.data[0].id);
      }
    } catch (err) {
      console.error('Error tracking buses', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
    // Auto poll every 10 seconds for real-time tracking simulation
    const interval = setInterval(fetchJourneys, 10000);
    return () => clearInterval(interval);
  }, []);

  const selectedJourney = journeys.find(j => j.id === selectedJourneyId);
  const selectedRoute = selectedJourney 
    ? routes.find(r => r.id === selectedJourney.route_id)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Track Campus Ride</h1>
          <p className="text-slate-500 dark:text-slate-400">View real-time stop-by-stop progress of active university shuttle commutes.</p>
        </div>
        <button
          onClick={fetchJourneys}
          disabled={refreshing}
          className="self-start px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh GPS'}</span>
        </button>
      </div>

      {journeys.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Journey Details & selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Select Active Commuter</h3>
              
              <div className="space-y-4">
                {journeys.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJourneyId(j.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      j.id === selectedJourneyId
                        ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 bg-slate-50/50 dark:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Bus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-sm">Bus {j.bus_number}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 uppercase animate-pulse">
                        {j.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">{j.route_name}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">Current Stop: {j.current_stop || 'N/A'}</span>
                  </button>
                ))}
              </div>

              {selectedJourney && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-medium font-mono">{selectedJourney.latitude.toFixed(4)}° N, {selectedJourney.longitude.toFixed(4)}° E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Synced:</span>
                    <span className="font-medium">{new Date(selectedJourney.updated_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right panel: Timeline of stops (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Route Progress</h3>
                <span className="text-xs text-slate-400 font-semibold flex items-center">
                  <Navigation className="h-4 w-4 mr-1 text-blue-500 animate-bounce" />
                  Live Tracking Active
                </span>
              </div>

              {selectedJourney && selectedRoute ? (
                <div className="relative pl-8 space-y-8 py-2">
                  
                  {/* Timeline connecting line */}
                  <div className="absolute left-[13px] top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  
                  {/* Stops list rendering */}
                  {selectedRoute.stops.map((stop, index) => {
                    const isCurrent = selectedJourney.current_stop === stop;
                    const stopIndex = selectedRoute.stops.indexOf(selectedJourney.current_stop);
                    const isPassed = index < stopIndex;
                    
                    return (
                      <div key={stop} className="relative flex items-start space-x-4">
                        
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-1">
                          {isCurrent ? (
                            <div className="relative flex h-5 w-5 items-center justify-center">
                              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600" />
                            </div>
                          ) : isPassed ? (
                            <div className="h-4.5 w-4.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
                              ✓
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-950" />
                          )}
                        </div>

                        {/* Stop text details */}
                        <div className="space-y-1">
                          <h4 className={`text-md font-bold leading-tight ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isPassed ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {stop}
                          </h4>
                          {isCurrent && (
                            <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">
                              Bus is here now
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}

                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
                  Select a bus from the left side panel to trace the active route map progression.
                </p>
              )}

            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center py-20 space-y-4">
          <MapPin className="h-16 w-16 mx-auto opacity-40 text-slate-400" />
          <h3 className="text-xl font-bold">No Active Journeys</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            There are currently no shuttle buses running active journeys. The schedule list might be inactive or drivers have not started routes yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackBus;
