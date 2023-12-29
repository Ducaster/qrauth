'use client';
import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import React from "react";
import { useQrData } from './importsheet';

export default function Qrscan() {
  const videoRef = useRef(null);
  const { setQrData } = useQrData();
  const QrOptions = {
    preferredCamera: "environment",
    maxScansPerSecond: 60,
    highlightScanRegion: true,
  };

  const handleScan = (result: QrScanner.ScanResult) => {
    const parsedData = result.data; 
    console.log(parsedData + 'first');
    if (parsedData.includes('name')) { 
      console.log(parsedData+'woiefjewojfiweoifj');
      setQrData(parsedData); 
      alert(parsedData); 
    } else {
      alert('QR data does not have the required key: ' + parsedData); // 토스트 메시지로 오류 메시지를 출력합니다.
    }
  };

  /*const handleScan = (result: QrScanner.ScanResult) => {
    try {
      const parsedData = JSON.parse(result.data);
      console.log(parsedData);
      setQrData(parsedData); // QR 데이터를 전역 상태에 설정합니다.
      alert(parsedData); // QR 데이터를 팝업 메시지로 표시합니다.
    } catch (error) {
      console.error('QR data is not valid JSON:', result.data);
    }
  };*/

  useEffect(() => {
    const videoElem = videoRef.current;
    if (videoElem) {
      const qrScanner = new QrScanner(videoElem, (result) => handleScan(result), QrOptions);
      qrScanner.start();

      return () => qrScanner.destroy();
    }
  }, []);

  return (
    <video ref={videoRef} style={{
    }} autoPlay playsInline />
  );
}