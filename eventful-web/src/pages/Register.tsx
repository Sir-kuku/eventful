import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'creator' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: '', email: '', password: '', general: '' });
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', general: '' };
    if (!formData.name.trim()) { newErrors.name = 'Full name is required.'; isValid = false; }
    if (!formData.email) { newErrors.email = 'Email is required.'; isValid = false; }
    if (!formData.password) { newErrors.password = 'Password is required.'; isValid = false; }
    if (!isValid) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err: any) {
      setErrors({ ...newErrors, general: err.response?.data?.message || 'Registration failed.' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 text-center">Create Account</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Start managing your events today</p>
        {errors.general && <p className="text-rose-600 text-sm mb-4 bg-rose-50 p-3 rounded-lg border border-rose-200">{errors.general}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" required />
            {errors.name && <p className="text-rose-600 text-xs mt-1.5">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" required />
            {errors.email && <p className="text-rose-600 text-xs mt-1.5">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-rose-600 text-xs mt-1.5">{errors.password}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;
