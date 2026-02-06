import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Home, TrendingUp, Users, Mail } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: TrendingUp, label: 'Dashboard' },
    { path: '/risk-map', icon: Users, label: 'Risk Map' },
    { path: '/statistics', icon: BarChart3, label: 'Statistics' },
    { path: '/contact', icon: Mail, label: 'Contact' },
  ];

  return (
    <div className="min-h-screen text-zinc-100">
      {/* Navigation Bar */}
      <nav className="border-b border-[rgba(100,150,255,0.1)] bg-[rgba(15,23,42,0.7)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3A6FF8] shadow-sm shadow-blue-500/20">
                <BarChart3 className="size-6 text-white" />
              </div>
              <span className="text-xl text-zinc-100">QuantPulse India</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                      ? 'bg-[#3A6FF8] text-white shadow-sm shadow-blue-500/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[rgba(58,111,248,0.1)]'
                      }`}
                  >
                    <Icon className="size-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Authentication Buttons */}
            <div className="flex items-center gap-3.5 pl-2">
              <Link
                to="/signin"
                className="px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 bg-[#3A6FF8] hover:bg-[#4A7AE8] text-white rounded-lg transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
