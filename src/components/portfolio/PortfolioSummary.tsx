import React from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Investment, PortfolioAnalysis } from "../../types";
import { calculateTotalInvested } from "../../utils/helpers";
import { COLORS } from "../../utils/constants";

interface PortfolioSummaryProps {
  investments: Investment[];
  portfolioAnalysis: PortfolioAnalysis | null;
  isLoading: boolean;
  onAnalyzePortfolio: () => void;
  onAnalyzeAsset: (investment: Investment) => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  investments,
  portfolioAnalysis,
  isLoading,
  onAnalyzePortfolio,
  onAnalyzeAsset,
}) => {
  const totalInvested = calculateTotalInvested(investments);
  const sectorsCount = new Set(investments.map((i) => i.sector)).size;
  const assetTypesCount = new Set(investments.map((i) => i.type)).size;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total Invested",
            value: `₹${totalInvested.toLocaleString("en-IN")}`,
            sub: `${investments.length} investments`,
            color: "#6C63FF",
            icon: "💰",
          },
          {
            label: "Sectors",
            value: sectorsCount,
            sub: [...new Set(investments.map((i) => i.sector))]
              .slice(0, 2)
              .join(", "),
            color: "#00D4AA",
            icon: "🏭",
          },
          {
            label: "Asset Types",
            value: assetTypesCount,
            sub: [...new Set(investments.map((i) => i.type))].join(", "),
            color: "#FFB347",
            icon: "📊",
          },
        ].map((stat, i) => (
          <Card key={i} style={{ borderTop: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>
              {stat.sub}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15 }}>Your Holdings</div>
          <Button
            onClick={onAnalyzePortfolio}
            disabled={isLoading}
            style={{ fontSize: 12, padding: "8px 16px" }}
          >
            {isLoading ? "⟳ Analyzing..." : "🤖 Full Portfolio AI"}
          </Button>
        </div>

        {portfolioAnalysis && (
          <div
            style={{
              background: "linear-gradient(135deg,rgba(108,99,255,0.06),rgba(0,212,170,0.06))",
              border: "1.5px solid rgba(108,99,255,0.2)",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              {[
                { label: `Health: ${portfolioAnalysis.overall_health}`, color: "#00D4AA" },
                { label: `Risk: ${portfolioAnalysis.risk_score}/10`, color: "#FFB347" },
                { label: `Diversification: ${portfolioAnalysis.diversification_score}/10`, color: "#4ECDC4" },
                { label: `Expected: ${portfolioAnalysis.expected_return_range}`, color: "#6C63FF" },
              ].map((badge, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: `${badge.color}18`,
                    color: badge.color,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
              {portfolioAnalysis.portfolio_verdict}
            </div>
            <div style={{ color: "#00D4AA", fontSize: 13, fontWeight: 700 }}>
              🎯 {portfolioAnalysis.top_recommendation}
            </div>
            {portfolioAnalysis.alerts?.map((alert, i) => (
              <div key={i} style={{ color: "#FF6B6B", fontSize: 12, marginTop: 4 }}>
                ⚠️ {alert}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {investments.map((inv, i) => (
            <div
              key={inv.id}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 14,
                borderLeft: `4px solid ${COLORS[i % COLORS.length]}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inv.company}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                    {inv.symbol} · {inv.type}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#6C63FF", marginTop: 6 }}>
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>
                    {inv.duration}
                  </div>
                </div>
                <Button
                  onClick={() => onAnalyzeAsset(inv)}
                  style={{ marginLeft: 8, padding: "6px 12px", fontSize: 11 }}
                >
                  Analyze
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
