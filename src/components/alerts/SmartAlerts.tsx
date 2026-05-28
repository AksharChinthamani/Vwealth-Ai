import React from "react";
import { Card } from "../common/Card";
import { Alert } from "../../types";

interface SmartAlertsProps {
  alerts: Alert[];
  onMarkRead: (id: number) => void;
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ alerts, onMarkRead }) => {
  const unread = alerts.filter(a => !a.read);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>🛎️ Smart Alerts Feed</div>
        <div style={{ fontSize: 12, padding: "4px 8px", background: unread.length > 0 ? "rgba(255,107,107,0.15)" : "#f1f5f9", color: unread.length > 0 ? "#FF6B6B" : "#64748b", borderRadius: 8, fontWeight: 700 }}>
          {unread.length} unread
        </div>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛎️</div>
          No alerts yet. We'll notify you about important market and portfolio events.
        </div>
      ) : (
        <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onMarkRead(alert.id)}
              style={{
                padding: "14px",
                background: alert.read ? "#f8fafc" : "#f0f9ff",
                borderRadius: 12,
                cursor: "pointer",
                borderLeft: `4px solid ${
                  alert.severity === "high" ? "#FF6B6B" : alert.severity === "medium" ? "#FFB347" : "#00D4AA"
                }`,
                transition: "all 0.2s",
                border: "1px solid rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1a1a2e" }}>{alert.title}</div>
                {!alert.read && (
                  <span style={{ width: 8, height: 8, background: "#6C63FF", borderRadius: "50%" }} />
                )}
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>{alert.message}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
                {new Date(alert.timestamp).toLocaleDateString("en-IN")} • {new Date(alert.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
