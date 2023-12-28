import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (content) => {
    setNotification(content);

    setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};