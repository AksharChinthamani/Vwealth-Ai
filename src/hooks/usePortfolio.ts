import { useState, useCallback } from "react";
import { Investment } from "../types";
import { savePortfolio, loadPortfolio } from "../utils/storage";

export const usePortfolio = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserPortfolio = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const data = await loadPortfolio(email);
      setInvestments(data);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserPortfolio = useCallback(
    async (email: string, data: Investment[]) => {
      try {
        await savePortfolio(email, data);
      } catch (error) {
        console.error("Error saving portfolio:", error);
      }
    },
    []
  );

  const addInvestment = useCallback(
    (investment: Investment) => {
      setInvestments((prev) => [...prev, investment]);
    },
    []
  );

  const removeInvestment = useCallback((id: number) => {
    setInvestments((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const updateInvestment = useCallback((id: number, updated: Partial<Investment>) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv))
    );
  }, []);

  return {
    investments,
    setInvestments,
    loading,
    loadUserPortfolio,
    saveUserPortfolio,
    addInvestment,
    removeInvestment,
    updateInvestment,
  };
};
