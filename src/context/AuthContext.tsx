import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authApi, getToken, setToken, removeToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedRole: Role | null;
  setSelectedRole: (role: Role | null) => void;
  login: (username: string, password: string, rememberMe?: boolean, roleHint?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(() => {
    return (localStorage.getItem('selected_role') as Role) || null;
  });

  const handleSetSelectedRole = (role: Role | null) => {
    setSelectedRole(role);
    if (role) {
      localStorage.setItem('selected_role', role);
    } else {
      localStorage.removeItem('selected_role');
    }
  };

  const refreshUser = async () => {
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      setTokenState(existingToken);
    } catch (err) {
      console.error('Failed to restore user session:', err);
      removeToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = true,
    roleHint?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(username, password, roleHint);
      setToken(response.token, rememberMe);
      setTokenState(response.token);
      setUser(response.user);
      // Remember role corresponding to authenticated user
      handleSetSelectedRole(response.user.role);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    window.location.href = '/select-role';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        selectedRole,
        setSelectedRole: handleSetSelectedRole,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
