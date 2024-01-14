"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

interface QrContextType {
  qrData: string | null;
  setQrData: (data: string) => void;
  selectedValue: string;
  handleSelectedValueChange: (value: string) => void;
}

const QrContext = createContext<QrContextType | undefined>(undefined);

export const QrProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleSelectedValueChange = (value: string) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    if (qrData) {
      if (selectedValue == "" || selectedValue == "add") {
        Swal.fire({
          icon: "error",
          title: "시트를 선택해주세요.",
          showConfirmButton: true,
        });
        setTimeout(() => {
          toast.dismiss();
        }, 2000);
        return;
      } else {
        Swal.fire({
          title: "인증 중...",
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        axios
          .post("./api/save", {
            data: qrData,
            selectedValue,
          })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "인증 완료",
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "인증 실패",
                showConfirmButton: true,
              });
            }
          });
      }
    }
  }, [qrData]);

  return (
    <QrContext.Provider
      value={{ qrData, setQrData, selectedValue, handleSelectedValueChange }}
    >
      {children}
    </QrContext.Provider>
  );
};

export const useQrData = () => {
  const context = useContext(QrContext);
  if (context === undefined) {
    throw new Error("useQrData must be used within a QrProvider");
  }
  return context;
};
