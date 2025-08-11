"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(() => {
    const savedUser = Cookies.get('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const locale = pathname.split('/')[1] || 'ar';
  
  useEffect(() => {
    if (user) {
      Cookies.set('user', JSON.stringify(user));
    }else{
      Cookies.remove('user');
      Cookies.remove('token');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
    });
    setUser(null);
    if (response.ok){
      router.push(`/${locale}/login`);
    }
  };
  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};