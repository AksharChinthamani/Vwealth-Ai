import React from "react";
import { Card } from "../common/Card";
import { FinancialGoal } from "../../types";

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
  onRefreshAI: (goal: FinancialGoal) => void;
  isRefreshingAI?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onRefreshAI, isRefreshingAI = false }) => {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const monthsLeft = Math.max(0, Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24 * 30)
  ));

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{goal.title}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {goal.category} • Deadline: {new Date(goal.deadline).toLocaleDateString('en-IN')}
          </div>
        </div>
        <button
          onClick={() => onEdit(goal)}
          style={{
            fontSize: 11,
            color: "#6C63FF",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            padding: 0,
          }}
        >
          Update Progress
        </button>
      </div>

      <div style={{ margin: "14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "#64748b" }}>Progress</span>
          <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{progress.toFixed(0)}%</span>
        </div>
        <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6C63FF,#00D4AA)" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
        <div style={{ color: "#1a1a2e" }}>₹{goal.currentAmount.toLocaleString("en-IN")} saved</div>
        <div style={{ color: monthsLeft < 6 ? "#FF6B6B" : "#00D4AA", fontWeight: 700 }}>
          {monthsLeft} months left
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "#475569" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <strong style={{ color: "#6C63FF" }}>AI Advisor Plan</strong>
          <button
            onClick={() => onRefreshAI(goal)}
            disabled={isRefreshingAI}
            style={{
              fontSize: 10.5,
              color: "#00D4AA",
              background: "none",
              border: "none",
              cursor: isRefreshingAI ? "not-allowed" : "pointer",
              fontWeight: 700,
              padding: 0,
            }}
          >
            {isRefreshingAI ? "Re-analyzing..." : "Refresh Advice ⟳"}
          </button>
        </div>
        <div style={{ lineHeight: 1.45, fontSize: 11.5, color: "#334155" }}>
          {goal.aiSuggestion || `Save ₹${goal.monthlyContribution.toLocaleString("en-IN")}/month to reach this goal.`}
        </div>
      </div>
    </Card>
  );
};
