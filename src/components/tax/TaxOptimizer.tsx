import React from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { TaxInsight } from "../../types";

interface TaxOptimizerProps {
  taxInsight: TaxInsight | null;
  isLoading: boolean;
  onAnalyzeTax: () => void;
}

export const TaxOptimizer: React.FC<TaxOptimizerProps> = ({
  taxInsight,
  isLoading,
  onAnalyzeTax,
}) => {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>🧾 Tax Optimization Panel</div>
        <Button onClick={onAnalyzeTax} disabled={isLoading} style={{ fontSize: 12, padding: "8px 16px" }}>
          {isLoading ? "Analyzing..." : "Analyze Tax"}
        </Button>
      </div>

      {taxInsight ? (
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#6C63FF", marginBottom: 4 }}>
            ₹{taxInsight.estimatedTaxLiability.toLocaleString("en-IN")}
          </div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            Estimated Tax Liability for current FY
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 10 }}>💡 Tax Saving Opportunities</div>
            {taxInsight.taxSavingSuggestions.map((suggestion, i) => (
              <div key={i} style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, marginBottom: 8, fontSize: 13, color: "#475569", borderLeft: "4px solid #6C63FF" }}>
                {suggestion}
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 10 }}>Recommended Instruments</div>
            {taxInsight.recommendedInstruments.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 13.5 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Limit: ₹{item.maxLimit.toLocaleString("en-IN")} • Benefit: {item.benefit}</div>
                </div>
                <div style={{ textAlign: "right", color: "#00D4AA", fontWeight: 700, fontSize: 14 }}>
                  ₹{item.suggestedAmount.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
          Click "Analyze Tax" to get personalized tax saving suggestions and instruments
        </div>
      )}
    </Card>
  );
};
