import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, BarChart, User, Menu, X, Bell, LogOut, AlertCircle, LogIn } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore'; 

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Reports', href: '/dashboard/User', icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      await logout(); // wait for store + API
      setShowLogoutConfirm(false);
      setOpenDropdown(false);
      setIsMenuOpen(false);
      navigate('/login'); // navigate after logout
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Accident<span className="text-red-600">Report</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Notification */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
              </button>

              {/* Login/Logout (Desktop) */}
              <div className="hidden md:flex items-center space-x-3">
                {!isAuthenticated ? (
                  <Link to="/login">
                    <button className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 overflow-hidden">
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                      <LogIn className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">Login</span>
                    </button>
                  </Link>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(!openDropdown)}
                      className="flex items-center justify-center h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <User className="h-5 w-5" />
                    </button>

                    {openDropdown && (
                      <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => {
                            confirmLogout();
                            setOpenDropdown(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="border-t md:hidden animate-in slide-in-from-top duration-200">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                        isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Login/Logout button */}
                {!isAuthenticated ? (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="group relative w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 mt-4 overflow-hidden">
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                      <LogIn className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">Login</span>
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      confirmLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 mt-4 flex items-center justify-center gap-2 px-4 py-2.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Alert - Positioned below header */}
      {showLogoutConfirm && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;