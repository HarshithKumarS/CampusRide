import React from 'react';
import { Bus, Clock, ShieldCheck, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="py-16 px-6 max-w-7xl mx-auto space-y-16">
      {/* Intro */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Our Mission</span>
        <h1 className="text-4xl font-extrabold tracking-tight">About CampusRide</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          CampusRide is a smart transit operations system built for college and university campuses. Our goal is to streamline daily commutes by connecting transit managers, drivers, and students.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl inline-block">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Zero Time Wasted</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Students can track where the bus is and head to the stop right on time, preventing long waits under extreme weather.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl inline-block">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Guaranteed Seating</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Reserved seating ensures every passenger has a comfortable ride, eliminating congestion and overcrowded buses.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl inline-block">
            <Bus className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Driver Efficiency</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Drivers manage transit logs, current stops, and active status straight from their dashboard, keeping admins fully informed.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-100/50 dark:bg-slate-900/30 p-8 sm:p-12 rounded-3xl">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Designed for Modern Campuses</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Typical university shuttle systems operate on strict rigid schedules that are frequently disrupted by traffic, maintenance issues, or student rushes. CampusRide modernizes this workflow using SQLite databases and session-based tracking.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Admin roles can oversee the entire fleet, edit active drivers, log routes, assign temporary replacements, and broadcast critical alerts immediately to driver and student dashboards.
          </p>
          <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <Heart className="h-5 w-5 fill-current" />
            <span>Built by college developers, for college students.</span>
          </div>
        </div>
        <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white p-8">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="text-center space-y-4 z-10">
            <Bus className="h-20 w-20 mx-auto" />
            <h3 className="text-2xl font-bold">CampusRide Transit</h3>
            <p className="text-xs text-blue-100">Connecting student portals, driver terminals, and admin panels.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
