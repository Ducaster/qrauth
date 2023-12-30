'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface QrContextType {
  qrData: string | null;
  setQrData: (data: string) => void;
}

const QrContext = createContext<QrContextType | undefined>(undefined);

export const QrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (qrData) {
        axios.post('./api/save', {
            qrData
        })
    }
  }, [qrData]);

  return (
    <QrContext.Provider value={{ qrData, setQrData }}>
      {children}
    </QrContext.Provider>
  );
};

export const useQrData = () => {
  const context = useContext(QrContext);
  if (context === undefined) {
    throw new Error('useQrData must be used within a QrProvider');
  }
  return context;
};