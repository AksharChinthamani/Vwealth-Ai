export interface User {
  name: string;
  email: string;
  password: string;
  role: "Retail Investor" | "Startup Founder" | "Both";
}

export interface Investment {
  id: number;
  company: string;
  symbol: string;
  sector: string;
  type: "Stock" | "ETF" | "Mutual Fund" | "Commodity" | "FD" | "Crypto";
  amount: number;
  duration: string;
  expectedProfit: string;
  notes: string;
  addedOn: string;
}

export interface CompanyData {
  name: string;
  symbol: string;
  sector: string;
}

export interface AnalysisResult {
  recommendation: "BUY MORE" | "HOLD" | "WITHDRAW" | "REDUCE";
  verdict: string;
  reasoning: string;
  risk_level: "Low" | "Medium" | "High";
  profit_probability: number;
  loss_probability: number;
  action: string;
  suggested_increase_amount: string | null;
  suggested_withdraw_amount: string | null;
  key_factors: string[];
  disclaimer: string;
}

export interface PortfolioAnalysis {
  overall_health: "Excellent" | "Good" | "Fair" | "Poor";
  portfolio_verdict: string;
  top_recommendation: string;
  diversification_score: number;
  risk_score: number;
  expected_return_range: string;
  best_asset: string;
  weakest_asset: string;
  alerts: string[];
  disclaimer: string;
}

export interface VoiceChartData {
  type: "bar" | "pie" | "line";
  title: string;
  data: Array<{ [key: string]: string | number }>;
}

export interface ConversationMessage {
  role: "user" | "ai";
  text: string;
  chart?: VoiceChartData | null;
}

export interface Toast {
  msg: string;
  type: "success" | "error";
}

export interface FormState {
  company: string;
  companyObj: CompanyData | null;
  sector: string;
  type: "Stock" | "ETF" | "Mutual Fund" | "Commodity" | "FD" | "Crypto";
  amount: string;
  duration: string;
  expectedProfit: string;
  notes: string;
}

export interface FinancialGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;           // YYYY-MM-DD
  priority: "High" | "Medium" | "Low";
  category: "Retirement" | "House" | "Education" | "Wedding" | "Car" | "Emergency" | "Other";
  monthlyContribution: number;
  aiSuggestion: string;
}

export interface TaxInsight {
  estimatedTaxLiability: number;
  taxSavingSuggestions: string[];
  recommendedInstruments: Array<{
    name: string;
    maxLimit: number;
    suggestedAmount: number;
    benefit: string;
  }>;
  lastUpdated: string;
}

export interface Alert {
  id: number;
  type: "price" | "news" | "portfolio" | "tax";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
}

export interface NewsSentiment {
  symbol: string;
  company: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  score: number; // -1.0 to 1.0
  keyHeadline: string;
  impact: string;
  reasoning: string;
  timestamp: string;
}

