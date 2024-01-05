'use client';
import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { useQrData } from './importsheet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Qrscan() {
  const videoRef = useRef(null);
  const { setQrData } = useQrData();
  const QrOptions = {
    preferredCamera: "environnment",
    maxScansPerSecond: 15,
    highlightScanRegion: true,
  };

  const handleScan = (result: QrScanner.ScanResult) => {
    const parsedData = result.data; 
    console.log(parsedData);
    if (parsedData.includes('name')) { 
      console.log(parsedData+'is accepted foramts');
      setQrData(parsedData); 
    } else {
      toast(parsedData+'는 허용된 포맷이 아닙니다.', {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(() =>{toast.dismiss()}, 2000);
    }
  };

  useEffect(() => {
    const videoElem = videoRef.current;
    if (videoElem) {
      const qrScanner = new QrScanner(videoElem, (result) => handleScan(result), QrOptions);
      qrScanner.start();

      return () => qrScanner.destroy();
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <video ref={videoRef} style={{
      }} autoPlay playsInline />
      <ToastContainer />
    </div>
  );
}
