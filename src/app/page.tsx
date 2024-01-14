"use client";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { useQrData } from "./importsheet";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import styles from "./page.module.css";
import Swal from "sweetalert2";

export default function Qrscan() {
  const [sheetlist, setSheetlist] = useState<string[]>([]);
  const videoRef = useRef(null);
  const { setQrData, handleSelectedValueChange } = useQrData();

  const QrOptions = {
    preferredCamera: "environnment",
    maxScansPerSecond: 15,
    highlightScanRegion: true,
  };

  const handleScan = (result: QrScanner.ScanResult) => {
    const parsedData = result.data;
    console.log(parsedData);
    if (parsedData.includes("name")) {
      console.log(parsedData + "is accepted foramts");
      setQrData(parsedData);
    } else {
      toast(parsedData + "는 허용된 포맷이 아닙니다.", {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(() => {
        toast.dismiss();
      }, 2000);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelectedValueChange(e.target.value);
  };

  const handleOpenModal = () => {
    Swal.fire({
      title: "새 시트 이름",
      input: "text",
      showCancelButton: true,
      confirmButtonText: "추가하기",
      cancelButtonText: "닫기",
    }).then((result) => {
      if (result.value) {
        console.log(result.value, typeof result.value);
        handleNewSheetSubmit(result.value);
      }
    });
  };

  const handleNewSheetSubmit = (sheetName: string) => {
    console.log(sheetName + "is on handleNewSheetSubmit");
    if (sheetName != "") {
      console.log(sheetName + "is on handleNewSheetSubmit");
      Swal.fire({
        title: "시트 추가 중...",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      axios
        .put("./api/save", {
          sheetName,
        })
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "시트 추가 완료",
              showConfirmButton: false,
              timer: 1500,
            });
            getSheetlist();
          } else if (response.status === 202) {
            Swal.fire({
              icon: "error",
              title: "이미 존재하는 시트입니다.",
              showConfirmButton: true,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "시트 추가 실패",
              showConfirmButton: true,
            });
          }
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "시트 이름을 입력해주세요",
        showConfirmButton: true,
      });
    }
  };

  const getSheetlist = async () => {
    axios.get("./api/save").then((response) => {
      if (response.status === 200) {
        setSheetlist(response.data);
        console.log(Object.entries(sheetlist) + typeof sheetlist);
      }
    });
  };

  useEffect(() => {
    getSheetlist();
    const videoElem = videoRef.current;
    if (videoElem) {
      const qrScanner = new QrScanner(
        videoElem,
        (result) => handleScan(result),
        QrOptions
      );
      qrScanner.start();

      return () => qrScanner.destroy();
    }
  }, []);

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} autoPlay playsInline />

      <div className={styles.dropdownContainer}>
        <select
          className={styles.select}
          onChange={handleOnChange}
          defaultValue=""
        >
          <option value="" disabled hidden>
            입력될 시트 선택
          </option>
          {Object.entries(sheetlist).map(([key, values]) =>
            Array.isArray(values)
              ? (values as string[]).map((value: string, i: number) => (
                  <option key={i}>{value}</option>
                ))
              : null
          )}
        </select>
        <button onClick={handleOpenModal} className={styles.button}>
          시트 추가하기
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
