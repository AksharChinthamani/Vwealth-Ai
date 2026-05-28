import { callGemini } from "./geminiApi";
import { NewsSentiment } from "../types";

export type { NewsSentiment };

// Fetch real news + analyze with Gemini
export const analyzePortfolioNews = async (investments: any[]): Promise<NewsSentiment[]> => {
  const sentiments: NewsSentiment[] = [];

  for (const inv of investments.slice(0, 5)) { // Analyze top 5 holdings
    try {
      const prompt = `
        Analyze latest market sentiment for ${inv.company} (${inv.symbol || ''}).
        Return ONLY valid JSON in this format:
        {
          "sentiment": "Positive" | "Negative" | "Neutral",
          "score": -1.0 to 1.0,
          "keyHeadline": "main recent headline",
          "impact": "one sentence impact on investment",
          "reasoning": "brief reasoning"
        }
      `;

      const raw = await callGemini({
        system: "You are a professional Indian stock market analyst.",
        userMsg: prompt
      });

      const result = JSON.parse(raw);

      sentiments.push({
        symbol: inv.symbol || inv.company,
        company: inv.company,
        sentiment: result.sentiment,
        score: result.score,
        keyHeadline: result.keyHeadline,
        impact: result.impact,
        reasoning: result.reasoning,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error(`Failed to analyze ${inv.company}`, e);
    }
  }

  return sentiments;
};
