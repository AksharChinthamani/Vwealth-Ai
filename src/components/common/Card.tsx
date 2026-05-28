import React from "react";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.07)",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      ...style,
    }}
  >
    {children}
  </div>
);
