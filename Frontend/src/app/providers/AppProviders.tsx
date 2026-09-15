import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <AppProvider>
        {children}
      </AppProvider>
    </BrowserRouter>
  );
};
