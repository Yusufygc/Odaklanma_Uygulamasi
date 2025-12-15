import React, { createContext, useState, useContext } from 'react';

// Context oluştur
const SessionContext = createContext();

// Provider bileşeni
export const SessionProvider = ({ children }) => {
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  return (
    <SessionContext.Provider value={{ isSessionLocked, setIsSessionLocked }}>
      {children}
    </SessionContext.Provider>
  );
};

// Kolay kullanım için hook
export const useSession = () => useContext(SessionContext);