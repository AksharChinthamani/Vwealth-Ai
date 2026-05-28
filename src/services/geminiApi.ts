import { MODEL, FALLBACK_MODELS } from "../utils/constants";
import { AnalysisResult, PortfolioAnalysis, TaxInsight } from "../types";

interface CallGeminiParams {
  system: string;
  userMsg: string;
}

const keyCooldowns: Record<string, number> = {};
const COOLDOWN_DURATION = 60 * 1000; 
const RETRY_DELAY = 2000; 

export const callGemini = async ({
  system,
  userMsg,
}: CallGeminiParams): Promise<string> => {
  const env = import.meta.env;
  const baseUrl = env.VITE_GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";

  const apiKeys = Object.keys(env)
    .filter((k) => k.startsWith("VITE_GEMINI_API_KEY"))
    .map((k) => env[k])
    .filter((v) => v && !v.includes("your_"));

  if (apiKeys.length === 0) {
    throw new Error("No Gemini API keys found. Please add them to your .env file.");
  }

  const modelsToTry = [MODEL, ...FALLBACK_MODELS.filter(m => m !== MODEL)];
  
  let lastError: any = null;
  let retryCount = 0;
  const maxRetries = 5; // Increased retries

  for (const modelName of modelsToTry) {
    retryCount = 0; // Reset retry count for each model
    
    while (retryCount < maxRetries) {
      // Sort keys: prioritize those not in cooldown
      const sortedKeys = [...apiKeys].sort((a, b) => {
        const cdA = keyCooldowns[a] || 0;
        const cdB = keyCooldowns[b] || 0;
        return cdA - cdB;
      });

      const availableKeys = sortedKeys.filter((k) => !keyCooldowns[k] || keyCooldowns[k] < Date.now());

      if (availableKeys.length === 0) {
        if (retryCount < maxRetries - 1) {
          const waitTime = Math.min(Math.pow(2, retryCount) * RETRY_DELAY, 10000);
          console.log(`All keys in cooldown for ${modelName}. Waiting ${waitTime/1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        // If no keys available for this model, break to try next model
        break;
      }

      for (const apiKey of availableKeys) {
        try {
          const res = await fetch(`${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userMsg }] }],
              system_instruction: { parts: [{ text: system }] },
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
              },
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const errMsg = err?.error?.message || "";
            
            // If model is not found or supported, don't bother with other keys or retries for this model
            if (res.status === 404 || errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("not supported")) {
              console.error(`Model ${modelName} is not available: ${errMsg}`);
              lastError = new Error(errMsg);
              retryCount = maxRetries; // Force break while loop
              break; // Break key loop
            }

            if (res.status === 429 || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("limit")) {
              // Extract wait time if present
              let dynamicCooldown = COOLDOWN_DURATION;
              const match = errMsg.match(/retry in ([\d\.]+)s/);
              if (match) {
                dynamicCooldown = (parseFloat(match[1]) + 1) * 1000;
              }
              
              keyCooldowns[apiKey] = Date.now() + dynamicCooldown;
              console.warn(`Key ...${apiKey.slice(-4)} limited on ${modelName}. CD: ${dynamicCooldown/1000}s. Error: ${errMsg}`);
              continue; // Try next key
            }
            
            throw new Error(errMsg || `API error ${res.status}`);
          }

          // Success! Clear cooldown for this key
          delete keyCooldowns[apiKey];
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("AI response did not contain valid JSON.");
          return jsonMatch[0];

        } catch (error: any) {
          lastError = error;
          console.warn(`Error with key ...${apiKey.slice(-4)} on ${modelName}:`, error.message);
          // If it's a structural error (not rate limit), don't bother retrying this key for this model
          continue;
        }
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
    // If we reach here, this model failed across all keys/retries. Try next model.
    console.log(`Model ${modelName} failed. Trying next model if available...`);
  }

  throw lastError || new Error("All API keys and models exceeded their rate limits. Please try again in a minute.");
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
  const raw = await callGemini({
    system: `You are VwealtH AI, an Indian stock market advisor. Respond ONLY with valid JSON: {"recommendation":"BUY MORE|HOLD|WITHDRAW|REDUCE","verdict":"one sentence","reasoning":"2-3 sentences","risk_level":"Low|Medium|High","profit_probability":<0-100>,"loss_probability":<0-100>,"action":"specific action in INR","suggested_increase_amount":"INR amount or null","suggested_withdraw_amount":"INR amount or null","key_factors":["f1","f2","f3"],"disclaimer":"Not financial advice."}`,
    userMsg: `Analyze for ${userName}: ${company} (${symbol}), sector: ${sector}, type: ${type}, amount invested: ₹${amount}, duration: ${duration}, expected profit: ${
      expectedProfit || "not set"
    }. Give a realistic Indian market analysis.`,
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

  const raw = await callGemini({
    system: `You are VwealtH AI, an Indian stock market portfolio advisor. Respond ONLY with valid JSON: {"overall_health":"Excellent|Good|Fair|Poor","portfolio_verdict":"2 sentences","top_recommendation":"single most important action","diversification_score":<1-10>,"risk_score":<1-10>,"expected_return_range":"e.g. 8-15%","best_asset":"company name","weakest_asset":"company name","alerts":["a1","a2"],"disclaimer":"Not financial advice."}`,
    userMsg: `Full portfolio analysis for ${userName} (${userRole}): ${summary}. Total invested: ₹${total.toLocaleString(
      "en-IN"
    )}. Give realistic Indian market insights.`,
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

  const raw = await callGemini({
    system: `You are VwealtH AI assistant for ${userName}. Portfolio: ${invSummary}. Total invested: ₹${total.toLocaleString("en-IN")}.
Respond ONLY with valid JSON:
{"spoken":"Friendly 1-2 sentence answer with real numbers from portfolio","chart_type":"bar|pie|line|none","chart_title":"descriptive title","chart_data":[{"name":"label","Value":number}]}
Rules:
- compare investments / amounts → bar chart, key=Value
- profits / returns → bar with Value key representing expected profit
- sector / allocation → pie chart, name=sector, Value=total amount
- market / trend → line chart
- risk → bar with Value key (estimate 1-10)
- general question → chart_type="none", chart_data=[]
Always use real company names and real ₹ amounts from the portfolio above.`,
    userMsg: query,
  });

  return JSON.parse(raw);
};

export const analyzeTaxAPI = async (
  userName: string,
  userRole: string,
  investments: any[]
): Promise<TaxInsight> => {
  const summary = investments
    .map(
      (i) => `${i.company} (${i.type}): invested ₹${i.amount}, expected return/profit: ${i.expectedProfit || "unspecified"}`
    )
    .join("; ");
  const total = investments.reduce((s: number, i: any) => s + i.amount, 0);

  const system = `You are VwealtH AI, a professional Indian tax optimization advisor. Based on the user's investment portfolio, compute a realistic estimated tax liability under Indian tax rules ( slab rates for FD interest/dividends, LTCG/STCG for mutual funds and equities). Provide clear suggestions on Section 80C, Section 80CCD, or other relevant saving strategies based on the current investments, and recommend exact instruments and amounts to invest.
Respond ONLY with valid JSON:
{
  "estimatedTaxLiability": number,
  "taxSavingSuggestions": ["specific suggestion 1", "specific suggestion 2"],
  "recommendedInstruments": [
    {
      "name": "instrument name (e.g., ELSS Mutual Funds, NPS, PPF)",
      "maxLimit": number,
      "suggestedAmount": number,
      "benefit": "tax benefit section"
    }
  ]
}`;

  const userMsg = `Tax optimization for investor ${userName} (Role: ${userRole}).
Active portfolio investments: ${summary || "No investments yet"}.
Total invested amount: ₹${total.toLocaleString("en-IN")}.
Generate specific, realistic tax insights under Indian FY 2025-26 rules.`;

  const raw = await callGemini({ system, userMsg });
  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    lastUpdated: new Date().toISOString(),
  };
};

export const suggestGoalAPI = async (
  userName: string,
  investments: any[],
  goal: {
    title: string;
    targetAmount: number;
    deadline: string;
    category: string;
    priority: string;
  }
): Promise<{
  monthlyContribution: number;
  aiSuggestion: string;
}> => {
  const summary = investments
    .map((i) => `${i.company} (${i.type}): invested ₹${i.amount}`)
    .join(", ");

  const system = `You are VwealtH AI, a smart financial planner. Help the user optimize progress for their financial goal: "${goal.title}" under category "${goal.category}" with priority "${goal.priority}", target amount ₹${goal.targetAmount}, and target date ${goal.deadline}.
Take their existing investments: [${summary || "No investments yet"}] into account when advising. Offer a personalized action plan in 2-3 sentences. Calculate a realistic monthly contribution (target amount divided by months left, or customized if their current assets can offset it).
Respond ONLY with valid JSON:
{
  "monthlyContribution": number,
  "aiSuggestion": "Personalized advice detailing how their existing holdings in their portfolio can help meet this goal, or where to direct new capital."
}`;

  const userMsg = `Generate planning advice for financial goal for ${userName}: ${JSON.stringify(goal)}`;

  const raw = await callGemini({ system, userMsg });
  return JSON.parse(raw);
};
