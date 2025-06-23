'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Bot, Cpu, CircuitBoard, Zap, Wifi, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SessionFixer from '@/components/SessionFixer';

import { useAuth } from '@/lib/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSessionFixer, setShowSessionFixer] = useState(false);
  const controls = useAnimation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect based on user role after login
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    }
  }, [user, loading, router]);

  const techFeatures = [
    { icon: Bot, label: "AI Processing", value: "Neural Engine", color: "from-blue-500 to-cyan-500" },
    { icon: Cpu, label: "Computing Power", value: "50+ TOPS", color: "from-purple-500 to-pink-500" },
    { icon: CircuitBoard, label: "Vision System", value: "4K Camera", color: "from-green-500 to-teal-500" },
    { icon: Wifi, label: "Connectivity", value: "5G Ready", color: "from-orange-500 to-red-500" }
  ];

  useEffect(() => {
    // Robot floating animation - enhanced like home page
    controls.start({
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        // Redirection will be handled by useEffect based on user role
        console.log('Login successful, redirection will be handled automatically');
      } else {
        // Login failed, show session fixer if it might be a permission issue
        setShowSessionFixer(true);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show session fixer for permission-related errors
      if (error?.message?.includes('missing scope') || 
          error?.message?.includes('guests') ||
          error?.message?.includes('guest') ||
          error?.message?.includes('permission') ||
          error?.message?.includes('unauthorized')) {
        setShowSessionFixer(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      // In a real app, you would call the resetPassword function
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      toast.error('Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Header />
        {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pt-32">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-32 h-32 opacity-5"
        >
          <CircuitBoard className="w-full h-full text-blue-500" />
        </motion.div>
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-24 h-24 opacity-5"
        >
          <Cpu className="w-full h-full text-purple-500" />
        </motion.div>        {/* Large Background Text similar to home page */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-0 pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <motion.h1 
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black leading-none tracking-tighter select-none pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <span className="block bg-gradient-to-r from-orange-400 to-yellow-600 bg-clip-text text-transparent opacity-20">LOGIN</span>
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent opacity-15 -mt-8">NEURAL</span>
          </motion.h1>
        </motion.div>      </div>
        <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Robot Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Header Section */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="text-sm text-gray-600 font-mono">ROBOCAPTURE EST.2025</div>
                  <div className="text-sm text-gray-600 font-mono">INTELLIGENT IMAGING AWAITS</div>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl lg:text-6xl font-bold mb-4"
                >
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    CAMCORDER
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-600 mb-6 max-w-lg"
                >
                  VCam Pro HD Indoor Security Cameras with 360° coverage and intelligent performance features. Access your account to continue your robotics journey.
                </motion.p>
              </div>
              
              {/* Robot Image with Enhanced Animations */}
              <div className="relative">
                <motion.div
                  animate={controls}
                  className="relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative"
                  >
                    {/* Multiple Glowing Layers */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-full blur-3xl animate-pulse scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse scale-125 animation-delay-1000"></div>
                    
                    <Image
                      src="/robots/robot2.png"
                      alt="CAMCORDER Robot"
                      width={500}
                      height={500}
                      className="w-full h-auto max-w-md mx-auto relative z-10"
                      priority
                    />
                    
                    {/* Rotating Tech Rings */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-orange-500/20 rounded-full scale-110"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-yellow-500/15 rounded-full scale-125"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Enhanced Tech Specs Animation */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {techFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <motion.div 
                        className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0 rgba(0,0,0,0)",
                            "0 0 20px 5px rgba(59, 130, 246, 0.3)",
                            "0 0 0 0 rgba(0,0,0,0)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      >
                        <feature.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{feature.value}</div>
                        <div className="text-xs text-gray-500">{feature.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - Enhanced Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:mx-0"
            >
              <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4">
                    <Bot className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-4"
                    >
                      <Bot className="w-8 h-8 text-black" />
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-4xl font-black text-white mb-4 uppercase tracking-wider"
                    >
                      Neural <span className="text-yellow-400">Access</span>
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="text-gray-400 font-medium"
                    >
                      Connect to your robotics control center
                    </motion.p>
                  </div>
                
                {!showForgotPassword ? (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                        <Mail className="w-4 h-4 mr-2 inline" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                        </div>
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full pl-12 pr-4 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                          placeholder="Enter your neural ID"
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-400 text-sm mt-2 flex items-center font-medium"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                        <Lock className="w-4 h-4 mr-2 inline" />
                        Access Code
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                        </div>
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full pl-12 pr-12 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                          placeholder="Enter your access code"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-yellow-400 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-400 text-sm mt-2 flex items-center font-medium"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.password.message}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-yellow-400 focus:ring-yellow-500 border-gray-600 bg-gray-800 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 font-medium">
                          Remember neural connection
                        </label>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                      >
                        Reset access code?
                      </button>
                    </div>
                    
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 px-6 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Bot className="w-5 h-5 mr-2" />
                            Initialize Neural Link
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </motion.div>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </motion.form>
                ) : (
                  <ForgotPasswordForm
                    onSubmit={handleForgotPassword}
                    onBack={() => setShowForgotPassword(false)}
                  />
                )}
                
                {/* Session Fixer for Authentication Issues */}
                {showSessionFixer && (
                  <div className="mt-6">
                    <SessionFixer onSessionCleared={() => setShowSessionFixer(false)} />
                  </div>
                )}                
                {!showForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="mt-8 pt-6 border-t border-gray-700 text-center"
                  >
                    <p className="text-sm text-gray-300 font-medium">
                      New to the neural network?{' '}
                      <Link
                        href="/register"
                        className="text-yellow-400 hover:text-yellow-300 font-black transition-colors uppercase tracking-wider"
                      >
                        Initialize your profile
                      </Link>
                    </p>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center justify-center space-x-4 mt-4">
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                        Neural Network: Online
                      </div>
                      <div className="flex items-center text-xs text-gray-400 font-medium">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                        Security: Active
                      </div>
                    </div>
                  </motion.div>
                )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
        {/* Session Fixer Component - Shown on Authentication Errors */}
      {showSessionFixer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <SessionFixer onSessionCleared={() => setShowSessionFixer(false)} />
        </div>
      )}
    </div>
  );
};

// Enhanced Forgot Password Component
const ForgotPasswordForm = ({ onSubmit, onBack }: { onSubmit: (email: string) => void; onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    await onSubmit(email);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-4"
        >
          <Shield className="w-8 h-8 text-black" />
        </motion.div>
        <h3 className="text-2xl font-black text-white uppercase tracking-wider">Neural Reset Protocol</h3>
        <p className="text-gray-400 mt-2 font-medium">
          Enter your neural ID and we'll send you a secure access reset link.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
            <Mail className="w-4 h-4 mr-2 inline" />
            Neural ID (Email)
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              placeholder="Enter your neural ID"
              required
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 px-4 border-2 border-gray-600 rounded-xl text-gray-300 font-black hover:bg-gray-800 transition-all duration-300 uppercase tracking-wider"
          >
            Back to Neural Link
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading || !email}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-4 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mx-auto"
                />
              ) : (
                'Send Reset Protocol'
              )}
            </div>
          </motion.button>
        </div>
      </form>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 border-2 border-yellow-400/30 rounded-xl p-4"
      >
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-black text-yellow-400 uppercase tracking-wider">Neural Security Notice</h4>
            <p className="text-sm text-gray-300 mt-1 font-medium">
              This demo version simulates the reset protocol. In production, this would send an encrypted neural access reset.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;