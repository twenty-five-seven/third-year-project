import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
          userType: payload.userType,
          sellerId: payload.sellerId,
          buyerId: payload.buyerId,
          adminId: payload.adminId
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    
    // Set user data from response or from token
    if (userData) {
      setUser(userData);
      console.log('Login successful with user data:', userData);
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
          userType: payload.userType,
          sellerId: payload.sellerId,
          buyerId: payload.buyerId
        });
        console.log('Login successful with token payload:', payload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log('User logged out');
  };

  // Update the context value:

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'admin',
    isSeller: user?.userType === 'seller',
    isBuyer: user?.userType === 'buyer' || (!user?.isAdmin && !user?.isSeller),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};