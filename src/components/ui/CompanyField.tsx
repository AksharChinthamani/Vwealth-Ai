import React, { useState } from "react";
import { NSE_COMPANIES } from "../../data/nseCompanies";
import { CompanyData } from "../../types";
import { INPUT_STYLE } from "../../utils/constants";
import { getFilteredCompanies } from "../../utils/helpers";

interface CompanyFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (company: CompanyData) => void;
  onValidate: (name: string) => void;
  error: string;
}

export const CompanyField: React.FC<CompanyFieldProps> = ({
  value,
  onChange,
  onSelect,
  onValidate,
  error,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = getFilteredCompanies(NSE_COMPANIES, value);

  const selectCompany = (company: CompanyData) => {
    onSelect(company);
    onChange(company.name);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 180);
    onValidate(value);
  };

  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 600 }}>
        Company Name (NSE / BSE listed) *
      </div>
      <input
        placeholder="Search company e.g. TCS, Reliance..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        style={{
          ...INPUT_STYLE,
          border: error ? "1.5px solid #FF6B6B" : "1.5px solid #e2e8f0",
        }}
      />
      {showDropdown && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            zIndex: 200,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {filtered.map((company) => (
            <div
              key={company.symbol}
              onClick={() => selectCompany(company)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{company.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{company.sector}</div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#6C63FF",
                  fontWeight: 700,
                  background: "rgba(108,99,255,0.1)",
                  padding: "2px 8px",
                  borderRadius: 6,
                  alignSelf: "center",
                }}
              >
                {company.symbol}
              </span>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div style={{ color: "#FF6B6B", fontSize: 12, marginTop: 4 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
