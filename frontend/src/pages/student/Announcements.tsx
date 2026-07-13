import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Megaphone, Calendar, User } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
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
        <h1 className="text-3xl font-extrabold tracking-tight">Announcements</h1>
        <p className="text-slate-500 dark:text-slate-400">Keep up to date with route changes, fleet substitutions, and general announcements.</p>
      </div>

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{ann.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-450 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {ann.author_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                {ann.content}
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No announcements broadcasted. Check back later.
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
