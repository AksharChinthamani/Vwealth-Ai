import React from "react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { CompanyField } from "../ui/CompanyField";
import { INPUT_STYLE, ASSET_TYPES } from "../../utils/constants";
import { FormState, CompanyData } from "../../types";

interface AddInvestmentFormProps {
  form: FormState;
  onFormChange: (updates: Partial<FormState>) => void;
  onCompanySelect: (company: CompanyData) => void;
  onCompanyValidate: (name: string) => void;
  companyError: string;
  onAdd: () => void;
  onSkip?: () => void;
  isOnboarding?: boolean;
}

export const AddInvestmentForm: React.FC<AddInvestmentFormProps> = ({
  form,
  onFormChange,
  onCompanySelect,
  onCompanyValidate,
  companyError,
  onAdd,
  onSkip,
  isOnboarding = false,
}) => {
  return (
    <Card>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
        Asset Type
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {ASSET_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onFormChange({ type: type as any })}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: `1.5px solid ${form.type === type ? "#6C63FF" : "#e2e8f0"}`,
              background:
                form.type === type ? "rgba(108,99,255,0.08)" : "#fff",
              color: form.type === type ? "#6C63FF" : "#94a3b8",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <CompanyField
        value={form.company}
        onChange={(value) => onFormChange({ company: value })}
        onSelect={onCompanySelect}
        onValidate={onCompanyValidate}
        error={companyError}
      />

      {[
        { label: "Amount Invested (₹) *", placeholder: "e.g. 25000", key: "amount" },
        { label: "Investment Duration *", placeholder: "e.g. 1 year, 6 months", key: "duration" },
        { label: "Expected Profit / Return", placeholder: "e.g. 20% or ₹5000", key: "expectedProfit" },
        { label: "Additional Notes (optional)", placeholder: "Any notes", key: "notes" },
      ].map((field) => (
        <div key={field.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 600 }}>
            {field.label}
          </div>
          <input
            placeholder={field.placeholder}
            value={form[field.key as keyof FormState] as string}
            onChange={(e) => {
              const val = e.target.value;
              if (field.key === "amount" && val !== "" && !/^\d*\.?\d*$/.test(val)) return;
              onFormChange({ [field.key]: val });
            }}
            style={INPUT_STYLE}
          />
        </div>
      ))}

      {isOnboarding ? (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Button onClick={onAdd} style={{ flex: 1, padding: "12px 0" }}>
            Add & Enter Dashboard →
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            style={{ flex: 1, padding: "12px 0", border: "1.5px solid #e2e8f0" }}
          >
            Skip for Now
          </Button>
        </div>
      ) : (
        <Button onClick={onAdd} style={{ width: "100%", padding: "13px 0", fontSize: 15, marginTop: 6 }}>
          Add Investment →
        </Button>
      )}

      {!isOnboarding && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 12 }}>
          ⚠️ Only NSE/BSE listed companies accepted. Not financial advice.
        </p>
      )}
    </Card>
  );
};
