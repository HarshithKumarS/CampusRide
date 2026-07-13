import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Ticket, ShieldCheck, Map, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: any = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      title: 'Bus Tracking',
      description: 'Get real-time updates of active routes, current stops, and active bus positions.',
      icon: Map,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Seat Reservation',
      description: 'Avoid crowds! Reserve your seat on the bus in advance via our interactive seat mapper.',
      icon: Ticket,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Driver Updates',
      description: 'Direct logs from drivers on active routes, schedule delays, and temporary assignments.',
      icon: Bus,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Journey Management',
      description: 'Comprehensive route scheduling, stops lists, capacity limits, and passenger logs.',
      icon: ShieldCheck,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/5 dark:from-blue-900/15 dark:to-transparent">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Introducing CampusRide
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              Smart College Bus <span className="text-blue-600 dark:text-blue-400">Tracking</span> & <span className="text-blue-600 dark:text-blue-400">Seat Reservation</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Ditch the waiting lines. Reserve seats on your designated routes, track active bus progress on stops in real-time, and commute efficiently.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 rounded-xl font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:block"
          >
            {/* Geometric/Glass background accents */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl filter blur-3xl transform rotate-6 scale-95" />
            <div className="relative border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl flex flex-col space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400 pl-2">Active Bus Tracker Simulator</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-100/80 dark:bg-slate-950/60 p-4 rounded-2xl flex justify-between items-center border border-slate-200/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Bus B01 (Route A)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Driver: John Doe</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                    En Route
                  </span>
                </div>

                <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-600 text-[10px] text-white">✓</span>
                    <p className="text-xs text-slate-400">1. Central Metro Station (08:00 AM)</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[35px] -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold animate-pulse">●</span>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">2. Sector 12 Hub (Current Stop)</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] text-white"></span>
                    <p className="text-xs text-slate-400">3. North Campus Gate 4 (08:35 AM)</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose CampusRide?</h2>
            <p className="text-slate-600 dark:text-slate-300">
              An all-in-one smart transportation suite designed specifically for students, drivers, and transport administrators.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  variants={itemVariants}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl inline-block ${feat.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Three simple steps to coordinate your daily university transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-xl font-bold">Login & Select Route</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Log in to your account. Select your designated campus route and check which bus is assigned.
              </p>
            </div>
            
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-xl font-bold">Reserve Your Seat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Click "Reserve Seat", select your preferred seat number from the real-time seat availability map, and book.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-xl font-bold">Track and Ride</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Open "Track Bus" on your phone. View live coordinate updates and board the bus at your stop when it arrives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
