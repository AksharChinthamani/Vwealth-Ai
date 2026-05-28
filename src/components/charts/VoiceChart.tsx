import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { COLORS } from "../../utils/constants";
import { VoiceChartData } from "../../types";

interface VoiceChartProps {
  chart: VoiceChartData;
}

export const VoiceChart: React.FC<VoiceChartProps> = ({ chart }) => {
  if (!chart?.data?.length) return null;

  const keys = Object.keys(chart.data[0] || {}).filter((k) => k !== "name");

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
        {chart.title}
      </div>
      <ResponsiveContainer width="100%" height={190}>
        {chart.type === "pie" ? (
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              outerRadius={70}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chart.data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
            />
          </PieChart>
        ) : chart.type === "line" ? (
          <LineChart data={chart.data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
            <Legend />
            {keys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={COLORS[i]}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={chart.data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
            <Legend />
            {keys.map((k, i) => (
              <Bar
                key={k}
                dataKey={k}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
