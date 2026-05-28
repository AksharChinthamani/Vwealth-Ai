import React from "react";
import { Card } from "../common/Card";
import { NewsSentiment } from "../../types";

interface NewsSentimentPanelProps {
  sentiments: NewsSentiment[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const NewsSentimentPanel: React.FC<NewsSentimentPanelProps> = ({
  sentiments,
  isLoading,
  onRefresh,
}) => {
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "#00D4AA";
    if (score < -0.3) return "#FF6B6B";
    return "#FFB347";
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>📰 Market Sentiment Analysis</div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            fontSize: 12,
            padding: "8px 16px",
            background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(108,99,255,0.15)",
          }}
        >
          {isLoading ? "Refreshing..." : "Refresh News"}
        </button>
      </div>

      {sentiments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
          Click "Refresh News" to analyze latest market sentiment on your holdings
        </div>
      ) : (
        <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {sentiments.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "14px 0",
                borderBottom: index !== sentiments.length - 1 ? "1px solid #f1f5f9" : "none",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: getSentimentColor(item.score) + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {item.sentiment === "Positive" ? "📈" : item.sentiment === "Negative" ? "📉" : "➡️"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14 }}>{item.company}</div>
                <div style={{ fontSize: 13, color: "#64748b", margin: "4px 0 6px 0", fontWeight: 500 }}>{item.keyHeadline}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#475569" }}>{item.impact}</div>
              </div>

              <div style={{ textAlign: "right", minWidth: 80 }}>
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: getSentimentColor(item.score) + "15",
                    color: getSentimentColor(item.score),
                    display: "inline-block",
                  }}
                >
                  {item.sentiment}
                </div>
                <div style={{ fontSize: 11, marginTop: 6, color: "#94a3b8", fontWeight: 600 }}>
                  Score: {(item.score * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
