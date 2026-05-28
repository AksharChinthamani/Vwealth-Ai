import { useState, useEffect, useRef } from "react";
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

import { Toast } from "./components/common/Toast";
import { Button } from "./components/common/Button";
import { Card } from "./components/common/Card";
import { VoiceChart } from "./components/charts/VoiceChart";
import { AddInvestmentForm } from "./components/portfolio/AddInvestmentForm";
import { InvestmentTable } from "./components/portfolio/InvestmentTable";
import { PortfolioSummary } from "./components/portfolio/PortfolioSummary";
import { AssetAnalysisCard } from "./components/analysis/AssetAnalysisCard";

import { usePortfolio } from "./hooks/usePortfolio";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";

import {
  saveUsers,
  loadUsers,
  savePortfolio,
  loadPortfolio,
  saveSession,
  loadSession,
} from "./utils/storage";
import {
  calculateTotalInvested,
  getSectorData,
  getProfitData,
  getMarketData,
  validateEmail,
  validatePassword,
} from "./utils/helpers";
import {
  INPUT_STYLE,
  COLORS,
  NAV_ITEMS,
} from "./utils/constants";
import {
  analyzeAssetAPI,
  analyzePortfolioAPI,
  askAIAssistant,
  analyzeTaxAPI,
  suggestGoalAPI,
} from "./services/geminiApi";
import { analyzePortfolioNews } from "./services/newsService";

import { User, Investment, AnalysisResult, PortfolioAnalysis, Toast as ToastType, FormState, FinancialGoal, TaxInsight, Alert, NewsSentiment } from "./types";
import { NSE_COMPANIES } from "./data/nseCompanies";

// New Components
import { GoalCard } from "./components/goals/GoalCard";
import { AddGoalForm } from "./components/goals/AddGoalForm";
import { TaxOptimizer } from "./components/tax/TaxOptimizer";
import { SmartAlerts } from "./components/alerts/SmartAlerts";
import { NewsSentimentPanel } from "./components/news/NewsSentimentPanel";

export default function App() {
  // Auth States
  const [screen, setScreen] = useState<"auth" | "onboard" | "app">("auth");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [creds, setCreds] = useState({
    name: "",
    email: "",
    password: "",
    role: "Retail Investor" as "Retail Investor" | "Startup Founder" | "Both",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Portfolio and Investment States
  const { investments, setInvestments } = usePortfolio();
  const [form, setForm] = useState<FormState>({
    company: "",
    companyObj: null,
    sector: "",
    type: "Stock",
    amount: "",
    duration: "",
    expectedProfit: "",
    notes: "",
  });
  const [companyError, setCompanyError] = useState("");

  // UI States
  const [nav, setNav] = useState<"dashboard" | "portfolio" | "analysis" | "add" | "goals" | "tax" | "news" | "alerts">("dashboard");
  const [toast, setToast] = useState<ToastType | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);

  // New Feature States
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [refreshingGoalId, setRefreshingGoalId] = useState<number | null>(null);
  const [taxInsight, setTaxInsight] = useState<TaxInsight | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newsSentiments, setNewsSentiments] = useState<NewsSentiment[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Analysis States
  const [analyses, setAnalyses] = useState<Record<number, AnalysisResult>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [portfolioAI, setPortfolioAI] = useState<PortfolioAnalysis | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Voice Assistant
  const {
    voiceState,
    setVoiceState,
    liveText,
    conversation,
    setConversation,
    startRecording,
    stopRecording,
    speak,
    addMessage,
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Check for Speech Recognition support
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setIsVoiceSupported(false);
  }, []);

  // Check auto-login on mount
  useEffect(() => {
    const initSession = async () => {
      const activeEmail = loadSession();
      if (activeEmail) {
        const users = await loadUsers();
        const found = users[activeEmail];
        if (found) {
          setUser(found);
          const saved = await loadPortfolio(activeEmail);
          setInvestments(saved);
          
          // Load goals
          const savedGoals = localStorage.getItem(`goals_${activeEmail}`);
          if (savedGoals) {
            try {
              setGoals(JSON.parse(savedGoals));
            } catch (e) {
              console.error("Failed to load goals", e);
            }
          }
          setScreen("app");
        }
      }
    };
    initSession();
  }, []);

  // Auto-save portfolio
  useEffect(() => {
    if (user?.email) {
      savePortfolio(user.email, investments);
    }
  }, [investments, user]);

  // Auto-save goals
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`goals_${user.email}`, JSON.stringify(goals));
    }
  }, [goals, user]);

  // Handlers
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSignup = async () => {
    const { name, email, password, role } = creds;
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast("Please fill all fields", "error");
      return;
    }
    if (!validateEmail(email)) {
      showToast("Enter a valid email address", "error");
      return;
    }
    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setAuthLoading(true);
    const users = await loadUsers();
    const key = email.toLowerCase().trim();

    if (users[key]) {
      showToast("Account already exists. Please login.", "error");
      setAuthLoading(false);
      return;
    }

    const newUser: User = { name: name.trim(), email: key, password, role };
    users[key] = newUser;
    await saveUsers(users);
    saveSession(key);

    setUser(newUser);
    setInvestments([]);
    setGoals([]);
    setAuthLoading(false);
    setScreen("onboard");
    showToast(`Welcome, ${name.trim()}! Account created.`);
  };

  const handleLogin = async () => {
    const { email, password } = creds;
    if (!email.trim() || !password.trim()) {
      showToast("Enter email and password", "error");
      return;
    }

    setAuthLoading(true);
    const users = await loadUsers();
    const key = email.toLowerCase().trim();
    const found = users[key];

    if (!found) {
      showToast("No account found. Please sign up.", "error");
      setAuthLoading(false);
      return;
    }

    if (found.password !== password) {
      showToast("Incorrect password.", "error");
      setAuthLoading(false);
      return;
    }

    const saved = await loadPortfolio(key);
    saveSession(key);
    setUser(found);
    setInvestments(saved);
    const savedGoals = localStorage.getItem(`goals_${key}`);
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error(e);
      }
    } else {
      setGoals([]);
    }
    setAuthLoading(false);
    setScreen("app");
    showToast(`Welcome back, ${found.name}!`);
  };

  const handleLogout = async () => {
    if (user?.email) {
      await savePortfolio(user.email, investments);
    }
    saveSession(null);
    setScreen("auth");
    setUser(null);
    setInvestments([]);
    setGoals([]);
    setAnalyses({});
    setPortfolioAI(null);
    setConversation([]);
    setCreds({ name: "", email: "", password: "", role: "Retail Investor" });
    window.speechSynthesis?.cancel();
  };

  const addInvestment = async () => {
    if (!form.company || !form.amount || !form.duration) {
      showToast("Company, Amount & Duration required", "error");
      return;
    }
    if (companyError) {
      showToast("Fix the company error first", "error");
      return;
    }
    if (!form.companyObj) {
      showToast("Select a valid NSE/BSE listed company", "error");
      return;
    }

    const inv: Investment = {
      id: Date.now(),
      company: form.company.trim(),
      symbol: form.companyObj.symbol,
      sector: form.sector.trim() || "General",
      type: form.type,
      amount: parseFloat(form.amount),
      duration: form.duration.trim(),
      expectedProfit: form.expectedProfit.trim(),
      notes: form.notes.trim(),
      addedOn: new Date().toLocaleDateString("en-IN"),
    };

    const updated = [...investments, inv];
    setInvestments(updated);
    await savePortfolio(user!.email, updated);

    setForm({
      company: "",
      companyObj: null,
      sector: "",
      type: "Stock",
      amount: "",
      duration: "",
      expectedProfit: "",
      notes: "",
    });
    setCompanyError("");

    showToast(`${inv.company} added!`);
    setNav("dashboard");
  };

  const removeInvestment = async (id: number, name: string) => {
    const updated = investments.filter((x) => x.id !== id);
    setInvestments(updated);
    await savePortfolio(user!.email, updated);
    showToast(`${name} removed`);
  };

  // Demo Alerts initializer
  useEffect(() => {
    if (user) {
      setAlerts([
        { id: 1, type: "price", title: "HDFC Bank Up 4%", message: "Strong quarterly results", severity: "medium", timestamp: new Date().toISOString(), read: false },
        { id: 2, type: "portfolio", title: "Portfolio Rebalancing Suggested", message: "Reduce heavy IT exposure", severity: "high", timestamp: new Date().toISOString(), read: false },
      ]);
    } else {
      setAlerts([]);
    }
  }, [user]);

  const addGoal = async (newGoalData: Omit<FinancialGoal, "id">) => {
    setGoalsLoading(true);
    try {
      const suggestionResult = await suggestGoalAPI(
        user?.name || "User",
        investments,
        {
          title: newGoalData.title,
          targetAmount: newGoalData.targetAmount,
          deadline: newGoalData.deadline,
          category: newGoalData.category,
          priority: newGoalData.priority
        }
      );
      
      const newGoal: FinancialGoal = {
        ...newGoalData,
        id: Date.now(),
        monthlyContribution: suggestionResult.monthlyContribution,
        aiSuggestion: suggestionResult.aiSuggestion
      };
      
      setGoals([...goals, newGoal]);
      setShowAddGoal(false);
      showToast(`Goal "${newGoal.title}" created with AI suggestions!`);
    } catch (error: any) {
      console.error(error);
      const monthsLeft = Math.max(1, Math.ceil(
        (new Date(newGoalData.deadline).getTime() - Date.now()) / (1000 * 3600 * 24 * 30)
      ));
      const fallbackGoal: FinancialGoal = {
        ...newGoalData,
        id: Date.now(),
        monthlyContribution: Math.round(newGoalData.targetAmount / monthsLeft),
        aiSuggestion: `Based on your goal, you should save ₹${Math.round(newGoalData.targetAmount / monthsLeft)} monthly. (API fallback)`
      };
      setGoals([...goals, fallbackGoal]);
      setShowAddGoal(false);
      showToast(`Goal "${fallbackGoal.title}" created!`);
    } finally {
      setGoalsLoading(false);
    }
  };

  const handleEditGoal = (goalToEdit: FinancialGoal) => {
    const newAmountStr = prompt(`Enter new current amount for "${goalToEdit.title}":`, goalToEdit.currentAmount.toString());
    if (newAmountStr === null) return;
    const newAmount = parseInt(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      showToast("Please enter a valid positive number", "error");
      return;
    }
    setGoals(prev => prev.map(g => g.id === goalToEdit.id ? { ...g, currentAmount: newAmount } : g));
    showToast(`Updated progress for "${goalToEdit.title}"!`);
  };

  const refreshGoalAI = async (goalToRefresh: FinancialGoal) => {
    setRefreshingGoalId(goalToRefresh.id);
    try {
      const suggestionResult = await suggestGoalAPI(
        user?.name || "User",
        investments,
        {
          title: goalToRefresh.title,
          targetAmount: goalToRefresh.targetAmount,
          deadline: goalToRefresh.deadline,
          category: goalToRefresh.category,
          priority: goalToRefresh.priority
        }
      );
      setGoals(prev => prev.map(g => g.id === goalToRefresh.id ? {
        ...g,
        monthlyContribution: suggestionResult.monthlyContribution,
        aiSuggestion: suggestionResult.aiSuggestion
      } : g));
      showToast(`AI suggestion refreshed for "${goalToRefresh.title}"!`);
    } catch (error: any) {
      console.error(error);
      showToast("Failed to refresh goal advice: " + error.message, "error");
    } finally {
      setRefreshingGoalId(null);
    }
  };

  const analyzeTax = async () => {
    if (investments.length === 0) {
      showToast("Please add investments to perform tax optimization analysis", "error");
      return;
    }
    setTaxLoading(true);
    try {
      const insight = await analyzeTaxAPI(
        user?.name || "User",
        user?.role || "Retail Investor",
        investments
      );
      setTaxInsight(insight);
      showToast("Tax analysis completed!");
    } catch (e: any) {
      console.error(e);
      showToast("Failed to analyze tax: " + e.message, "error");
    } finally {
      setTaxLoading(false);
    }
  };

  const refreshNewsSentiment = async () => {
    if (investments.length === 0) {
      showToast("Add investments first to analyze sentiment", "error");
      return;
    }
    setNewsLoading(true);
    try {
      const result = await analyzePortfolioNews(investments);
      setNewsSentiments(result);
      showToast("Market sentiment analysis updated!");
    } catch (e: any) {
      console.error(e);
      showToast("Failed to analyze sentiment: " + e.message, "error");
    } finally {
      setNewsLoading(false);
    }
  };

  const markAlertRead = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    showToast("Alert marked as read");
  };

  const analyzeAsset = async (inv: Investment) => {
    setLoadingId(inv.id);
    setNav("analysis");

    try {
      const result = await analyzeAssetAPI(
        user?.name || "User",
        inv.company,
        inv.symbol,
        inv.sector,
        inv.type,
        inv.amount,
        inv.duration,
        inv.expectedProfit
      );
      setAnalyses((p) => ({ ...p, [inv.id]: result }));
    } catch (e) {
      console.error("analyzeAsset error:", e);
      showToast("AI analysis failed: " + (e as Error).message, "error");
      setAnalyses((p) => ({
        ...p,
        [inv.id]: {
          recommendation: "HOLD",
          verdict: "Analysis failed. Please retry.",
          reasoning: (e as Error).message,
          risk_level: "Medium",
          profit_probability: 50,
          loss_probability: 50,
          action: "Retry analysis",
          suggested_increase_amount: null,
          suggested_withdraw_amount: null,
          key_factors: ["Connection issue"],
          disclaimer: "Not financial advice.",
        },
      }));
    }
    setLoadingId(null);
  };

  const analyzeFullPortfolio = async () => {
    if (!investments.length) {
      showToast("Add investments first", "error");
      return;
    }

    setLoadingPortfolio(true);
    try {
      const result = await analyzePortfolioAPI(
        user?.name || "User",
        user?.role || "Retail Investor",
        investments
      );
      setPortfolioAI(result);
    } catch (e) {
      console.error("analyzeFullPortfolio error:", e);
      showToast("Portfolio AI failed: " + (e as Error).message, "error");
      setPortfolioAI({
        overall_health: "Fair",
        portfolio_verdict: "Analysis unavailable. Please retry.",
        top_recommendation: "Retry analysis",
        diversification_score: 5,
        risk_score: 5,
        expected_return_range: "N/A",
        best_asset: "N/A",
        weakest_asset: "N/A",
        alerts: ["Connection issue — " + (e as Error).message],
        disclaimer: "Not financial advice.",
      });
    }
    setLoadingPortfolio(false);
  };

  const askAI = async (query: string) => {
    addMessage({ role: "user", text: query });
    setTextInput("");

    try {
      const result = await askAIAssistant(
        user?.name || "User",
        query,
        investments
      );

      const chart =
        result.chart_type !== "none" && result.chart_data?.length
          ? { type: result.chart_type as any, title: result.chart_title, data: result.chart_data }
          : null;

      addMessage({ role: "ai", text: result.spoken || "I processed your request.", chart });
      setVoiceState("speaking");
      if (result.spoken) speak(result.spoken);
    } catch (e) {
      const msg = "AI connection issue: " + (e as Error).message;
      addMessage({ role: "ai", text: msg, chart: null });
      setVoiceState("idle");
      showToast(msg, "error");
    }
  };

  const sendText = () => {
    if (!textInput.trim() || voiceState === "thinking") return;
    const q = textInput.trim();
    setTextInput("");
    setVoiceState("thinking");
    askAI(q);
  };

  const handleRecording = () => {
    startRecording((text: string) => {
      askAI(text);
    });
  };

  // Computed data
  const totalInvested = calculateTotalInvested(investments);
  const sectorData = getSectorData(investments);
  const profitData = getProfitData(investments);
  const marketData = getMarketData(investments);

  // Validate company
  const validateCompany = (name: string) => {
    if (!name.trim()) return;
    const found = NSE_COMPANIES.find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() ||
        c.symbol.toLowerCase() === name.toLowerCase()
    );
    if (!found) {
      setCompanyError(`"${name}" is not listed on NSE or BSE.`);
      setForm((f) => ({ ...f, companyObj: null }));
    } else {
      setCompanyError("");
      setForm((f) => ({ ...f, companyObj: found, sector: found.sector }));
    }
  };

  // Auth Screen
  if (screen === "auth") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI',sans-serif",
        }}
      >
        <Toast toast={toast} />
        <div
          style={{
            width: 420,
            background: "#fff",
            borderRadius: 24,
            padding: "44px 40px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VwealtH AI
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
              Your Personal AI Financial Advisor
            </div>
          </div>

          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {["signup", "login"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setAuthMode(m as "signup" | "login");
                  setCreds({ name: "", email: "", password: "", role: "Retail Investor" });
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  background:
                    authMode === m
                      ? "linear-gradient(90deg,#6C63FF,#00D4AA)"
                      : "transparent",
                  color: authMode === m ? "#fff" : "#94a3b8",
                  transition: "all 0.25s",
                }}
              >
                {m === "signup" ? "Sign Up" : "Login"}
              </button>
            ))}
          </div>

          {authMode === "signup" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Full Name *", ph: "Enter your full name", k: "name", type: "text" },
                { label: "Email Address *", ph: "Enter your email ID", k: "email", type: "email" },
                { label: "Password * (min 6 chars)", ph: "Enter your password", k: "password", type: "password" },
              ].map((f) => (
                <div key={f.k}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>
                    {f.label}
                  </div>
                  <input
                    placeholder={f.ph}
                    type={f.type}
                    value={creds[f.k as keyof typeof creds]}
                    onChange={(e) =>
                      setCreds((p) => ({ ...p, [f.k]: e.target.value }))
                    }
                    style={INPUT_STYLE}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>
                  Investor Role
                </div>
                <select
                  value={creds.role}
                  onChange={(e) =>
                    setCreds((p) => ({ ...p, role: e.target.value as any }))
                  }
                  style={INPUT_STYLE}
                >
                  <option>Retail Investor</option>
                  <option>Startup Founder</option>
                  <option>Both</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Email Address *", ph: "Enter your registered email", k: "email", type: "email" },
                { label: "Password *", ph: "Enter your password", k: "password", type: "password" },
              ].map((f) => (
                <div key={f.k}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>
                    {f.label}
                  </div>
                  <input
                    placeholder={f.ph}
                    type={f.type}
                    value={creds[f.k as keyof typeof creds]}
                    onChange={(e) =>
                      setCreds((p) => ({ ...p, [f.k]: e.target.value }))
                    }
                    style={INPUT_STYLE}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={authMode === "signup" ? handleSignup : handleLogin}
            disabled={authLoading}
            style={{ width: "100%", padding: "13px 0", fontSize: 15, marginTop: 22 }}
          >
            {authLoading
              ? "⟳ Please wait..."
              : authMode === "signup"
                ? "Create My Account →"
                : "Login to My Account →"}
          </Button>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
            {authMode === "signup" ? "Already have an account? " : "Don't have an account? "}
            <span
              onClick={() => {
                setAuthMode(authMode === "signup" ? "login" : "signup");
                setCreds({ name: "", email: "", password: "", role: "Retail Investor" });
              }}
              style={{ color: "#6C63FF", fontWeight: 700, cursor: "pointer" }}
            >
              {authMode === "signup" ? "Login" : "Sign Up"}
            </span>
          </div>

          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 10 }}>
            🔒 Your credentials and portfolio are saved securely
          </p>
        </div>
      </div>
    );
  }

  // Onboard Screen
  if (screen === "onboard") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI',sans-serif",
          padding: 20,
        }}
      >
        <Toast toast={toast} />
        <div
          style={{
            width: 500,
            background: "#fff",
            borderRadius: 24,
            padding: "40px 36px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 4,
            }}
          >
            Welcome, {user?.name}! 👋
          </div>
          <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 22 }}>
            Add your first investment to get started.
          </div>

          <AddInvestmentForm
            form={form}
            onFormChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
            onCompanySelect={(company) =>
              setForm((f) => ({ ...f, companyObj: company, sector: company.sector }))
            }
            onCompanyValidate={validateCompany}
            companyError={companyError}
            onAdd={addInvestment}
            onSkip={() => setScreen("app")}
            isOnboarding
          />
        </div>
      </div>
    );
  }

  // Main App Screen
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f8",
        fontFamily: "'Segoe UI',sans-serif",
        color: "#1a1a2e",
        display: "flex",
      }}
    >
      <Toast toast={toast} />

      {/* VOICE PANEL */}
      {voiceOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: 400,
            height: "100vh",
            background: "#fff",
            zIndex: 500,
            boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>
                🤖 VwealtH AI Assistant
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                  marginTop: 2,
                }}
              >
                Ask me about your portfolio
              </div>
            </div>
            <button
              onClick={() => {
                setVoiceOpen(false);
                window.speechSynthesis?.cancel();
              }}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              padding: "10px 16px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  voiceState === "recording"
                    ? "#FF6B6B"
                    : voiceState === "thinking"
                      ? "#6C63FF"
                      : voiceState === "speaking"
                        ? "#00D4AA"
                        : "#94a3b8",
                boxShadow:
                  voiceState === "recording"
                    ? "0 0 0 4px rgba(255,107,107,0.25)"
                    : "none",
                transition: "all 0.3s",
              }}
            />
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
              {voiceState === "idle"
                ? "Ready"
                : voiceState === "recording"
                  ? "🔴 Recording..."
                  : voiceState === "thinking"
                    ? "⟳ Thinking..."
                    : "🔊 Speaking..."}
            </span>
          </div>

          {liveText && (
            <div
              style={{
                padding: "10px 16px",
                background: "rgba(108,99,255,0.05)",
                borderBottom: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#6C63FF",
                fontStyle: "italic",
              }}
            >
              Hearing: "{liveText}"
            </div>
          )}

          {conversation.length === 0 && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                TRY ASKING:
              </div>
              {[
                "Compare my investments",
                "Show my expected profits",
                "Which sector am I most in?",
                "Show market vs invested value",
                "What is my total invested?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setVoiceState("thinking");
                    askAI(suggestion);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    marginBottom: 6,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 12,
                    color: "#6C63FF",
                    fontWeight: 600,
                  }}
                >
                  💬 {suggestion}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {conversation.map((msg, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(90deg,#6C63FF,#00D4AA)"
                          : "#f1f5f9",
                      color: msg.role === "user" ? "#fff" : "#1a1a2e",
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.role === "ai" && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#6C63FF",
                          fontWeight: 800,
                          marginBottom: 4,
                        }}
                      >
                        VWEALTH AI
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
                {msg.chart && <VoiceChart chart={msg.chart} />}
              </div>
            ))}
            {voiceState === "thinking" && (
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#f1f5f9",
                    fontSize: 13,
                    color: "#6C63FF",
                  }}
                >
                  ⟳ Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "12px 14px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                placeholder="Type your question here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendText()}
                style={{ ...INPUT_STYLE, flex: 1, padding: "9px 12px", fontSize: 13 }}
              />
              <button
                onClick={sendText}
                disabled={!textInput.trim() || voiceState === "thinking"}
                style={{
                  padding: "9px 14px",
                  background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  opacity:
                    !textInput.trim() || voiceState === "thinking" ? 0.6 : 1,
                }}
              >
                Send
              </button>
            </div>
            <button
              onMouseDown={handleRecording}
              onMouseUp={stopRecording}
              onTouchStart={handleRecording}
              onTouchEnd={stopRecording}
              disabled={voiceState === "thinking" || voiceState === "speaking" || !isVoiceSupported}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                background:
                  voiceState === "recording"
                    ? "linear-gradient(90deg,#FF6B6B,#FF8E53)"
                    : "linear-gradient(90deg,#6C63FF,#00D4AA)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(108,99,255,0.3)",
              }}
            >
              {!isVoiceSupported
                ? "🎙️ Speech Not Supported"
                : voiceState === "recording"
                  ? "🔴 Recording... Release to send"
                  : voiceState === "thinking"
                    ? "⟳ Processing..."
                    : voiceState === "speaking"
                      ? "🔊 Speaking..."
                      : "🎤 Hold to Speak"}
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: 10,
                color: "#94a3b8",
                marginTop: 6,
              }}
            >
              Hold and speak, then release — or type above
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div
        style={{
          width: 210,
          background: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          padding: "26px 14px",
          position: "fixed",
          height: "100vh",
          zIndex: 10,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 30,
            paddingLeft: 8,
          }}
        >
          VwealtH AI
        </div>

        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => setNav(n.id as any)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              marginBottom: 4,
              background: nav === n.id ? "rgba(108,99,255,0.2)" : "transparent",
              color: nav === n.id ? "#a78bfa" : "#666",
              fontWeight: nav === n.id ? 700 : 400,
              fontSize: 14,
              textAlign: "left",
              borderLeft:
                nav === n.id ? "3px solid #6C63FF" : "3px solid transparent",
            }}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}

        <button
          onClick={() => setVoiceOpen((v) => !v)}
          style={{
            marginTop: 16,
            padding: "14px 12px",
            borderRadius: 12,
            background: voiceOpen
              ? "rgba(0,212,170,0.15)"
              : "rgba(108,99,255,0.15)",
            border: `1px solid ${
              voiceOpen ? "rgba(0,212,170,0.4)" : "rgba(108,99,255,0.3)"
            }`,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>🤖</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
            Hey AI
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
            Chat or speak
          </div>
        </button>

        <div
          style={{
            marginTop: "auto",
            padding: "14px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>
            Logged in as
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#e0e0ff",
              wordBreak: "break-word",
            }}
          >
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
            {user?.role}
          </div>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 11,
              color: "#FF6B6B",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: 210,
          flex: 1,
          padding: "28px 26px",
          overflowY: "auto",
          marginRight: voiceOpen ? 400 : 0,
          transition: "margin-right 0.3s",
        }}
      >
        {/* DASHBOARD */}
        {nav === "dashboard" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  Hello, {user?.name}! 👋
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                  Your investment overview
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  onClick={() => setVoiceOpen(true)}
                  style={{ fontSize: 13, padding: "9px 16px" }}
                >
                  🤖 Hey AI
                </Button>
                <Button
                  onClick={() => setNav("add")}
                  variant="outline"
                  style={{ fontSize: 13, padding: "9px 16px" }}
                >
                  + Add Investment
                </Button>
              </div>
            </div>

            {investments.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  No investments yet
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    marginBottom: 24,
                  }}
                >
                  Add your first investment to get AI-powered insights
                </div>
                <Button onClick={() => setNav("add")}>
                  Add Your First Investment →
                </Button>
              </Card>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 16,
                    marginBottom: 22,
                  }}
                >
                  {[
                    {
                      label: "Total Invested",
                      value: `₹${totalInvested.toLocaleString("en-IN")}`,
                      sub: `${investments.length} investments`,
                      color: "#6C63FF",
                      icon: "💰",
                    },
                    {
                      label: "Sectors",
                      value: new Set(investments.map((i) => i.sector)).size,
                      sub: [...new Set(investments.map((i) => i.sector))]
                        .slice(0, 2)
                        .join(", "),
                      color: "#00D4AA",
                      icon: "🏭",
                    },
                    {
                      label: "Asset Types",
                      value: new Set(investments.map((i) => i.type)).size,
                      sub: [...new Set(investments.map((i) => i.type))].join(
                        ", "
                      ),
                      color: "#FFB347",
                      icon: "📊",
                    },
                  ].map((s, i) => (
                    <Card
                      key={i}
                      style={{ borderTop: `4px solid ${s.color}` }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 8 }}>
                        {s.icon}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: s.color,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: 11,
                          marginTop: 3,
                        }}
                      >
                        {s.sub}
                      </div>
                    </Card>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                    marginBottom: 18,
                  }}
                >
                  <Card>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 14,
                      }}
                    >
                      📊 Investment by Sector
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          dataKey="value"
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {sectorData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={COLORS[i % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) =>
                            `₹${(v as number).toLocaleString("en-IN")}`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      {sectorData.map((d, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 10,
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: COLORS[i % COLORS.length],
                              display: "inline-block",
                            }}
                          />
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 14,
                      }}
                    >
                      💹 Invested vs Expected Profit
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={profitData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          tickFormatter={(v) =>
                            `₹${(v / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          formatter={(v) =>
                            `₹${(v as number).toLocaleString("en-IN")}`
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="Invested"
                          fill="#6C63FF"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="Exp.Profit"
                          fill="#00D4AA"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 14,
                    }}
                  >
                    📈 Market Valuation vs Invested
                  </div>
                  <ResponsiveContainer width="100%" height={170}>
                    <LineChart data={marketData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(v) =>
                          `₹${(v as number).toLocaleString("en-IN")}`
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Invested"
                        stroke="#6C63FF"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Market Value"
                        stroke="#00D4AA"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <PortfolioSummary
                  investments={investments}
                  portfolioAnalysis={portfolioAI}
                  isLoading={loadingPortfolio}
                  onAnalyzePortfolio={analyzeFullPortfolio}
                  onAnalyzeAsset={analyzeAsset}
                />
              </>
            )}
          </div>
        )}

        {/* PORTFOLIO */}
        {nav === "portfolio" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22 }}>
              📋 Your Portfolio
            </div>
            <InvestmentTable
              investments={investments}
              onAnalyze={analyzeAsset}
              onRemove={removeInvestment}
            />
          </div>
        )}

        {/* AI ANALYSIS */}
        {nav === "analysis" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22 }}>
              🤖 AI Investment Analysis
            </div>
            {investments.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 50 }}>
                <div style={{ color: "#64748b" }}>
                  No investments to analyze.{" "}
                  <span
                    style={{
                      color: "#6C63FF",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                    onClick={() => setNav("add")}
                  >
                    Add one →
                  </span>
                </div>
              </Card>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 18,
                }}
              >
                {investments.map((inv) => (
                  <AssetAnalysisCard
                    key={inv.id}
                    investment={inv}
                    analysis={analyses[inv.id] || null}
                    isLoading={loadingId === inv.id}
                    onAnalyze={analyzeAsset}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD INVESTMENT */}
        {nav === "add" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22 }}>
              ＋ Add New Investment
            </div>
            <AddInvestmentForm
              form={form}
              onFormChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
              onCompanySelect={(company) =>
                setForm((f) => ({ ...f, companyObj: company, sector: company.sector }))
              }
              onCompanyValidate={validateCompany}
              companyError={companyError}
              onAdd={addInvestment}
            />
          </div>
        )}

        {/* FINANCIAL GOALS */}
        {nav === "goals" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>🎯 Financial Goals</div>
              <button
                onClick={() => setShowAddGoal(true)}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(90deg,#6C63FF,#00D4AA)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(108,99,255,0.2)",
                }}
              >
                + New Goal
              </button>
            </div>

            {showAddGoal && (
              <div style={{ marginBottom: 24 }}>
                <AddGoalForm onAdd={addGoal} onCancel={() => setShowAddGoal(false)} isLoading={goalsLoading} />
              </div>
            )}

            {goals.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <div style={{ color: "#64748b" }}>
                  No goals created yet. Click "+ New Goal" to start planning.
                </div>
              </Card>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEditGoal}
                    onRefreshAI={refreshGoalAI}
                    isRefreshingAI={refreshingGoalId === goal.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAX OPTIMIZER */}
        {nav === "tax" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22, color: "#1a1a2e" }}>
              🧾 Tax Optimizer
            </div>
            <TaxOptimizer
              taxInsight={taxInsight}
              isLoading={taxLoading}
              onAnalyzeTax={analyzeTax}
            />
          </div>
        )}

        {/* NEWS SENTIMENT */}
        {nav === "news" && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22, color: "#1a1a2e" }}>
              📰 News Sentiment Analysis
            </div>
            <NewsSentimentPanel
              sentiments={newsSentiments}
              isLoading={newsLoading}
              onRefresh={refreshNewsSentiment}
            />
          </div>
        )}

        {/* SMART ALERTS */}
        {nav === "alerts" && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 22, color: "#1a1a2e" }}>
              🛎️ Smart Alerts Feed
            </div>
            <SmartAlerts alerts={alerts} onMarkRead={markAlertRead} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
        input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
