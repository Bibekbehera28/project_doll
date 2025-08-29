import "./global.css";

import React, { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Import pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import WasteClassification from "./pages/WasteClassification";
import RecyclingCenters from "./pages/RecyclingCenters";
import Rewards from "./pages/Rewards";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Assessment from "./pages/Assessment";
import ARScanner from "./pages/ARScanner";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

// Import components
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import { validateConfig } from "@/lib/config";

const queryClient = new QueryClient();

// Mock User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  level: string;
  wasteClassified: number;
  joinedDate: string;
  ecoScore: number;
  badges: string[];
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    language: string;
  };
}

// Authentication Context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock authentication provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('ecosort_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login for demo@ecosort.app
    if (email === 'demo@ecosort.app' && password === 'password') {
      const mockUser: User = {
        id: 'user-123',
        name: 'Alex Chen',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        points: 2156,
        level: 'Eco Champion',
        wasteClassified: 187,
        joinedDate: '2024-01-15',
        ecoScore: 89,
        badges: ['first-sort', 'eco-warrior', 'plastic-saver', 'green-champion'],
        preferences: {
          darkMode: false,
          notifications: true,
          language: 'en'
        }
      };
      setUser(mockUser);
      localStorage.setItem('ecosort_user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: `user-${Date.now()}`,
      name: name,
      email: email,
      points: 0,
      level: 'Beginner',
      wasteClassified: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      ecoScore: 0,
      badges: [],
      preferences: {
        darkMode: false,
        notifications: true,
        language: 'en'
      }
    };
    
    setUser(mockUser);
    localStorage.setItem('ecosort_user', JSON.stringify(mockUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecosort_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('ecosort_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { user: sbUser, loading: sbLoading } = useSupabaseAuth();
  
  if (loading || sbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-primary"></div>
      </div>
    );
  }
  
  const isAuthed = !!user || !!sbUser;
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { user: sbUser, loading: sbLoading } = useSupabaseAuth();
  
  if (loading || sbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-primary"></div>
      </div>
    );
  }
  
  const isAuthed = !!user || !!sbUser;
  return !isAuthed ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Layout wrapper for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      {children}
      <Toaster />
      <Sonner />
    </Layout>
  );
};

const App = () => {
  // Validate configuration on app start
  React.useEffect(() => {
    validateConfig();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <PublicRoute>
                      <SignupPage />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/assessment" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Assessment />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/classify"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <WasteClassification />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scan"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <WasteClassification />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ar-scanner"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ARScanner />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/centers" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RecyclingCenters />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/rewards" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Rewards />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Analytics />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/about" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <About />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
