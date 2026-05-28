import { Investment } from "../types";

export const calculateTotalInvested = (investments: Investment[]): number => {
  return investments.reduce((sum, inv) => {
    const val = typeof inv.amount === "number" ? inv.amount : parseFloat(inv.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};

export const getSectorData = (investments: Investment[]) => {
  const sectorMap = investments.reduce(
    (acc, inv) => {
      const val = typeof inv.amount === "number" ? inv.amount : parseFloat(inv.amount);
      if (isNaN(val)) return acc;
      acc[inv.sector] = (acc[inv.sector] || 0) + val;
      return acc;
    },
    {} as Record<string, number>
  );
  return Object.entries(sectorMap).map(([name, value]) => ({ name, value }));
};

export const getProfitData = (investments: Investment[]) => {
  return investments.map((inv) => {
    const rawProfit = inv.expectedProfit ? inv.expectedProfit.toString() : "0";
    const expProfit = parseFloat(rawProfit.replace(/[^0-9.]/g, ""));
    const val = isNaN(expProfit) ? 0 : expProfit;
    
    const amount = typeof inv.amount === "number" ? inv.amount : parseFloat(inv.amount);
    const validAmount = isNaN(amount) ? 0 : amount;

    const profit = rawProfit.includes("%")
      ? (validAmount * val) / 100
      : val;
      
    return {
      name: inv.company.split(" ")[0],
      Invested: validAmount,
      "Exp.Profit": Math.round(profit),
    };
  });
};

export const getMarketData = (investments: Investment[]) => {
  return investments.map((inv) => {
    const amount = typeof inv.amount === "number" ? inv.amount : parseFloat(inv.amount);
    const validAmount = isNaN(amount) ? 0 : amount;
    
    // Deterministic simulation based on ID so the chart doesn't jitter on re-render
    const variance = (inv.id % 100) / 400; // Gives a consistent 0% - 25% gain
    const simulatedMarketValue = Math.round(validAmount * (1.08 + variance));
    
    return {
      name: inv.company.split(" ")[0],
      Invested: validAmount,
      "Market Value": simulatedMarketValue,
    };
  });
};

export const getFilteredCompanies = (
  companies: any[],
  search: string,
  limit: number = 8
) => {
  if (search.length === 0) return companies.slice(0, limit);
  return companies
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, limit);
};

export const validateEmail = (email: string): boolean => {
  return email.includes("@");
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
