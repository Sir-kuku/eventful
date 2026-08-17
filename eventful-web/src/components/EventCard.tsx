import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

interface EventData {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  created_by: { name: string };
}

const EventCard = ({ event }: { event: EventData }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer"
      onClick={() => navigate(`/event/${event._id}`)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
            {event.title}
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100">
            {event.category}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <FaCalendarAlt className="text-indigo-400" />
            <span>{formattedDate} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <FaMapMarkerAlt className="text-indigo-400" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <FaUser className="text-indigo-400" />
            <span>Created by {event.created_by?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Price</p>
            <p className="font-bold text-indigo-600">?{event.ticket_price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Tickets</p>
            <p className="font-medium text-slate-700">{event.tickets_sold}/{event.total_tickets}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
