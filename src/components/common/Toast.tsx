import React from "react";
import { Toast as ToastType } from "../../types";

interface ToastProps {
  toast: ToastType | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) =>
  toast ? (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        background: toast.type === "error" ? "#FF6B6B" : "#00D4AA",
        color: "#fff",
        padding: "12px 22px",
        borderRadius: 12,
        fontWeight: 700,
        zIndex: 9999,
        boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
      }}
    >
      {toast.msg}
    </div>
  ) : null;
