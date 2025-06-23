'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/events', label: 'Events' },
    { href: '/register', label: 'Register' },
  ];

  const eventInfo = [
    { href: '/schedule', label: 'Schedule' },
    { href: '/competitions', label: 'Competitions' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/resources', label: 'Resources' },
  ];

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Linkedin, label: 'LinkedIn' },
    { href: '#', icon: Github, label: 'GitHub' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Top Section with Large Typography */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-yellow-400 mb-2 sm:mb-4 leading-tight">
            NCCROBOTICS
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">EST.2025</p>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-xs sm:max-w-lg md:max-2xl mx-auto px-2 sm:px-0">
            REDEFINING VISUAL EXCELLENCE THROUGH REVOLUTIONARY ROBOTICS TECHNOLOGY
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16 lg:mb-20">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.jpeg"
                  alt="NCCROBOTICS Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">ROBOTICS</h3>
                <p className="text-xs sm:text-sm text-yellow-400 font-bold">WORKSHOP 2025</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
              JOIN THE PREMIER ROBOTICS WORKSHOP EVENT FEATURING CUTTING-EDGE TECHNOLOGY, 
              COMPETITIONS, AND NETWORKING OPPORTUNITIES.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-yellow-400">QUICK LINKS</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-bold text-sm sm:text-lg uppercase tracking-wider block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Information */}
          <div>
            <h4 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-yellow-400">EVENT INFO</h4>
            <ul className="space-y-2 sm:space-y-3">
              {eventInfo.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-bold text-sm sm:text-lg uppercase tracking-wider block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-yellow-400">CONTACT US</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base font-medium break-all">ncc.robotics.segment@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base font-medium">+880 1718-360044</span>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base font-medium">
                  NITER CAMPUS<br />
                 ACADEMIC BUILDING 01<br />
                  AC-204
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-yellow-400">
          <h4 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 sm:mb-12 text-center text-yellow-400 uppercase tracking-wider">
            EVENT TIMELINE 2025
          </h4>
          
          {/* Timeline Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 transform -translate-y-1/2 z-0"></div>
            
            {/* Timeline Events */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative z-10">
              {/* Event 1 - Registration Opens */}
              <div className="group">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl relative">
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full border-4 border-yellow-400 z-20"></div>
                  
                  <div className="text-black font-black text-2xl sm:text-3xl mb-3">JUNE 24</div>
                  <div className="text-black font-bold text-sm sm:text-base uppercase tracking-wider leading-tight">
                    REGISTRATION<br />OPENS
                  </div>
                  <div className="mt-4 text-black/70 text-xs sm:text-sm font-medium">
                    Start your journey
                  </div>
                </div>
              </div>

              {/* Event 2 - Registration Closes */}
              <div className="group">
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-gray-100 relative">
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white z-20"></div>
                  
                  <div className="text-black font-black text-2xl sm:text-3xl mb-3">JUNE 29</div>
                  <div className="text-black font-bold text-sm sm:text-base uppercase tracking-wider leading-tight">
                    REGISTRATION<br />CLOSES
                  </div>
                  <div className="mt-4 text-black/70 text-xs sm:text-sm font-medium">
                    Final deadline
                  </div>
                </div>
              </div>

              {/* Event 3 - Main Workshop */}
              <div className="group sm:col-span-2 lg:col-span-1">
                <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 sm:p-8 text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-yellow-400 relative">
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full border-4 border-black z-20"></div>
                  
                  <div className="text-yellow-400 font-black text-2xl sm:text-3xl mb-3">JUNE 30</div>
                  <div className="text-white font-bold text-sm sm:text-base uppercase tracking-wider leading-tight">
                    MAIN<br />WORKSHOP
                  </div>
                  <div className="mt-4 text-yellow-400/70 text-xs sm:text-sm font-medium">
                    The big day arrives
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-yellow-400 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-gray-300 text-sm sm:text-lg font-bold text-center md:text-left">
            © {currentYear} NCCROBOTICS WORKSHOP. ALL RIGHTS RESERVED. by{' '}
            <a 
              href="https://www.linkedin.com/in/md-jobayer-arafat-a14b61284/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 uppercase tracking-wider"
            >
              md jobayer arafat
            </a>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 md:space-x-8 text-center">
            <Link href="/privacy" className="text-gray-300 hover:text-yellow-400 text-sm sm:text-lg font-bold uppercase tracking-wider transition-colors duration-200">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-yellow-400 text-sm sm:text-lg font-bold uppercase tracking-wider transition-colors duration-200">
              TERMS OF SERVICE
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-yellow-400 text-sm sm:text-lg font-bold uppercase tracking-wider transition-colors duration-200">
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;