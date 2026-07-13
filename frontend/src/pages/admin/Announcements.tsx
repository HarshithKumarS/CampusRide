import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Megaphone, Calendar, Trash2, User, Plus, X, Loader2 } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
  author_name: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setTitle('');
    setContent('');
    setTargetRole('all');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/announcements', {
        title,
        content,
        target_role: targetRole
      });
      setAnnouncements([res.data, ...announcements]);
      setModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action is permanent.')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete.');
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
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Announcements Control</h1>
          <p className="text-slate-500 dark:text-slate-400">Broadcast important schedule changes or transit news to students and drivers.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
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
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span>{ann.title}</span>
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        To: {ann.target_role}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-455 dark:text-slate-400 pt-0.5">
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
                
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                {ann.content}
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No active announcements seeded or posted.
          </div>
        )}
      </div>

      {/* Add Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold">Broadcast Announcement</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Broadcast Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Route Schedule Delay Alert"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Everyone (All Roles)</option>
                  <option value="student">Students Only</option>
                  <option value="driver">Drivers Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Broadcast Message</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter details of schedule delay, cancellations, general notifications..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center space-x-1 cursor-pointer"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Announcements;
