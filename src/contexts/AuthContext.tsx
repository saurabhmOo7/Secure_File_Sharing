
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";

type UserRole = 'operation' | 'client' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for existing user on load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple mock validation - in a real app, this would verify credentials against a backend
      if (email && password) {
        // Check if user exists in localStorage (our mock database)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.email === email);
        
        if (!user) {
          toast.error("User not found");
          return false;
        }
        
        if (user.password !== password) {
          toast.error("Invalid password");
          return false;
        }
        
        // Create a cleaned user object without password
        const authenticatedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        
        setCurrentUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Mock signup function
  const signup = async (
    email: string, 
    name: string, 
    password: string, 
    role: UserRole
  ): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password && name && role) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((u: any) => u.email === email)) {
          toast.error("User already exists");
          return false;
        }
        
        // Create new user
        const newUser = {
          id: Math.random().toString(36).substring(2, 15),
          email,
          name,
          password,
          role
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Create a cleaned user object without password
        const authenticatedUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        };
        
        setCurrentUser(authenticatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
