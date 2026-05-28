import { MODEL } from "../utils/constants";
import { AnalysisResult, PortfolioAnalysis } from "../types";

interface CallClaudeParams {
  system: string;
  userMsg: string;
  maxTokens?: number;
}

export const callClaude = async ({
  system,
  userMsg,
  maxTokens = 1000,
}: CallClaudeParams): Promise<string> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("Anthropic API key is missing. Please add it to your .env file.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const raw = (data.content || []).map((b: any) => b.text || "").join("");
  
  // Robust JSON extraction
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON.");
  }
  return jsonMatch[0];
};

export const analyzeAssetAPI = async (
  userName: string,
  company: string,
  symbol: string,
  sector: string,
  type: string,
  amount: number,
  duration: string,
  expectedProfit: string
): Promise<AnalysisResult> => {
  const raw = await callClaude({
    system: `You are VwealtH AI, an Indian stock market advisor. Respond ONLY with valid JSON (no markdown, no backticks, no extra text): {"recommendation":"BUY MORE|HOLD|WITHDRAW|REDUCE","verdict":"one sentence","reasoning":"2-3 sentences","risk_level":"Low|Medium|High","profit_probability":<0-100>,"loss_probability":<0-100>,"action":"specific action in INR","suggested_increase_amount":"INR amount or null","suggested_withdraw_amount":"INR amount or null","key_factors":["f1","f2","f3"],"disclaimer":"Not financial advice."}`,
    userMsg: `Analyze for ${userName}: ${company} (${symbol}), sector: ${sector}, type: ${type}, amount invested: ₹${amount}, duration: ${duration}, expected profit: ${
      expectedProfit || "not set"
    }. Give a realistic Indian market analysis.`,
    maxTokens: 900,
  });
  return JSON.parse(raw);
};

export const analyzePortfolioAPI = async (
  userName: string,
  userRole: string,
  investments: any[]
): Promise<PortfolioAnalysis> => {
  const summary = investments
    .map(
      (i) => `${i.company}: ₹${i.amount} for ${i.duration}, expected ${i.expectedProfit || "unspecified"}`
    )
    .join("; ");
  const total = investments.reduce((s: number, i: any) => s + i.amount, 0);

  const raw = await callClaude({
    system: `You are VwealtH AI, an Indian stock market portfolio advisor. Respond ONLY with valid JSON (no markdown, no backticks, no extra text): {"overall_health":"Excellent|Good|Fair|Poor","portfolio_verdict":"2 sentences","top_recommendation":"single most important action","diversification_score":<1-10>,"risk_score":<1-10>,"expected_return_range":"e.g. 8-15%","best_asset":"company name","weakest_asset":"company name","alerts":["a1","a2"],"disclaimer":"Not financial advice."}`,
    userMsg: `Full portfolio analysis for ${userName} (${userRole}): ${summary}. Total invested: ₹${total.toLocaleString(
      "en-IN"
    )}. Give realistic Indian market insights.`,
    maxTokens: 900,
  });
  return JSON.parse(raw);
};

export const askAIAssistant = async (
  userName: string,
  query: string,
  investments: any[]
): Promise<{
  spoken: string;
  chart_type: string;
  chart_title: string;
  chart_data: any[];
}> => {
  const total = investments.reduce((s: number, i: any) => s + i.amount, 0);
  const invSummary =
    investments.length > 0
      ? investments
          .map(
            (i) =>
              `${i.company}(${i.symbol}): invested=₹${i.amount}, sector=${i.sector}, duration=${i.duration}, expectedProfit=${i.expectedProfit || "not set"}`
          )
          .join(" | ")
      : "No investments added yet.";

  const raw = await callClaude({
    system: `You are VwealtH AI assistant for ${userName}. Portfolio: ${invSummary}. Total invested: ₹${total.toLocaleString("en-IN")}.
Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{"spoken":"Friendly 1-2 sentence answer with real numbers from portfolio","chart_type":"bar|pie|line|none","chart_title":"descriptive title","chart_data":[{"name":"label","Value":number}]}
Rules:
- compare investments / amounts → bar chart, key=Invested
- profits / returns → bar with Invested and ExpectedProfit keys
- sector / allocation → pie chart, name=sector, value=total amount
- market / trend → line chart
- risk → bar with RiskScore key (estimate 1-10)
- general question → chart_type="none", chart_data=[]
Always use real company names and real ₹ amounts from the portfolio above.`,
    userMsg: query,
    maxTokens: 1000,
  });

  return JSON.parse(raw);
};
