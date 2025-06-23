'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { Menu, X, User, LogOut, Settings, Home, Calendar, UserPlus, LogIn, Search, Zap, CircuitBoard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const navItems = [
    { href: '/', label: 'HOME', icon: Home },
    { href: '/about', label: 'WORKSHOP', icon: Zap },
    { href: '/events', label: 'EVENTS', icon: Calendar },
  ];

  const authItems = user ? [
    { href: '/user', label: 'Dashboard', icon: User },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: Settings }] : []),
  ] : [
    { href: '/register', label: 'Register', icon: UserPlus },
    { href: '/login', label: 'Login', icon: LogIn },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >      {/* Header Bar - Responsive */}      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-gray-600 font-medium">NCCROBOTICS EST.2025</div>
        <div className="hidden sm:block text-xs sm:text-sm text-gray-600 font-medium">Redefining Visual Excellence</div>
        <Link href="/register">
          <motion.button 
            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-yellow-400 text-black text-xs sm:text-sm font-bold rounded-full hover:bg-yellow-500 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            REGISTER NOW
          </motion.button>
        </Link>
      </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Responsive */}          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.jpeg"
                alt="NCCROBOTICS Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl lg:text-3xl font-black text-black">NCCROBOTICS</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-16">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="text-black hover:text-gray-600 font-black text-base xl:text-lg uppercase tracking-wider transition-colors duration-200"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ y: 0 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>          {/* Right Side Actions - Responsive */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-8">
            {user ? (
              /* User is logged in - show profile menu */
              <div className="relative">
                <motion.button
                  className="flex items-center space-x-1 sm:space-x-2 text-black hover:text-gray-700 transition-all"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-black text-yellow-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="hidden sm:block font-bold text-sm lg:text-base">{user.name}</span>
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 bg-yellow-50 border-b border-gray-200">
                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/user">
                          <div className="px-4 py-2 text-gray-800 hover:bg-yellow-50 flex items-center space-x-2 cursor-pointer text-sm" onClick={() => setIsProfileOpen(false)}>
                            <User className="w-4 h-4" />
                            <span>Dashboard</span>
                          </div>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin">
                            <div className="px-4 py-2 text-gray-800 hover:bg-yellow-50 flex items-center space-x-2 cursor-pointer text-sm" onClick={() => setIsProfileOpen(false)}>
                              <Settings className="w-4 h-4" />
                              <span>Admin Panel</span>
                            </div>
                          </Link>
                        )}
                        <div className="border-t border-gray-200 mt-1"></div>
                        <div
                          className="px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer text-sm"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {/* Registration Button - Hidden on mobile */}
                <Link href="/register" className="hidden md:block">
                  <motion.button
                    className="text-black hover:text-gray-600 font-black text-sm lg:text-lg uppercase tracking-wider transition-colors duration-200"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    REGISTER
                  </motion.button>
                </Link>

                {/* Login Button - Responsive */}
                <Link href="/login" className="hidden sm:block">
                  <motion.button
                    className="bg-black text-yellow-400 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-black text-sm lg:text-lg uppercase tracking-wider hover:bg-gray-800 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    LOGIN
                  </motion.button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <motion.button
              className="lg:hidden p-2 sm:p-3 text-black hover:text-gray-600 transition-colors bg-yellow-400 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.button>
          </div>
        </div>        {/* Mobile Navigation - Responsive */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-gray-200 bg-yellow-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-4 sm:py-6 lg:py-8 space-y-2 sm:space-y-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="block px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-black hover:text-gray-800 font-black text-lg sm:text-xl uppercase tracking-wider transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
                
                {/* Mobile Auth Buttons - Responsive */}
                <div className="px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 space-y-3 sm:space-y-4">
                  {user ? (
                    <>
                      <Link href="/user">
                        <motion.button
                          className="w-full py-3 sm:py-4 text-black font-black text-lg sm:text-xl uppercase tracking-wider border-2 border-black rounded-full hover:bg-black hover:text-yellow-400 transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          DASHBOARD
                        </motion.button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin">
                          <motion.button
                            className="w-full py-3 sm:py-4 text-black font-black text-lg sm:text-xl uppercase tracking-wider border-2 border-black rounded-full hover:bg-black hover:text-yellow-400 transition-all duration-300"
                            onClick={() => setIsMenuOpen(false)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            ADMIN PANEL
                          </motion.button>
                        </Link>
                      )}
                      <motion.button
                        className="w-full py-3 sm:py-4 bg-black text-yellow-400 font-black text-lg sm:text-xl uppercase tracking-wider rounded-full hover:bg-gray-800 transition-all duration-300"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        LOGOUT
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <Link href="/register">
                        <motion.button
                          className="w-full py-3 sm:py-4 text-black font-black text-lg sm:text-xl uppercase tracking-wider border-2 border-black rounded-full hover:bg-black hover:text-yellow-400 transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          REGISTER
                        </motion.button>
                      </Link>
                      <Link href="/login">
                        <motion.button
                          className="w-full py-3 sm:py-4 bg-black text-yellow-400 font-black text-lg sm:text-xl uppercase tracking-wider rounded-full hover:bg-gray-800 transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          LOGIN
                        </motion.button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
