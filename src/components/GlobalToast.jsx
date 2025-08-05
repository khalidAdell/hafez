"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalToast = () => {
  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeButton={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        limit={4}
        toastStyle={{
          backgroundColor: "green",
          color: "white",
          fontWeight: "500",
          fontSize: "14px",
          borderRadius: "16px",
          padding: "14px 18px",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          border: "none",
          minHeight: "56px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        progressStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          height: "2px",
        }}
        className="custom-toast-container"
      />

      <style jsx global>{`

        .Toastify__toast--success {
          background: linear-gradient(
            135deg,
            #059669 0%,
            #10b981 50%,
            #34d399 100%
          ) !important;
        }

        .Toastify__toast--error {
          background: linear-gradient(
            135deg,
            #dc2626 0%,
            #ef4444 50%,
            #f87171 100%
          ) !important;
        }

        .Toastify__toast--warning {
          background: linear-gradient(
            135deg,
            #d97706 0%,
            #f59e0b 50%,
            #fbbf24 100%
          ) !important;
        }

        .Toastify__toast--info {
          background: linear-gradient(
            135deg,
            #2563eb 0%,
            #3b82f6 50%,
            #60a5fa 100%
          ) !important;
        }
 
        
      `}</style>
    </>
  );
};

export default GlobalToast;