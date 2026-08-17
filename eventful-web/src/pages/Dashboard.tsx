import { Link } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa';
import EventList from './EventList';

const Dashboard = () => {
  return (
    <div className="fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your events and track sales.</p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <FaPlusCircle className="text-lg" /> New Event
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventList />
      </div>
    </div>
  );
};

export default Dashboard;
