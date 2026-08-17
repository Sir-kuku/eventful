import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', location: '', date: '', time: '',
    ticket_price: '', total_tickets: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // State for proper error message
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      await api.post('/events', { 
        ...formData, 
        ticket_price: Number(formData.ticket_price), 
        total_tickets: Number(formData.total_tickets) 
      });
      navigate('/');
    } catch (error: any) {
      // Display the actual error message returned by the backend
      setError(error.response?.data?.message || 'Failed to create event. Please check your inputs.');
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 fade-in">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Create New Event</h1>
        
        {/* Professional error banner instead of alert() */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            ?? {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Title</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select...</option>
                <option value="Music">Music</option>
                <option value="Tech">Technology</option>
                <option value="Art">Art</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
              <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ticket Price (?)</label>
              <input type="number" required min="0" value={formData.ticket_price} onChange={(e) => setFormData({...formData, ticket_price: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Tickets</label>
              <input type="number" required min="1" value={formData.total_tickets} onChange={(e) => setFormData({...formData, total_tickets: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50">
            {isLoading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
