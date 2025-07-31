"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalToast = () => {
  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={3500} // تقليل وقت الإغلاق التلقائي
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false} // إلغاء الإيقاف عند فقدان التركيز
        draggable
        pauseOnHover={false} // إلغاء الإيقاف عند التمرير
        theme="colored"
        limit={4}
        toastStyle={{
          backgroundColor: "#1F2937",
          color: "white",
          fontWeight: "500",
          fontSize: "14px",
          borderRadius: "16px",
          padding: "14px 18px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          border: "none",
          backdropFilter: "blur(16px)",
          minHeight: "56px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        progressStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          height: "2px",
        }}
        closeButton={false} // إزالة زر الإغلاق لتسريع الإغلاق التلقائي
        className="custom-toast-container"
      />
      
      <style jsx global>{`
        .custom-toast-container {
          width: auto;
          max-width: 420px;
          margin: 0 auto;
          z-index: 9999;
        }
        
        .Toastify__toast {
          margin-bottom: 10px;
          animation: slideInUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        
        .Toastify__toast--success {
          background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%) !important;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(52, 211, 153, 0.1) !important;
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%) !important;
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(248, 113, 113, 0.1) !important;
        }
        
        .Toastify__toast--warning {
          background: linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%) !important;
          box-shadow: 0 8px 32px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(251, 191, 36, 0.1) !important;
        }
        
        .Toastify__toast--info {
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%) !important;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(96, 165, 250, 0.1) !important;
        }
        
        .Toastify__toast--default {
          background: linear-gradient(135deg, #374151 0%, #1F2937 50%, #111827 100%) !important;
          box-shadow: 0 8px 32px rgba(31, 41, 55, 0.25), 0 0 0 1px rgba(75, 85, 99, 0.1) !important;
        }
        
        .Toastify__progress-bar {
          border-radius: 0 0 16px 16px;
          background: rgba(255, 255, 255, 0.25) !important;
        }
        
        .Toastify__toast-body {
          padding: 0;
          margin: 0;
          line-height: 1.4;
        }
        
        .Toastify__toast-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .Toastify__toast--success .Toastify__progress-bar {
          background: rgba(52, 211, 153, 0.3) !important;
        }
        
        .Toastify__toast--error .Toastify__progress-bar {
          background: rgba(248, 113, 113, 0.3) !important;
        }
        
        .Toastify__toast--warning .Toastify__progress-bar {
          background: rgba(251, 191, 36, 0.3) !important;
        }
        
        .Toastify__toast--info .Toastify__progress-bar {
          background: rgba(96, 165, 250, 0.3) !important;
        }
        
        @media (max-width: 768px) {
          .custom-toast-container {
            max-width: calc(100% - 32px);
            margin: 0 16px;
          }
          
          .Toastify__toast {
            margin-bottom: 8px;
            font-size: 13px !important;
            padding: 12px 16px !important;
            border-radius: 12px !important;
          }
          
          .Toastify__toast-icon {
            width: 18px;
            height: 18px;
            margin-right: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .custom-toast-container {
            max-width: calc(100% - 24px);
            margin: 0 12px;
          }
          
          .Toastify__toast {
            font-size: 12px !important;
            padding: 10px 14px !important;
          }
        }
      `}</style>
    </>
  );
};

export default GlobalToast;