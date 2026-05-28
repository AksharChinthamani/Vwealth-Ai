import React from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { Investment } from "../../types";

interface InvestmentTableProps {
  investments: Investment[];
  onAnalyze: (investment: Investment) => void;
  onRemove: (id: number, name: string) => void;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  onAnalyze,
  onRemove,
}) => {
  if (investments.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: 50 }}>
        <div style={{ color: "#64748b" }}>
          No investments yet.{" "}
          <span
            style={{ color: "#6C63FF", cursor: "pointer", fontWeight: 700 }}
            onClick={() => window.location.hash = "#add"}
          >
            Add one →
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 650,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              {["#", "Company", "Symbol", "Type", "Sector", "Invested", "Duration", "Expected", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 700,
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {investments.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{i + 1}</td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{inv.company}</div>
                  <div style={{ color: "#94a3b8", fontSize: 10 }}>{inv.addedOn}</div>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      background: "rgba(108,99,255,0.1)",
                      color: "#6C63FF",
                      fontWeight: 700,
                    }}
                  >
                    {inv.symbol}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>
                  {inv.type}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>
                  {inv.sector}
                </td>
                <td style={{ padding: "12px 14px", fontWeight: 800, color: "#6C63FF" }}>
                  ₹{inv.amount.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>
                  {inv.duration}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#00D4AA", fontWeight: 600 }}>
                  {inv.expectedProfit || "—"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      onClick={() => onAnalyze(inv)}
                      style={{ padding: "5px 10px", fontSize: 11 }}
                    >
                      Analyze
                    </Button>
                    <button
                      onClick={() => onRemove(inv.id, inv.company)}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(255,107,107,0.1)",
                        color: "#FF6B6B",
                        border: "1px solid rgba(255,107,107,0.3)",
                        borderRadius: 7,
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
