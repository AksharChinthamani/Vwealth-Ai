import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  style = {},
  variant = "primary",
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "10px 18px",
      borderRadius: 12,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 700,
      fontSize: 14,
      fontFamily: "'Segoe UI',sans-serif",
      opacity: disabled ? 0.6 : 1,
      background:
        variant === "primary"
          ? "linear-gradient(90deg,#6C63FF,#00D4AA)"
          : variant === "outline"
            ? "transparent"
            : "#f1f5f9",
      color:
        variant === "outline"
          ? "#6C63FF"
          : variant === "ghost"
            ? "#64748b"
            : "#fff",
      border: variant === "outline" ? "1.5px solid #6C63FF" : "none",
      boxShadow:
        variant === "primary" ? "0 4px 15px rgba(108,99,255,0.25)" : "none",
      ...style,
    }}
  >
    {children}
  </button>
);
