import React from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Investment, AnalysisResult } from "../../types";

interface AssetAnalysisCardProps {
  investment: Investment;
  analysis: AnalysisResult | null;
  isLoading: boolean;
  onAnalyze: (investment: Investment) => void;
}

export const AssetAnalysisCard: React.FC<AssetAnalysisCardProps> = ({
  investment,
  analysis,
  isLoading,
  onAnalyze,
}) => {
  const recommendationColor =
    analysis?.recommendation === "BUY MORE"
      ? "#00D4AA"
      : analysis?.recommendation === "WITHDRAW"
        ? "#FF6B6B"
        : analysis?.recommendation === "REDUCE"
          ? "#FFB347"
          : "#6C63FF";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{investment.company}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            {investment.symbol} · {investment.type} · ₹
            {investment.amount.toLocaleString("en-IN")}
          </div>
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{investment.duration}</span>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#6C63FF" }}>
          <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block" }}>
            ⟳
          </div>
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>
            Analyzing {investment.company}...
          </div>
        </div>
      ) : analysis ? (
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
                background: `${recommendationColor}18`,
                color: recommendationColor,
              }}
            >
              {analysis.recommendation}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 12,
                background: "#f1f5f9",
                color: "#64748b",
              }}
            >
              Risk: {analysis.risk_level}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 12,
                background: "rgba(0,212,170,0.1)",
                color: "#00D4AA",
              }}
            >
              Profit: {analysis.profit_probability}%
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 12,
                background: "rgba(255,107,107,0.1)",
                color: "#FF6B6B",
              }}
            >
              Loss: {analysis.loss_probability}%
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            {analysis.verdict}
          </div>
          <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
            {analysis.reasoning}
          </div>
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, fontWeight: 800 }}>
              RECOMMENDED ACTION
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{analysis.action}</div>
            {analysis.suggested_increase_amount && (
              <div style={{ color: "#00D4AA", fontSize: 12, marginTop: 5, fontWeight: 600 }}>
                💰 Add: {analysis.suggested_increase_amount}
              </div>
            )}
            {analysis.suggested_withdraw_amount && (
              <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 5, fontWeight: 600 }}>
                🔴 Withdraw: {analysis.suggested_withdraw_amount}
              </div>
            )}
          </div>
          {(analysis.key_factors || []).map((factor, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                color: "#94a3b8",
                padding: "3px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              • {factor}
            </div>
          ))}
          <div
            style={{
              fontSize: 10,
              color: "#94a3b8",
              fontStyle: "italic",
              marginTop: 8,
            }}
          >
            {analysis.disclaimer}
          </div>
          <Button
            onClick={() => onAnalyze(investment)}
            style={{ marginTop: 10, fontSize: 11, padding: "4px 12px" }}
            variant="ghost"
          >
            Re-analyze ↻
          </Button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Button onClick={() => onAnalyze(investment)}>Run AI Analysis →</Button>
          <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 8 }}>
            Powered by Gemini AI
          </div>
        </div>
      )}
    </Card>
  );
};
