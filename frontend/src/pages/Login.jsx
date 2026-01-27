// pages/Login.jsx - Login and registration page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'citizen'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      setLoading(false);

      if (result.success) {
        // Redirect based on role
        const dashboardMap = {
          citizen: '/citizen/dashboard',
          registrar: '/registrar/dashboard',
          court: '/court/dashboard',
          admin: '/admin/dashboard'
        };
        navigate(dashboardMap[result.user.role], { replace: true });
      } else {
        setError(result.error);
      }
    } else {
      const result = await register(formData.email, formData.password, formData.name, formData.role);
      setLoading(false);

      if (result.success) {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '', role: 'citizen' });
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 mb-6 group transition-all duration-500 hover:scale-110">
            <img src="/logo.png" alt="BlockEstate Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">BlockEstate</h1>
          <p className="text-slate-400 mt-2 font-medium">Digital Asset & Land Registry</p>
        </div>

        <div className="card border-white/5 bg-white/10 backdrop-blur-xl p-8">
          <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${isLogin
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${!isLogin
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <span className="mr-2">✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="label-text text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field bg-slate-900/50 border-white/10 text-white focus:bg-slate-900"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="label-text text-slate-300">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field bg-slate-900/50 border-white/10 text-white focus:bg-slate-900"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="label-text text-slate-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field bg-slate-900/50 border-white/10 text-white focus:bg-slate-900"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="label-text text-slate-300">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field bg-slate-900/50 border-white/10 text-white focus:bg-slate-900"
                >
                  <option value="citizen">Citizen</option>
                  <option value="registrar">Registrar</option>
                  <option value="court">Court</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 text-base shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-blue-400 hover:text-blue-300 font-bold underline transition-colors"
            >
              {isLogin ? 'Sign up for free' : 'Log in here'}
            </button>
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500 font-medium tracking-widest uppercase">
          Powered by Blockchain Technology
        </p>
      </div>
    </div>
  );
};

export default Login;
