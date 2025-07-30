"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalToast = () => {
  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
        toastStyle={{
          backgroundColor: "#0B7459",
          color: "white",
          fontWeight: "600",
          fontSize: "15px",
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "0 10px 25px rgba(11, 116, 89, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          minHeight: "60px",
        }}
        progressStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          height: "3px",
        }}
        closeButton={{
          color: "white",
          fontSize: "18px",
        }}
        className="custom-toast-container"
      />
      
      <style jsx global>{`
        .custom-toast-container {
          width: auto;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .Toastify__toast {
          margin-bottom: 12px;
          animation: slideInDown 0.3s ease-out;
        }
        
        .Toastify__toast--success {
          background: linear-gradient(135deg, #10B981, #059669) !important;
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #EF4444, #DC2626) !important;
        }
        
        .Toastify__toast--warning {
          background: linear-gradient(135deg, #F59E0B, #D97706) !important;
        }
        
        .Toastify__toast--info {
          background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
        }
        
        .Toastify__toast--default {
          background: linear-gradient(135deg, #0B7459, #065F46) !important;
        }
        
        .Toastify__close-button {
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
        
        .Toastify__close-button:hover {
          opacity: 1;
        }
        
        .Toastify__progress-bar {
          border-radius: 0 0 12px 12px;
        }
        
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .custom-toast-container {
            max-width: 90%;
            margin: 0 5%;
          }
          
          .Toastify__toast {
            margin-bottom: 8px;
            font-size: 14px !important;
            padding: 12px 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default GlobalToast;