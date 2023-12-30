'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface QrContextType {
  qrData: string | null;
  setQrData: (data: string) => void;
}

const QrContext = createContext<QrContextType | undefined>(undefined);

export const QrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (qrData) {
      toast('인증 중...', {
        position: toast.POSITION.TOP_CENTER,
      });
      axios.post('./api/save', {
        qrData
      }).then((response) => {
        if (response.status === 200) {
          toast('인증 완료', {
            position: toast.POSITION.TOP_CENTER,
          });
          setTimeout(() =>{toast.dismiss()}, 500);
        } else {
          toast('인증 실패', {
            position: toast.POSITION.TOP_CENTER,
          });
          setTimeout(() =>{toast.dismiss()}, 3000);
        }
      });
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