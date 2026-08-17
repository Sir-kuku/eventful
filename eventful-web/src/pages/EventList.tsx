import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/axios';
import EventCard from '../components/EventCard';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data.data));
  }, [location.key]);

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-colors duration-300">
        <p className="text-lg text-slate-400 dark:text-slate-500">No events available right now.</p>
        <p className="text-sm text-slate-300 dark:text-slate-600 mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
