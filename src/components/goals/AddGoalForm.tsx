import React, { useState } from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { FinancialGoal } from "../../types";

interface AddGoalFormProps {
  onAdd: (goal: Omit<FinancialGoal, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  color: "#1a1a2e",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Segoe UI',sans-serif",
  marginBottom: 12,
};

export const AddGoalForm: React.FC<AddGoalFormProps> = ({ onAdd, onCancel, isLoading = false }) => {
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    priority: "Medium" as const,
    category: "Other" as const,
  });

  const handleSubmit = () => {
    if (isLoading) return;
    if (!form.title.trim() || !form.targetAmount || !form.deadline) return;

    const target = parseInt(form.targetAmount);
    if (isNaN(target) || target <= 0) return;

    // Calculate months left to provide a sensible monthly contribution
    const monthsLeft = Math.max(1, Math.ceil(
      (new Date(form.deadline).getTime() - Date.now()) / (1000 * 3600 * 24 * 30)
    ));

    onAdd({
      title: form.title.trim(),
      targetAmount: target,
      currentAmount: 0,
      deadline: form.deadline,
      priority: form.priority,
      category: form.category,
      monthlyContribution: Math.round(target / monthsLeft),
      aiSuggestion: `Based on your goal, you should save ₹${Math.round(target / monthsLeft)} monthly.`,
    });
  };

  return (
    <Card style={{ maxWidth: 500, margin: "0 auto" }}>
      <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>🎯 Create New Financial Goal</h3>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Goal Title</label>
        <input
          placeholder="e.g. Buy House in Hyderabad"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={inputStyle}
          disabled={isLoading}
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Target Amount (₹)</label>
        <input
          type="number"
          placeholder="Target Amount (₹)"
          value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          style={inputStyle}
          disabled={isLoading}
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Target Date</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          style={inputStyle}
          disabled={isLoading}
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as any })}
          style={inputStyle}
          disabled={isLoading}
        >
          <option value="Retirement">Retirement</option>
          <option value="House">House</option>
          <option value="Education">Children's Education</option>
          <option value="Wedding">Wedding</option>
          <option value="Car">Car</option>
          <option value="Emergency">Emergency Fund</option>
          <option value="Other">Other</option>
        </select>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Priority</label>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
          style={{ ...inputStyle, marginBottom: 20 }}
          disabled={isLoading}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Button onClick={onCancel} variant="outline" style={{ flex: 1 }} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSubmit} style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Generating AI suggestions..." : "Create Goal"}
        </Button>
      </div>
    </Card>
  );
};
